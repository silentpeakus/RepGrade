"""Pose extraction layer.

Wraps MediaPipe Pose. Turns a video file into a list of per-frame keypoints.
This is the only module that touches MediaPipe directly — everything downstream
(rep detection, rubric scoring) operates on the plain dicts produced here, so the
pose backend can be swapped later without rewriting the grading logic.
"""

from __future__ import annotations

import statistics

import cv2
import mediapipe as mp

from .frame import Frame

# MediaPipe Pose landmark indices we care about for sagittal-plane lifts.
# (Full list: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
_LANDMARKS = {
    "shoulder": (11, 12),
    "hip": (23, 24),
    "knee": (25, 26),
    "ankle": (27, 28),
    "heel": (29, 30),
    "foot_index": (31, 32),
}


def _pick_side(side_visibility: dict) -> int:
    """Side-view footage shows one side of the body. Pick whichever side
    (0 = left landmarks, 1 = right landmarks) MediaPipe saw more confidently
    across the whole clip, and use it consistently."""
    left = side_visibility.get(0, 0.0)
    right = side_visibility.get(1, 0.0)
    return 0 if left >= right else 1


def _orientation_ratio(lms) -> float | None:
    """Width-to-height ratio of the torso for one frame.

    In a side (sagittal) view the left/right shoulders and hips line up in depth,
    so their horizontal spread is small. In a front view they spread wide. Dividing
    by torso height normalizes for how far the person is from the camera, so the
    ratio is a scale-free proxy for camera angle. Low = side-on; high = front-on.
    """
    L = lms.landmark
    shoulder_w = abs(L[11].x - L[12].x)
    hip_w = abs(L[23].x - L[24].x)
    mid_shoulder_y = (L[11].y + L[12].y) / 2
    mid_hip_y = (L[23].y + L[24].y) / 2
    torso_h = abs(mid_shoulder_y - mid_hip_y)
    if torso_h < 1e-4:
        return None
    return max(shoulder_w, hip_w) / torso_h


def extract_frames(video_path: str) -> tuple[list[Frame], float, dict]:
    """Run MediaPipe Pose over a video. Returns (frames, fps, meta).

    Two passes: the first tallies which body side is more visible, the second
    builds the keypoint series using that side, so a single squat is graded off
    one consistent side rather than flickering between left/right keypoints.

    `meta` carries pre-flight signals (camera orientation, pose coverage,
    resolution) consumed by app.preflight before any grading happens.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    mp_pose = mp.solutions.pose
    raw: list[tuple[float, object]] = []
    side_visibility: dict[int, float] = {0: 0.0, 1: 0.0}
    orientation_ratios: list[float] = []

    with mp_pose.Pose(model_complexity=1, min_detection_confidence=0.5) as pose:
        idx = 0
        while True:
            ok, image = cap.read()
            if not ok:
                break
            t = idx / fps
            idx += 1
            result = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            lms = result.pose_landmarks
            raw.append((t, lms))
            if lms is None:
                continue
            # Tally side visibility using hip+knee+ankle as the reference joints.
            for side in (0, 1):
                vis = 0.0
                for name in ("hip", "knee", "ankle"):
                    vis += lms.landmark[_LANDMARKS[name][side]].visibility
                side_visibility[side] += vis
            r = _orientation_ratio(lms)
            if r is not None:
                orientation_ratios.append(r)
    cap.release()

    total = len(raw)
    detected = sum(1 for _, lms in raw if lms is not None)
    meta = {
        "frame_width": frame_w,
        "frame_height": frame_h,
        "total_frames": total,
        "pose_coverage": round(detected / total, 3) if total else 0.0,
        "orientation_ratio": round(statistics.median(orientation_ratios), 3) if orientation_ratios else None,
    }

    side = _pick_side(side_visibility)
    frames: list[Frame] = []
    for t, lms in raw:
        if lms is None:
            frames.append(Frame(t=t, points={}))
            continue
        points = {}
        for name, (li, ri) in _LANDMARKS.items():
            lm = lms.landmark[li if side == 0 else ri]
            points[name] = (lm.x, lm.y, lm.visibility)
        frames.append(Frame(t=t, points=points))

    return frames, fps, meta

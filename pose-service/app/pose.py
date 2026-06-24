"""Pose extraction layer.

Wraps MediaPipe Pose Landmarker (new Tasks API, mediapipe>=0.10.14).
Turns a video file into a list of per-frame keypoints.
This is the only module that touches MediaPipe directly.
"""

from __future__ import annotations

import os
import statistics
import urllib.request

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from .frame import Frame

# MediaPipe Pose landmark indices (same as before).
_LANDMARKS = {
    "shoulder": (11, 12),
    "hip": (23, 24),
    "knee": (25, 26),
    "ankle": (27, 28),
    "heel": (29, 30),
    "foot_index": (31, 32),
}

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker.task")


def _ensure_model() -> str:
    if not os.path.exists(MODEL_PATH):
        print(f"Downloading pose model to {MODEL_PATH} ...", flush=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    return MODEL_PATH


def _pick_side(side_visibility: dict) -> int:
    left = side_visibility.get(0, 0.0)
    right = side_visibility.get(1, 0.0)
    return 0 if left >= right else 1


def _orientation_ratio(landmarks) -> float | None:
    shoulder_w = abs(landmarks[11].x - landmarks[12].x)
    hip_w = abs(landmarks[23].x - landmarks[24].x)
    mid_shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
    mid_hip_y = (landmarks[23].y + landmarks[24].y) / 2
    torso_h = abs(mid_shoulder_y - mid_hip_y)
    if torso_h < 1e-4:
        return None
    return max(shoulder_w, hip_w) / torso_h


def extract_frames(video_path: str) -> tuple[list[Frame], float, dict]:
    model_path = _ensure_model()

    base_options = mp_python.BaseOptions(model_asset_path=model_path)
    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        output_segmentation_masks=False,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        running_mode=mp_vision.RunningMode.VIDEO,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    raw: list[tuple[float, list | None]] = []
    side_visibility: dict[int, float] = {0: 0.0, 1: 0.0}
    orientation_ratios: list[float] = []

    with mp_vision.PoseLandmarker.create_from_options(options) as landmarker:
        idx = 0
        while True:
            ok, image = cap.read()
            if not ok:
                break
            t = idx / fps
            timestamp_ms = int(t * 1000)
            idx += 1

            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            if not result.pose_landmarks:
                raw.append((t, None))
                continue

            landmarks = result.pose_landmarks[0]
            raw.append((t, landmarks))

            for side in (0, 1):
                vis = 0.0
                for name in ("hip", "knee", "ankle"):
                    vis += landmarks[_LANDMARKS[name][side]].visibility
                side_visibility[side] += vis

            r = _orientation_ratio(landmarks)
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
    for t, landmarks in raw:
        if landmarks is None:
            frames.append(Frame(t=t, points={}))
            continue
        points = {}
        for name, (li, ri) in _LANDMARKS.items():
            lm = landmarks[li if side == 0 else ri]
            points[name] = (lm.x, lm.y, lm.visibility)
        frames.append(Frame(t=t, points=points))

    return frames, fps, meta

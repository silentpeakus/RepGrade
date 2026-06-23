"""Pre-flight validation (Project_Specifications_2.md S3 step 2 / S8).

Runs BEFORE grading. Catches inputs that would produce a confidently-wrong grade
— wrong camera angle, person not reliably detected, resolution too low — and
returns specific re-shoot guidance instead of a meaningless score.

Dependency-free: operates on the plain `meta` dict from pose.extract_frames, so
it is unit-testable without MediaPipe.

CALIBRATION NOTE: thresholds here are Phase 0 hypotheses, like the rubric ones.
They were seeded from a known front-view squat clip that must be rejected and a
synthetic side-view baseline; tune against real footage before trusting them.
"""

from __future__ import annotations

# --- Phase 0 calibration constants ---
SIDE_VIEW_MAX_RATIO = 0.18       # torso width/height at or below this = side-on (good)
FRONT_VIEW_MIN_RATIO = 0.28      # at or above this = front-on (reject for sagittal lifts)
MIN_POSE_COVERAGE = 0.60         # fraction of frames a person must be detected in
MIN_RESOLUTION_SHORT_SIDE = 360  # shorter image dimension; below this, pose jitter is high

# Exercises graded in the sagittal (side) plane — these require a side view.
SAGITTAL_EXERCISES = {
    "back_squat", "squat", "deadlift", "romanian_deadlift", "bench_press",
    "overhead_press", "incline_dumbbell_press", "barbell_row",
}


def classify_view(orientation_ratio: float | None) -> str:
    """Map the torso width/height ratio to a camera view label."""
    if orientation_ratio is None:
        return "unknown"
    if orientation_ratio <= SIDE_VIEW_MAX_RATIO:
        return "side"
    if orientation_ratio >= FRONT_VIEW_MIN_RATIO:
        return "front"
    return "angled"


def check(meta: dict, exercise: str) -> dict:
    """Decide whether a clip is gradeable. Returns:
        {ok: bool, view: str, issues: [{code, message}], meta_echo: {...}}
    Each issue carries athlete-facing re-shoot guidance, not a generic error.
    """
    issues: list[dict] = []
    view = classify_view(meta.get("orientation_ratio"))
    needs_side = exercise.strip().lower().replace(" ", "_") in SAGITTAL_EXERCISES

    # 1. Person actually detected for enough of the clip.
    coverage = meta.get("pose_coverage", 0.0)
    if coverage < MIN_POSE_COVERAGE:
        issues.append({
            "code": "low_pose_coverage",
            "message": (
                f"We could only track a person in {round(coverage * 100)}% of the video. "
                "Make sure your whole body stays in frame for the entire set, with good lighting."
            ),
        })

    # 2. Camera angle matches what the exercise rubric needs.
    if needs_side and view in ("front", "angled"):
        issues.append({
            "code": "wrong_camera_angle",
            "message": (
                "This looks like a front/angled view. Film this lift from the side "
                "(camera facing your profile) so depth and back angle can be measured."
            ),
        })
    elif needs_side and view == "unknown":
        issues.append({
            "code": "angle_undetermined",
            "message": "Could not determine the camera angle — re-film from a clear side-on view.",
        })

    # 3. Resolution high enough for stable keypoints.
    short_side = min(meta.get("frame_width", 0), meta.get("frame_height", 0))
    if short_side and short_side < MIN_RESOLUTION_SHORT_SIDE:
        issues.append({
            "code": "low_resolution",
            "message": (
                f"Video resolution is low ({meta.get('frame_width')}x{meta.get('frame_height')}). "
                "Record at 720p or higher for accurate form tracking."
            ),
        })

    return {
        "ok": len(issues) == 0,
        "view": view,
        "issues": issues,
        "meta_echo": {
            "orientation_ratio": meta.get("orientation_ratio"),
            "pose_coverage": coverage,
            "resolution": f"{meta.get('frame_width')}x{meta.get('frame_height')}",
        },
    }

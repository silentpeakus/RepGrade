"""Unit tests for pre-flight validation (no MediaPipe needed).

Run: python test_preflight.py
"""

from app import preflight


def main():
    # Side-on, well-detected, decent res -> accepted.
    ok = preflight.check(
        {"orientation_ratio": 0.10, "pose_coverage": 0.95, "frame_width": 720, "frame_height": 1280},
        "back_squat",
    )
    print("side-on squat:", ok["ok"], ok["view"], [i["code"] for i in ok["issues"]])
    assert ok["ok"] and ok["view"] == "side"

    # Front-on squat -> rejected for wrong angle.
    front = preflight.check(
        {"orientation_ratio": 0.42, "pose_coverage": 0.95, "frame_width": 720, "frame_height": 1280},
        "back_squat",
    )
    print("front-on squat:", front["ok"], front["view"], [i["code"] for i in front["issues"]])
    assert not front["ok"]
    assert any(i["code"] == "wrong_camera_angle" for i in front["issues"])

    # Low resolution side-on -> rejected for resolution.
    lowres = preflight.check(
        {"orientation_ratio": 0.10, "pose_coverage": 0.95, "frame_width": 202, "frame_height": 360},
        "back_squat",
    )
    print("low-res side:", lowres["ok"], [i["code"] for i in lowres["issues"]])
    assert not lowres["ok"]
    assert any(i["code"] == "low_resolution" for i in lowres["issues"])

    # Person barely detected -> rejected for coverage.
    sparse = preflight.check(
        {"orientation_ratio": 0.10, "pose_coverage": 0.30, "frame_width": 720, "frame_height": 1280},
        "back_squat",
    )
    print("sparse pose:", sparse["ok"], [i["code"] for i in sparse["issues"]])
    assert not sparse["ok"]
    assert any(i["code"] == "low_pose_coverage" for i in sparse["issues"])

    print("\nAll pre-flight checks passed.")


if __name__ == "__main__":
    main()

"""Synthetic self-test for the squat grading logic.

Builds fake side-view keypoint series (no MediaPipe needed) and asserts rep
detection, depth, and heel-lift behave per the rubric. This validates squat.py
in isolation; pose.py is exercised separately once a real video is available.

Run: python test_squat_synthetic.py
"""

import math

from app.frame import Frame
from app.squat import analyze_squat


def make_rep_frames(n_reps, fps=30, deep=True, heel_lift=False):
    """One standing->bottom->standing cycle per rep.
    y grows downward; hip_y rises as the lifter descends."""
    frames = []
    t = 0.0
    dt = 1.0 / fps
    per_half = 15  # frames descending, then 15 ascending
    knee_y = 0.60  # fixed knee height (top of knee)
    for _ in range(n_reps):
        for phase in ("down", "up"):
            rng = range(per_half) if phase == "down" else range(per_half, 0, -1)
            for k in rng:
                frac = k / per_half
                # hip travels from 0.45 (standing) to bottom
                bottom_hip = 0.66 if deep else 0.54  # deep => hip below knee_y(0.60); shallow => clearly above
                hip_y = 0.45 + (bottom_hip - 0.45) * frac
                ankle_y = 0.92
                heel_y = 0.93
                if heel_lift and frac > 0.8:
                    heel_y = 0.93 - 0.03  # heel rises (y decreases) at the bottom
                pts = {
                    "shoulder": (0.50, 0.25, 0.99),
                    "hip": (0.50, hip_y, 0.99),
                    "knee": (0.52, knee_y, 0.99),
                    "ankle": (0.52, ankle_y, 0.99),
                    "heel": (0.50, heel_y, 0.99),
                    "foot_index": (0.56, 0.94, 0.99),
                }
                frames.append(Frame(t=t, points=pts))
                t += dt
    return frames, fps


def main():
    # 1. Three clean deep reps -> 3 reps detected, depth ok, grade A
    frames, fps = make_rep_frames(3, deep=True)
    res = analyze_squat(frames, fps)
    print(f"clean deep: reps={res['rep_count']} grade={res['form']['letter']} "
          f"depth_ok={[r['depth_ok'] for r in res['reps']]}")
    assert res["rep_count"] == 3, f"expected 3 reps, got {res['rep_count']}"
    assert all(r["depth_ok"] for r in res["reps"]), "deep reps should pass depth"
    assert res["form"]["letter"] == "A", f"clean set should be A, got {res['form']['letter']}"

    # 2. Shallow reps -> depth faults, grade drops
    frames, fps = make_rep_frames(2, deep=False)
    res = analyze_squat(frames, fps)
    print(f"shallow:    reps={res['rep_count']} grade={res['form']['letter']} "
          f"depth_ok={[r['depth_ok'] for r in res['reps']]}")
    assert res["rep_count"] == 2, f"expected 2 reps, got {res['rep_count']}"
    assert not any(r["depth_ok"] for r in res["reps"]), "shallow reps should fail depth"

    # 3. Heel lift detected
    frames, fps = make_rep_frames(2, deep=True, heel_lift=True)
    res = analyze_squat(frames, fps)
    heel_faults = [f for r in res["reps"] for f in r["faults"] if f["type"] == "heel_lift"]
    print(f"heel lift:  reps={res['rep_count']} heel_faults={len(heel_faults)}")
    assert heel_faults, "heel lift should be flagged"

    print("\nAll synthetic squat checks passed.")


if __name__ == "__main__":
    main()

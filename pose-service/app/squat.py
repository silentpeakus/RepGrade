"""Back Squat analysis — rubric-driven, sagittal plane (side view).

Implements the Form faults defined in
rubrics/Back_Squat_Rubric_v1_1.md: depth, back rounding, heel lift, plus rep
boundary detection (rubric S3) and tempo timing.

CALIBRATION NOTE: every threshold below is a starting hypothesis flagged in the
rubric's S6 "Open Items for Phase 0 Calibration". They are intentionally named
constants, NOT final values — Phase 0's job is to tune these against real
coach-reviewed video. Do not treat any number here as validated.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .frame import Frame

# --- Phase 0 calibration constants (rubric S6 — all TBD against real video) ---
DEPTH_TOLERANCE = 0.02            # normalized-y slack on the hip-vs-knee depth line
DEPTH_BORDERLINE = 0.04          # within this band of the line = "borderline", not auto-fail
BACK_INFLECTION_DEG = 12.0       # frame-over-frame torso-angle jump flagged as rounding
HEEL_LIFT_TOLERANCE = 0.015      # normalized-y rise of heel above its grounded baseline
MIN_REP_DEPTH = 0.04             # min hip-y travel for a movement to count as a rep (noise gate)
SMOOTH_WINDOW = 5                # frames for moving-average smoothing of the hip-y signal


@dataclass
class RepFault:
    type: str          # "depth" | "back_rounding" | "heel_lift"
    severity: str      # "fault" | "borderline"
    detail: str


@dataclass
class Rep:
    index: int
    t_top_start: float
    t_bottom: float
    t_top_end: float
    eccentric_s: float
    concentric_s: float
    depth_ok: bool
    faults: list[RepFault] = field(default_factory=list)


def _moving_average(values: list[float], window: int) -> list[float]:
    if window <= 1 or len(values) < window:
        return values
    out = []
    half = window // 2
    for i in range(len(values)):
        lo, hi = max(0, i - half), min(len(values), i + half + 1)
        out.append(sum(values[lo:hi]) / (hi - lo))
    return out


def _torso_angle_deg(frame: Frame) -> float | None:
    """Angle of the shoulder->hip line from vertical, in degrees.
    0 = perfectly upright torso; larger = more forward lean."""
    sh = frame.xy("shoulder")
    hip = frame.xy("hip")
    if sh is None or hip is None:
        return None
    dx = hip[0] - sh[0]
    dy = hip[1] - sh[1]
    if dy == 0:
        return 90.0
    import math
    return abs(math.degrees(math.atan2(dx, dy)))


def _detect_reps(frames: list[Frame], fps: float) -> list[tuple[int, int, int]]:
    """Return rep windows as (top_start_idx, bottom_idx, top_end_idx).

    Hip-y rises (larger y) as the lifter descends and falls as they stand.
    A rep = stand -> bottom (local max of hip-y) -> stand. We find prominent
    local maxima in the smoothed hip-y signal and bound each by the standing
    minima on either side (rubric S3)."""
    hip_y = [(f.xy("hip")[1] if f.xy("hip") else None) for f in frames]
    # Forward/backward fill gaps so smoothing/peak-finding stay stable.
    last = None
    for i, v in enumerate(hip_y):
        if v is None:
            hip_y[i] = last
        else:
            last = v
    if all(v is None for v in hip_y):
        return []
    first = next(v for v in hip_y if v is not None)
    hip_y = [first if v is None else v for v in hip_y]
    sig = _moving_average(hip_y, SMOOTH_WINDOW)

    n = len(sig)
    reps: list[tuple[int, int, int]] = []
    i = 1
    while i < n - 1:
        # local maximum = bottom of a squat
        if sig[i] >= sig[i - 1] and sig[i] > sig[i + 1]:
            bottom = i
            # walk left/right to the standing positions (local minima)
            left = bottom
            while left > 0 and sig[left - 1] <= sig[left]:
                left -= 1
            right = bottom
            while right < n - 1 and sig[right + 1] <= sig[right]:
                right += 1
            depth_travel = sig[bottom] - min(sig[left], sig[right])
            if depth_travel >= MIN_REP_DEPTH:
                reps.append((left, bottom, right))
                i = right + 1
                continue
        i += 1
    return reps


def _grade_rep(idx: int, window: tuple[int, int, int], frames: list[Frame], fps: float) -> Rep:
    top_start, bottom, top_end = window
    f_bottom = frames[bottom]
    faults: list[RepFault] = []

    # --- Depth (rubric S4.1): hip crease at/below top of knee at the bottom ---
    hip = f_bottom.xy("hip")
    knee = f_bottom.xy("knee")
    depth_ok = True
    if hip is not None and knee is not None:
        # larger y = lower on screen; hip below knee means hip_y >= knee_y
        gap = knee[1] - hip[1]  # positive => hip is above knee top (not deep enough)
        if gap > DEPTH_BORDERLINE:
            depth_ok = False
            faults.append(RepFault("depth", "fault", "Hip crease did not reach the top of the knee."))
        elif gap > DEPTH_TOLERANCE:
            faults.append(RepFault("depth", "borderline", "Depth was borderline at the knee line."))

    # --- Back rounding (rubric S4.2): sudden torso-angle inflection near the bottom ---
    angles = [(_torso_angle_deg(frames[j])) for j in range(top_start, top_end + 1)]
    angles = [a for a in angles if a is not None]
    for a, b in zip(angles, angles[1:]):
        if abs(b - a) >= BACK_INFLECTION_DEG:
            faults.append(RepFault("back_rounding", "fault", "Sharp change in back angle under load."))
            break

    # --- Heel lift (rubric S4.3): heel rises above its grounded baseline ---
    base_heel = frames[top_start].xy("heel")
    if base_heel is not None:
        for j in range(top_start, top_end + 1):
            h = frames[j].xy("heel")
            if h is not None and (base_heel[1] - h[1]) > HEEL_LIFT_TOLERANCE:
                faults.append(RepFault("heel_lift", "fault", "Heel lifted off the floor during the rep."))
                break

    return Rep(
        index=idx,
        t_top_start=frames[top_start].t,
        t_bottom=frames[bottom].t,
        t_top_end=frames[top_end].t,
        eccentric_s=round(frames[bottom].t - frames[top_start].t, 3),
        concentric_s=round(frames[top_end].t - frames[bottom].t, 3),
        depth_ok=depth_ok,
        faults=faults,
    )


def _form_grade(reps: list[Rep]) -> tuple[str, int]:
    """Roll per-rep faults into a set-level Form letter + numeric (rubric S5).

    Back rounding is weighted more heavily (injury-relevant) and is NOT averaged
    out by clean reps — this asymmetry is deliberate per rubric S5."""
    hard_faults = [fa for r in reps for fa in r.faults if fa.severity == "fault"]
    has_back_rounding = any(fa.type == "back_rounding" for fa in hard_faults)
    fault_count = len(hard_faults)

    if has_back_rounding or fault_count >= 3:
        return "C", 70
    if fault_count == 2:
        return "B-", 75
    if fault_count == 1:
        return "B+", 87
    return "A", 96


def analyze_squat(frames: list[Frame], fps: float) -> dict:
    windows = _detect_reps(frames, fps)
    reps = [_grade_rep(i + 1, w, frames, fps) for i, w in enumerate(windows)]
    letter, numeric = _form_grade(reps)

    return {
        "exercise": "back_squat",
        "rubric_version": "1.0",
        "rep_count": len(reps),
        "form": {"letter": letter, "numeric": numeric},
        "reps": [
            {
                "index": r.index,
                "depth_ok": r.depth_ok,
                "eccentric_s": r.eccentric_s,
                "concentric_s": r.concentric_s,
                "faults": [{"type": f.type, "severity": f.severity, "detail": f.detail} for f in r.faults],
            }
            for r in reps
        ],
        "calibration_note": (
            "All thresholds are Phase 0 hypotheses (rubric S6), not validated values."
        ),
    }

# RepGrade Exercise Rubric: Deadlift (v1)

**Rubric version:** 1.0
**Exercise:** Deadlift
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

This rubric grades sagittal-plane faults: back rounding, bar path, and hip/shoulder rise timing. Like squat, knee valgus is excluded for the same reason — side view cannot reliably detect frontal-plane knee cave. Deadlift-specific lateral faults (e.g., bar drifting to one side) are also out of scope for v1 single-camera grading.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Hip | Hip-rise timing relative to shoulder-rise (the core deadlift fault check) |
| Shoulder | Hip-rise timing reference, back angle tracking |
| Wrist/bar proxy | Bar path (should stay close to the body throughout) |
| Knee | Bar path clearance reference (bar should track close past the knee) |
| Mid-back (thoracic, estimated) | Back rounding detection |

---

## 3. Rep Boundary Detection

- **Start:** bar at floor, hips and shoulders at setup position, velocity ≈ 0
- **Lockout:** hip and shoulder at full extension, standing tall, velocity ≈ 0
- **End (for multi-rep sets):** bar returns to floor (or to a paused/dead-stop position depending on the athlete's style) before the next rep begins

Note: unlike squat/bench, deadlift's "bottom" is the start of the rep, not the middle — rep boundary logic needs to reflect this directionality difference when ported into the pose pipeline.

### 4.1 Hip-Shoulder Rise Timing ("Hips Shooting Up")

**Standard:** Hips and shoulders should rise together (or shoulders leading slightly) — hips should not rise dramatically faster than the shoulders early in the pull, which turns the lift into a stiff-leg-dominant pattern and shifts load onto the lower back.

- **Pass:** The ratio of hip-rise-rate to shoulder-rise-rate stays within a tolerance band through the first portion of the pull (off the floor).
- **Fail:** Hip rise rate significantly outpaces shoulder rise rate early in the pull — exact ratio threshold TBD during Phase 0 (this fault is highly dependent on an athlete's natural deadlift style — sumo vs. conventional pullers have different normal hip/shoulder rise patterns, so the tolerance band likely needs a stance-aware adjustment, not one universal number).

**Cue trigger (corrective):** "Your hips shot up before your shoulders on rep 2, turning the pull into more of a stiff-leg movement — try driving your legs and keeping your chest up as the bar leaves the floor."

**Cue trigger (positive):** If hip-shoulder timing stayed in sync across the set: "Your hips and shoulders rose together on every rep — that's the timing that protects your back under load." Leads the cue list per Section 4.2.3.

### 4.2 Back Rounding

**Standard:** Same logic as squat — back angle should not show a sharp localized inflection (sudden increase in spinal flexion) under load, distinguished from a lifter's normal/expected starting back angle (which varies by build and stance).

- **Pass:** No detectable inflection point in the shoulder-hip-vertical angle beyond the calibrated threshold.
- **Fail:** A localized angle change exceeding the threshold, most commonly right off the floor (the hardest point of the pull) — exact threshold TBD during Phase 0, same caveat as squat's back-rounding fault: needs real coach-reviewed footage before trusting a number.

**Cue trigger:** "Your back rounded as the bar left the floor on rep 3 — brace harder before you pull and keep your lats engaged to protect your spine."

### 4.3 Bar Path (Distance from Body)

**Standard:** Bar should travel close to the legs throughout the pull — not drift forward away from the shins/thighs.

- **Pass:** Wrist x-coordinate (bar proxy) stays within a tolerance band of a vertical line close to the knee/thigh.
- **Fail:** Bar drifts forward beyond the tolerance band — usually visible as the bar swinging away from the body around knee height.

**Cue trigger:** "The bar drifted away from your legs around knee height on rep 4 — keep it dragging close to your shins and thighs the whole way up."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults | A | 93–100 |
| 1 minor fault (e.g., slight bar drift) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or any back-rounding fault present (weighted heavily — highest injury relevance of the three) | C or below | ≤72 |

Same asymmetric-weighting principle as squat: back rounding is the injury-relevant fault and should not be averaged out by otherwise-clean reps. This table is a hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Hip/shoulder rise ratio threshold** — likely needs a stance-aware (sumo vs. conventional) adjustment, not one universal number.
2. **Back-rounding inflection threshold** — same caveat as squat; needs real coach-reviewed footage.
3. **Bar path tolerance band** — needs real video across different limb proportions.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

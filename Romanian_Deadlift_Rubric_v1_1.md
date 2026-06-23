# RepGrade Exercise Rubric: Romanian Deadlift (v1)

**Rubric version:** 1.0
**Exercise:** Romanian Deadlift (RDL)
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Sagittal-plane faults only: hip hinge depth/range, back rounding, and bar path. RDL differs from conventional deadlift in that the bar never touches the floor between reps and the movement is hip-hinge-dominant with minimal knee bend — the rubric needs to reflect that distinct movement pattern, not reuse deadlift's thresholds directly. Knee valgus excluded for the same reason as squat/deadlift (frontal-plane fault, not reliably visible from the side).

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Hip | Hinge depth, hip-shoulder timing |
| Shoulder | Back angle tracking, hinge depth reference |
| Knee | Confirms minimal knee bend (distinguishes RDL pattern from a squat-like pattern) |
| Wrist/bar proxy | Bar path (should stay close to the legs) |
| Mid-back (thoracic, estimated) | Back rounding detection |

---

## 3. Rep Boundary Detection

- **Start/Top:** standing, hips and shoulders extended, bar at thigh height, velocity ≈ 0
- **Bottom:** hip hinge at maximum depth for that rep (local minimum of hip y-coordinate combined with forward torso lean), velocity ≈ 0
- **End:** return to standing, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Hinge Depth / Range of Motion

**Standard:** Athlete should hinge until reaching a meaningful hamstring stretch (typically bar around mid-shin to just-below-knee, depending on hamstring flexibility) — not just a shallow, partial hinge. Unlike squat's fixed depth standard, the bottom position for RDL is more individual (flexibility-dependent), so the standard here is consistency, not an absolute joint angle.

- **Pass:** Hip hinge depth (bar height) on a given rep stays within a tolerance band of the athlete's own rep-1 baseline depth.
- **Fail:** A rep's depth falls meaningfully short of that baseline — exact tolerance TBD during Phase 0 (this is one of the clearer "needs per-athlete calibration from rep 1" cases, since absolute hinge depth varies enormously by hamstring flexibility and is not itself a form fault).

**Cue trigger (corrective):** "Reps 5 and 6 didn't hinge as deep as your first rep — keep pushing your hips back to get the same stretch each time instead of cutting the range short as you fatigue."

**Cue trigger (positive):** If hinge depth stayed consistent: "You hit the same hinge depth on every rep — no shortening as the set went on." Leads the cue list per Section 4.2.3.

### 4.2 Back Rounding

**Standard:** Same logic as squat/deadlift — torso angle should not show a sharp localized inflection under load at the bottom of the hinge, distinguished from the athlete's normal flexibility-driven hinge angle.

- **Pass:** No detectable inflection point beyond the calibrated threshold.
- **Fail:** A localized angle change exceeding the threshold, most commonly at the bottom of the hinge — exact threshold TBD during Phase 0, same caveat as squat/deadlift (needs real coach-reviewed footage).

**Cue trigger:** "Your back rounded at the bottom of rep 4 — keep your chest up and hinge from the hips, not the spine."

### 4.3 Bar Path (Distance from Body)

**Standard:** Bar should stay close to the legs throughout the hinge, not swing forward away from the thighs.

- **Pass:** Wrist x-coordinate (bar proxy) stays within tolerance of a vertical line close to the thigh.
- **Fail:** Bar drifts forward beyond the tolerance band during the descent or ascent.

**Cue trigger:** "The bar drifted away from your legs on rep 3 — keep it dragging down your thighs the whole way."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults | A | 93–100 |
| 1 minor fault (e.g., one slightly-shallow rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or any back-rounding fault present (weighted heavily) | C or below | ≤72 |

Same asymmetric-weighting principle as squat/deadlift: back rounding weighted above the other faults. Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Hinge depth baseline & tolerance** — needs per-athlete rep-1 calibration; absolute depth is flexibility-dependent.
2. **Back-rounding inflection threshold** — same caveat as squat/deadlift; needs real coach-reviewed footage.
3. **Bar path tolerance** — needs real video across different limb proportions.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

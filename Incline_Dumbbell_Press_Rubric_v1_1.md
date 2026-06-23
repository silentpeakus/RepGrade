# RepGrade Exercise Rubric: Incline Dumbbell Press (v1)

**Rubric version:** 1.0
**Exercise:** Incline Dumbbell Press
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Same fault family as bench press: range of motion and path of the dumbbells. Bilateral symmetry (one dumbbell pressing ahead of the other — a more common fault with dumbbells than a fixed barbell, since each arm moves independently) is a frontal-plane fault and is excluded from this side-view rubric for the same reason squat excludes valgus. If athlete-reported or visually obvious asymmetry becomes a frequent issue in beta, this is the most likely v1 rubric to need a front-view companion angle later.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Wrist (dumbbell proxy) | Range of motion (bottom stretch, top lockout), path tracking |
| Elbow | Lockout detection, path tracking |
| Shoulder | Bar/dumbbell path reference, range of motion baseline |

---

## 3. Rep Boundary Detection

- **Start:** dumbbells at full lockout overhead (or near-lockout, depending on style), velocity ≈ 0
- **Bottom:** dumbbells at lowest point (chest/shoulder-level stretch), velocity ≈ 0
- **End:** return to lockout, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Range of Motion (Bottom Stretch)

**Standard:** Dumbbells should descend to a full stretch at shoulder/chest level on the incline — not stop short partway down, which is a common fault as the set gets harder.

- **Pass:** Wrist y-coordinate at rep bottom reaches within tolerance of the athlete's own rep-1 baseline depth.
- **Fail:** A rep's bottom position falls short of that baseline beyond the tolerance band — per-athlete calibration, same pattern as bench's chest-touch baseline.

**Cue trigger (corrective):** "Reps 5 and 6 stopped short of your usual depth — get the same full stretch at the bottom on every rep."

**Cue trigger (positive):** If depth held across the set: "You hit the same full stretch at the bottom on every rep — consistent range of motion throughout." Leads the cue list per Section 4.2.3.

### 4.2 Lockout Completion

**Standard:** Both arms should reach full extension at the top of every rep.

- **Pass:** Elbow angle at rep top reaches within tolerance of full extension.
- **Fail:** Elbow angle falls short of full extension beyond the tolerance band.

**Cue trigger:** "You stopped short of lockout on rep 4 — press all the way through to full extension at the top."

### 4.3 Path Consistency (Forward/Backward Drift)

**Standard:** Dumbbells should travel a relatively consistent path rep to rep — not drift significantly forward (toward the feet) or backward (toward the head) in a way that suggests losing control of the weight path.

- **Pass:** Wrist x-coordinate path stays within a tolerance band of the athlete's own rep-1 baseline path.
- **Fail:** A rep's path deviates beyond the tolerance band — exact threshold TBD during Phase 0.

**Cue trigger:** "Your dumbbell path drifted on rep 5 compared to your earlier reps — keep the press path consistent rep to rep."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one short rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or path-drift fault present on multiple reps (weighted more heavily — suggests the weight is exceeding controlled capacity, same logic as bench's hip-lift-off weighting) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Bottom-depth baseline** — per-athlete rep-1 calibration, same pattern as bench press.
2. **Lockout tolerance** — needs real footage; natural elbow extension varies by athlete.
3. **Path-consistency tolerance** — needs real video to set a meaningful drift threshold.
4. **Grade band cutoffs** — hypothesis only.
5. **Watch in beta:** dumbbell L/R asymmetry — if this turns out to be a common, visible fault that athletes care about, this exercise is the strongest v1 candidate to get a front-view companion angle in a later revision.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

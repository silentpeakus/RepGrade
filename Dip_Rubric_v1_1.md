# RepGrade Exercise Rubric: Dip (v1)

**Rubric version:** 1.0
**Exercise:** Dip
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Sagittal-plane faults: range of motion (depth and lockout) and torso angle consistency. Torso lean itself is not a fault (more forward lean = more chest emphasis, more upright = more triceps emphasis — both are valid styles) but inconsistent torso angle rep-to-rep, or excessive uncontrolled swinging, is worth flagging. Shoulder internal/external rotation faults are a frontal/transverse-plane consideration and are out of scope for v1 side-view grading.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Shoulder | Depth measurement, torso angle tracking |
| Elbow | Depth measurement, lockout detection |
| Hip | Torso angle tracking, swing/kipping detection |

---

## 3. Rep Boundary Detection

- **Start:** arms at full lockout (top position), velocity ≈ 0
- **Bottom:** elbow angle at minimum for that rep (deepest point), velocity ≈ 0
- **End:** return to lockout, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Depth / Range of Motion

**Standard:** Shoulder should reach a meaningful depth (commonly until the upper arm is roughly parallel to the floor, though this varies by shoulder mobility and is a known point of athlete-specific variance) — not stop at a shallow partial dip.

- **Pass:** Shoulder/elbow depth at rep bottom stays within tolerance of the athlete's own rep-1 baseline.
- **Fail:** A rep's depth falls short of that baseline beyond the tolerance band — per-athlete calibration, same pattern as RDL and leg press, since shoulder mobility varies meaningfully between athletes and going too deep is also a legitimate injury concern, so this rubric does not push for a single universal depth standard.

**Cue trigger:** "Reps 6 and 7 didn't go as deep as your earlier reps — keep your range of motion consistent through the set."

### 4.2 Lockout Completion

**Standard:** Arms should reach full extension at the top of every rep.

- **Pass:** Elbow angle at rep top reaches within tolerance of full extension.
- **Fail:** Elbow angle falls short beyond the tolerance band — common on later reps as triceps fatigue.

**Cue trigger:** "You stopped short of full lockout on rep 5 — finish each rep all the way at the top."

### 4.3 Body Swing / Kipping

**Standard:** Body should move in a controlled vertical path — not swing forward/backward using momentum to assist the rep, which is a common fault as fatigue sets in on a bodyweight-loaded movement.

- **Pass:** Hip x-coordinate (horizontal position) stays within a tolerance band of a stable vertical line throughout the rep.
- **Fail:** Hip position swings beyond the tolerance band — typically visible as a forward/backward rocking motion used to generate momentum into the press.

**Cue trigger (corrective):** "You started swinging on reps 6 and 7 to help drive the rep — keep your body still and let your chest and triceps do the work, even if that means fewer reps."

**Cue trigger (positive):** If no swing was detected across the set: "Your body stayed controlled on every rep — no swinging to assist the lift." Leads the cue list per Section 4.2.3.

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one shallow rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or swing/kipping fault present on multiple reps (weighted more heavily — same "compensating for fatigue with momentum" logic as bench's hip-lift-off and row's torso-angle faults) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Depth baseline** — per-athlete rep-1 calibration; shoulder mobility varies and over-depth is itself a legitimate injury concern, so no universal standard is appropriate here.
2. **Lockout tolerance** — needs real footage; natural elbow extension varies.
3. **Swing/kipping tolerance** — needs real video to distinguish minor natural body movement from genuine momentum-assisted reps.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

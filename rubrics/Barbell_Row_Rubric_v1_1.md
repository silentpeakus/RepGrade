# RepGrade Exercise Rubric: Barbell Row (v1)

**Rubric version:** 1.0
**Exercise:** Barbell Row
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

This rubric grades sagittal-plane faults: torso angle stability (not standing up to use momentum), bar path to the body, and range of motion (full pull to the torso, full stretch at the bottom). Like squat and deadlift, frontal-plane faults (e.g., one side pulling higher than the other) are out of scope for v1 single-camera side-view grading.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Shoulder | Torso angle tracking, bar path reference |
| Hip | Torso angle tracking, momentum/stand-up detection |
| Wrist/bar proxy | Bar path, range of motion (bottom stretch and top contact) |
| Elbow | Pull path tracking, lockout/contraction reference |

---

## 3. Rep Boundary Detection

- **Start:** bar at full stretch (arms extended, torso hinged forward at the set angle), velocity ≈ 0
- **Top:** bar pulled to torso (lower chest/upper abdomen, depending on row style), velocity ≈ 0
- **End:** return to full stretch, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Torso Angle Stability ("Standing Up" / Using Momentum)

**Standard:** The torso's hinge angle (relative to vertical) should stay roughly consistent throughout the set — not progressively straighten up (reducing the hinge) to use body momentum to heave the weight up, which is a common fatigue-driven fault on later reps.

- **Pass:** Torso angle at the start of each rep stays within a tolerance band of the angle established on rep 1 (the athlete's own setup position).
- **Fail:** Torso angle on a given rep decreases (straightens toward vertical) beyond the tolerance band compared to the rep 1 baseline — exact tolerance TBD during Phase 0 (this needs to be calibrated per-set from the athlete's own starting angle, similar to bench's chest-touch baseline, since row stance/hinge angle varies by individual preference and is not itself a fault).

**Cue trigger (corrective):** "You stood up more on reps 6 and 7 compared to your first rep — your torso angle is creeping toward vertical, which means you're using momentum instead of your back. Reset your hinge before each rep."

**Cue trigger (positive):** If torso angle stayed consistent across the set: "Your torso angle held steady from your first rep to your last — no momentum creeping in." Leads the cue list per Section 4.2.3.

### 4.2 Range of Motion (Full Stretch and Full Contraction)

**Standard:** Bar should reach full arm extension at the bottom (a true stretch, not stopping short) and reach the torso at the top (a complete pull, not stopping a few inches away).

- **Pass:** Wrist y-coordinate at rep bottom and rep top both reach within tolerance of the athlete's own rep-1 baseline range.
- **Fail:** Either end of the rep falls short of that baseline range beyond the tolerance band.

**Cue trigger:** "Reps 4 and 5 weren't pulled all the way to your torso — get a full contraction at the top of each rep, not just a partial pull."

### 4.3 Bar Path (Distance from Body)

**Standard:** Bar should travel close to the body throughout the pull, not swing away from the torso.

- **Pass:** Wrist x-coordinate (bar proxy) stays within a tolerance band of a line close to the torso through the pulling motion.
- **Fail:** Bar drifts away from the body beyond the tolerance band — usually visible as the bar swinging outward during the pull, often paired with the torso-angle fault above (momentum-driven reps tend to swing the bar out, too).

**Cue trigger:** "The bar swung away from your body on rep 6 instead of staying close — pull with your elbows and keep the bar tracking near your torso."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults | A | 93–100 |
| 1 minor fault (e.g., one slightly-short rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or torso-angle/momentum fault present on multiple reps (weighted more heavily — indicates the working weight is exceeding controlled pulling capacity, same logic as bench's hip-lift-off fault) | C or below | ≤72 |

Same asymmetric-weighting principle as the other compounds: the fault most indicative of "weight too heavy for controlled execution" gets weighted above faults that are more isolated/recoverable. Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Torso angle baseline & tolerance** — needs to be set per-set from the athlete's own rep-1 angle, not a universal value, since row stance varies by individual and equipment (e.g., Pendlay row vs. a more upright row style have different normal starting angles).
2. **Range-of-motion baseline** — same per-athlete calibration approach as bench's chest-touch point.
3. **Bar path tolerance** — needs real footage across different torso lengths/builds.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

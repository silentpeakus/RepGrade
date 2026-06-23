# RepGrade Exercise Rubric: Lateral Raise (v1)

**Rubric version:** 1.0
**Exercise:** Lateral Raise
**Required camera angle:** Front view
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Like overhead press, lateral raise's dominant faults — using momentum/swinging the torso to assist the lift, and raising the arms past shoulder height by shrugging the traps rather than the deltoid — are best read from the front, where the arc of the arm path and any torso sway are clearly visible. A side view would hide left/right asymmetry and make torso sway harder to distinguish from normal posture. This is the second front-view exercise in the v1 set (after overhead press) — same capture-guidance implication noted there applies here too.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Left wrist / right wrist | Arm path height and symmetry |
| Left shoulder / right shoulder | Shrug detection (shoulder rising independent of arm raise), symmetry reference |
| Hip | Torso sway / momentum detection |

---

## 3. Rep Boundary Detection

- **Start:** arms at sides, velocity ≈ 0
- **Top:** arms at peak height for that rep (commonly shoulder height, though style varies), velocity ≈ 0
- **End:** return to sides, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Body Swing / Momentum

**Standard:** Torso should remain relatively still — not rock or lean to help "throw" the weight up, which is a common fault as the set gets harder and is one of the most visible faults on this exercise in particular, since lateral raise uses light loads relative to the leverage involved.

- **Pass:** Hip x-coordinate (horizontal position/lean) stays within a tolerance band of a stable position throughout the rep.
- **Fail:** Hip/torso position swings or leans beyond the tolerance band — typically visible as using body momentum to initiate the raise rather than the shoulder muscles.

**Cue trigger (corrective):** "You started swinging your torso on reps 8 and 9 to help lift the weight — keep your body still and isolate the movement at your shoulders, even if you need a lighter weight to do it."

**Cue trigger (positive):** If torso stayed stable across the set: "Your torso stayed still the whole set — no swinging to help lift the weight." Leads the cue list per Section 4.2.3.

### 4.2 Shoulder Shrug Compensation

**Standard:** Shoulders should stay relatively level (not rise up toward the ears) as the arms raise — shrugging is a sign the traps are compensating for the deltoids, especially as fatigue sets in.

- **Pass:** Shoulder y-coordinate stays within tolerance of the athlete's own rep-1 baseline shoulder height throughout the rep.
- **Fail:** Shoulder position rises beyond the tolerance band during the raise — exact threshold TBD during Phase 0.

**Cue trigger:** "Your shoulders shrugged up on reps 7 and 8 — keep them pulled down and let your delts do the lifting instead of your traps."

### 4.3 Symmetry (Left/Right)

**Standard:** Both arms should raise to roughly the same height at roughly the same rate.

- **Pass:** Left and right wrist y-coordinates stay within a tolerance band of each other throughout the rep.
- **Fail:** A detectable height gap between left and right wrist exceeding the tolerance band — common when one side fatigues faster or starts using momentum to compensate.

**Cue trigger:** "Your left arm raised higher than your right on rep 6 — keep both sides matched and controlled."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults | A | 93–100 |
| 1 minor fault (e.g., slight asymmetry on one rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or body-swing fault present on multiple reps (weighted more heavily — same "compensating with momentum" logic used across other v1 rubrics) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Body-swing tolerance** — needs real video; lateral raise is unusually prone to this fault given the light loads and high leverage involved, so the threshold may need to be stricter than other exercises.
2. **Shrug-compensation threshold** — needs real footage to distinguish natural minor shoulder movement from genuine compensation.
3. **Symmetry tolerance** — same caveat as overhead press: natural dominant-side asymmetry exists and shouldn't be over-flagged.
4. **Grade band cutoffs** — hypothesis only.
5. **Capture guidance UI** — same front-view flag as overhead press.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

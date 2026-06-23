# RepGrade Exercise Rubric: Pull-Up (v1)

**Rubric version:** 1.0
**Exercise:** Pull-Up
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Sagittal-plane faults: range of motion (full hang to chin/chest over the bar) and kipping/body swing (using leg drive or torso momentum to assist the pull, a very common fault as fatigue sets in on this bodyweight movement). Like dip, this is a bodyweight-loaded exercise where momentum-compensation is one of the most visible and common faults, since there's no fixed external load to "fail" against the way a barbell would.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Shoulder | Range of motion reference, torso stability |
| Elbow | Lockout/full-hang detection |
| Hip | Kipping/swing detection (horizontal displacement) |
| Wrist (relative to bar, if bar position is identifiable in frame) | Top-of-rep reference point |

---

## 3. Rep Boundary Detection

- **Start:** full hang, arms extended, velocity ≈ 0
- **Top:** chin (or chest, depending on standard used) at or above bar height, velocity ≈ 0
- **End:** return to full hang, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Range of Motion

**Standard:** Full hang (arms fully extended) at the bottom and chin clearing the bar at the top, on every rep — partial reps at either end are a fault.

- **Pass:** Both rep extremes (bottom hang depth, top chin-over-bar height) reach within tolerance of the athlete's own rep-1 baseline.
- **Fail:** Either extreme falls short beyond the tolerance band — exact tolerance TBD during Phase 0.

**Cue trigger:** "Reps 6 and 7 didn't reach full extension at the bottom — get a complete hang before pulling into the next rep."

### 4.2 Kipping / Body Swing

**Standard:** Body should move in a relatively controlled vertical path — not use a forward/backward leg kick or torso swing to generate momentum into the pull, which is one of the most common fatigue-driven faults on this exercise.

- **Pass:** Hip x-coordinate (horizontal position) stays within a tolerance band of a stable vertical line throughout the rep.
- **Fail:** Hip position swings beyond the tolerance band — typically visible as a kicking or swinging motion timed with the pull.

**Cue trigger (corrective):** "You started kipping on reps 5 and 6 to help get over the bar — keep your legs still and let your back and arms do the work, even if that means stopping the set a rep or two earlier."

**Cue trigger (positive):** If no kipping was detected across the set: "No kipping on any rep — every pull was controlled, strict form." Leads the cue list per Section 4.2.3.

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one short rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or kipping fault present on multiple reps (weighted more heavily — same momentum-compensation logic as dip's swing fault) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Range-of-motion baseline** — per-athlete rep-1 calibration, same pattern as dip.
2. **Kipping tolerance** — needs real footage to distinguish minor natural body movement from genuine momentum-assisted reps; this is a high-priority fault to calibrate well since it's extremely common and visually obvious to a real coach, so a miscalibrated threshold here would be a noticeable credibility issue.
3. **Grade band cutoffs** — hypothesis only.
4. **Note on standard used:** this rubric assumes chin-over-bar as the top-of-rep standard. If your target users train to a chest-to-bar standard instead, the rep-boundary logic in Section 3 needs to change accordingly — confirm which standard before Phase 0 implementation.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

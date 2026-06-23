# RepGrade Exercise Rubric: Seated Cable Row (v1)

**Rubric version:** 1.0
**Exercise:** Seated Cable Row
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Sagittal-plane faults: torso-angle stability (not rocking back and forth to use momentum, the dominant fault on this exercise specifically), range of motion, and handle path. Seated cable row is the third pulling exercise in the v1 set (alongside barbell row and lat pulldown) and shares the same structural fault family, with rocking/momentum being especially common here because the seated position with foot support makes it easy to generate body-driven momentum.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Shoulder | Torso angle tracking, range of motion reference |
| Hip | Torso angle tracking, rocking/momentum detection |
| Wrist/handle proxy | Range of motion (full stretch, full contraction), path tracking |
| Elbow | Pull path tracking |

---

## 3. Rep Boundary Detection

- **Start:** arms extended forward (full stretch), torso at the athlete's set angle, velocity ≈ 0
- **Bottom (pull endpoint):** handle pulled to torso, velocity ≈ 0
- **End:** return to full stretch, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Torso Rocking / Momentum

**Standard:** Torso should stay relatively stable through the pull — a small, controlled lean back during the pull and forward during the stretch is normal, but exaggerated rocking (using the torso to generate momentum into the pull rather than pulling with the back) is a fault, and is the single most common fault on this exercise specifically.

- **Pass:** Torso angle range-of-motion on a given rep stays within tolerance of the athlete's own rep-1 baseline rocking pattern.
- **Fail:** Torso angle range exceeds that baseline beyond the tolerance band — exact tolerance TBD during Phase 0, per-athlete calibration since some controlled torso movement is a normal and even intentional part of this exercise's style for many lifters, unlike barbell row or lat pulldown where torso stability is more strictly expected.

**Cue trigger (corrective):** "You started rocking more on reps 6 and 7 to help pull the weight — keep your torso controlled and let your back do the work instead of using momentum."

**Cue trigger (positive):** If torso stayed controlled across the set: "Your torso stayed controlled the whole set — no excess rocking to help the pull." Leads the cue list per Section 4.2.3.

### 4.2 Range of Motion

**Standard:** Handle should reach a full stretch (arms extended, shoulders protracted) and reach the torso at the top of the pull — not stop short at either end.

- **Pass:** Wrist y-coordinate (handle proxy) at both rep extremes reaches within tolerance of the athlete's own rep-1 baseline range.
- **Fail:** Either end of the rep falls short beyond the tolerance band.

**Cue trigger:** "Reps 5 and 6 weren't pulled all the way to your torso — finish the pull fully on every rep."

### 4.3 Elbow/Handle Path

**Standard:** Handle should travel in a consistent path toward the torso, not driven primarily by the arms with minimal back engagement.

- **Pass:** Handle path stays within tolerance of the athlete's own rep-1 baseline path.
- **Fail:** Path deviates beyond the tolerance band — exact threshold TBD during Phase 0.

**Cue trigger:** "Your pull path changed on rep 4 — keep the handle traveling the same way to your torso each rep."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one short rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or torso-rocking fault present on multiple reps (weighted more heavily — same momentum-compensation logic as the other pulling exercises) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Torso-rocking baseline & tolerance** — per-athlete rep-1 calibration; this exercise needs a more permissive tolerance than barbell row/lat pulldown since some controlled rocking is normal style here, not automatically a fault.
2. **Range-of-motion baseline** — per-athlete calibration, same pattern as the other pulling exercises.
3. **Handle path tolerance** — needs real footage across different attachments (straight bar, V-handle, etc., which may need separate baseline path expectations).
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

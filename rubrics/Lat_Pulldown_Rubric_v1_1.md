# RepGrade Exercise Rubric: Lat Pulldown (v1)

**Rubric version:** 1.0
**Exercise:** Lat Pulldown
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Sagittal-plane faults: torso-angle stability (not leaning back excessively to use body weight/momentum), range of motion, and elbow path. Same fault family as barbell row and seated cable row — all three pulling exercises share this structure, differing mainly in body position (standing/bent vs. seated) and bar/handle path geometry.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Shoulder | Torso angle tracking, range of motion reference |
| Hip | Torso angle tracking, momentum/lean-back detection |
| Wrist/bar proxy | Range of motion (top stretch, bottom contact), path tracking |
| Elbow | Pull path tracking |

---

## 3. Rep Boundary Detection

- **Start:** arms extended overhead (full stretch), velocity ≈ 0
- **Bottom:** bar pulled to chest/upper-chest level, velocity ≈ 0
- **End:** return to full stretch, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Torso Angle Stability (Leaning Back / Using Momentum)

**Standard:** Torso should stay relatively upright (a slight backward lean is normal and expected) but should not progressively lean back further to use body weight to assist the pull, which is a common fatigue-driven fault.

- **Pass:** Torso angle on a given rep stays within tolerance of the athlete's own rep-1 baseline angle.
- **Fail:** Torso angle leans back beyond the tolerance band relative to that baseline — exact tolerance TBD during Phase 0, per-athlete calibration since starting lean varies by individual preference (same pattern as barbell row's torso-angle fault).

**Cue trigger (corrective):** "You leaned back further on reps 7 and 8 compared to your first rep — sit tall and pull with your back instead of using your body weight to help."

**Cue trigger (positive):** If torso angle held across the set: "Your torso angle stayed consistent the whole set — no leaning back to add momentum." Leads the cue list per Section 4.2.3.

### 4.2 Range of Motion

**Standard:** Bar should reach a full stretch at the top (arms fully extended) and reach the chest/upper-chest at the bottom — not stop short at either end.

- **Pass:** Wrist y-coordinate at both rep extremes reaches within tolerance of the athlete's own rep-1 baseline range.
- **Fail:** Either end of the rep falls short beyond the tolerance band.

**Cue trigger:** "Reps 5 and 6 weren't pulled all the way down — get a full pull to your chest on every rep."

### 4.3 Elbow Path

**Standard:** Elbows should drive down and back in a consistent path, not flare out wide or pull primarily with the arms instead of the back.

- **Pass:** Elbow path stays within a tolerance band of the athlete's own rep-1 baseline path.
- **Fail:** Elbow path deviates beyond the tolerance band — exact threshold TBD during Phase 0.

**Cue trigger:** "Your elbows flared out wide on rep 4 — keep them tracking down and back, closer to your sides."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one short rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or lean-back/momentum fault present on multiple reps (weighted more heavily — same momentum-compensation logic as barbell row and bench's hip-lift-off) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Torso angle baseline & tolerance** — per-athlete rep-1 calibration, same pattern as barbell row.
2. **Range-of-motion baseline** — per-athlete calibration, same pattern as bench/row.
3. **Elbow path tolerance** — needs real footage across different builds and grip widths.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

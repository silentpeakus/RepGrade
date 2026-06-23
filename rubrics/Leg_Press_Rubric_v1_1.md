# RepGrade Exercise Rubric: Leg Press (v1)

**Rubric version:** 1.0
**Exercise:** Leg Press
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Leg press is a fixed-path machine exercise, which meaningfully narrows the fault list compared to free-weight compounds — there's no bar path or balance fault to track, since the sled travels on a constrained rail. The two faults that matter are depth/range of motion and lower-back rounding off the seat pad (a common fault when athletes push depth beyond their hip mobility). Knee tracking (valgus) is excluded for the same frontal-plane reason as squat.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Hip | Depth measurement, lower-back-off-pad detection |
| Knee | Depth measurement (angle at bottom of rep) |
| Ankle | Foot position stability reference (secondary signal) |
| Shoulder/mid-back (estimated) | Lower-back-off-pad detection (rounding away from the seat) |

---

## 3. Rep Boundary Detection

- **Start:** legs extended (not necessarily full lockout — many lifters stop just short to protect the knees), velocity ≈ 0
- **Bottom:** knee angle at minimum for that rep, velocity ≈ 0
- **End:** return to extended position, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Depth / Range of Motion

**Standard:** Knee angle should reach a meaningful depth (commonly ~90° or slightly past, depending on the athlete's hip mobility and the specific machine) consistently across reps — not progressively shorten as the set gets harder.

- **Pass:** Knee angle at rep bottom stays within a tolerance band of the athlete's own rep-1 baseline depth.
- **Fail:** A rep's depth falls short of that baseline beyond the tolerance band — exact tolerance TBD during Phase 0. Per-athlete calibration from rep 1, same pattern as RDL and bench, since hip mobility varies and machine seat angle differs across gyms.

**Cue trigger (corrective):** "Reps 6 and 7 didn't go as deep as your first rep — keep the same range of motion through the whole set instead of shortening it as it gets harder."

**Cue trigger (positive):** If depth held across the set: "You kept the same depth on every rep — no shortening as the set got harder." Leads the cue list per Section 4.2.3.

### 4.2 Lower Back Lifting Off the Pad

**Standard:** Lower back/hips should stay in contact with the seat pad throughout the rep — letting the hips round up and away from the pad at depth (common when pushing range of motion beyond comfortable hip mobility) shifts load onto the lower back in a position it's not braced for.

- **Pass:** Hip/shoulder positioning relative to the seat pad stays within a tolerance band of the seated baseline throughout the rep.
- **Fail:** A detectable separation from the pad — most commonly at the bottom of a deep rep — exceeding the tolerance band.

**Cue trigger:** "Your lower back came off the pad at the bottom of rep 4 — that's a sign you're going deeper than your hips can control. Bring the depth back slightly to keep your back flat against the pad."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full depth on all reps | A | 93–100 |
| 1 minor fault (e.g., one shallow rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or back-off-pad fault present (weighted heavily — same injury-relevance logic as back rounding in squat/deadlift/RDL) | C or below | ≤72 |

Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Depth baseline & tolerance** — per-athlete rep-1 calibration, since hip mobility and machine seat angle vary.
2. **Back-off-pad detection threshold** — needs real footage; this fault is subtler than squat's back rounding since the athlete is seated, not standing under load.
3. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

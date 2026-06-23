# RepGrade Exercise Rubric: Back Squat (v1)

**Rubric version:** 1.0
**Exercise:** Back Squat
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

This rubric grades **only sagittal-plane (side-view) faults**: depth, back rounding, and heel lift. Knee valgus (a frontal-plane fault) is explicitly **excluded from v1 squat grading** — a side camera cannot reliably detect knees caving inward, since the near-side knee occludes the far-side knee from this angle. Do not attempt to infer valgus from side-view footage; a false reading here would erode trust in the grade faster than omitting the fault entirely.

If a future version adds a second required camera angle (front/45°) for squat, valgus detection should be added as a 4th fault at that point — not retrofitted onto side-view data.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Hip (greater trochanter proxy) | Depth measurement, hip hinge tracking |
| Knee | Depth measurement (horizontal plane reference), heel-lift cross-check |
| Ankle | Heel lift detection, base stability |
| Shoulder | Back angle / torso lean tracking |
| Mid-back (thoracic, estimated) | Back rounding detection |

Pose model needs frame-by-frame (x, y) coordinates for these five points across the full rep. Bar path is not separately tracked for squat in v1 — torso/hip/knee relationships are sufficient for the three faults in scope.

---

## 3. Rep Boundary Detection

A rep is bounded by:
- **Start:** hip at highest point (top of squat, standing), velocity ≈ 0
- **Bottom:** hip at lowest point in the rep (local minimum of hip y-coordinate)
- **End:** return to standing, velocity ≈ 0

Tempo timing (eccentric/concentric/pause) is computed from these boundaries but graded separately under the Tempo dimension — not part of this Form rubric.

---

## 4. Fault Definitions & Thresholds

### 4.1 Depth

**Standard:** Hip crease must break the horizontal plane of the top of the knee at the bottom of the rep (decided standard — not parallel, not ATG).

- **Pass:** Hip y-coordinate at rep bottom ≤ knee y-coordinate (hip crease at or below knee top) → rep counts as full depth.
- **Fail:** Hip y-coordinate at rep bottom > knee y-coordinate by more than a small tolerance band (tolerance TBD during Phase 0 calibration against real video — pose estimation noise means an exact pixel threshold needs empirical tuning, not a guess).
- **Partial credit zone:** within tolerance band of the depth line — flag as "borderline," do not auto-fail, but note in rep-level breakdown.

**Cue trigger:** If 2+ reps in the set fail depth, cue should read something like: "Reps 3 and 5 didn't reach full depth — hip didn't break parallel with the knee. Focus on sitting back further before driving up."

### 4.2 Back Rounding (Lumbar/Thoracic Flexion)

**Standard:** Torso angle (shoulder-to-hip line relative to vertical) should not show a sharp, sudden increase in forward lean concentrated at the back specifically — distinguished from an *overall* forward lean, which can be a normal squat-style variation (e.g., low-bar squats naturally lean more than high-bar).

- **Pass:** Back angle stays consistent through the rep (no sudden inflection in the shoulder-hip-vertical angle at any single frame relative to the surrounding frames).
- **Fail:** A detectable inflection point — a frame-over-frame angle change exceeding a calibrated threshold — localized around the bottom portion of the rep, where spinal flexion under load typically shows up. Exact degree threshold: TBD during Phase 0 calibration (this is the fault most likely to need real coach-reviewed video before a number can be trusted — torso angle alone can't distinguish "rounding" from "athlete's normal squat style" without seeing real examples first).

**Cue trigger:** "Your lower back rounded on rep 4 as you came out of the bottom — brace your core harder before descending and keep your chest up through the sticking point."

### 4.3 Heel Lift

**Standard:** Heel should remain in contact with the floor (or shoe sole, for raised-heel shoes) throughout the rep — no detectable upward translation of the ankle keypoint relative to the floor plane.

- **Pass:** Ankle y-coordinate stays within a small noise-tolerance band of its starting (floor-contact) position throughout the rep.
- **Fail:** Ankle y-coordinate rises above the tolerance band at any point — most commonly at the bottom of the rep or during the drive out of the hole.

**Cue trigger:** "Your heels lifted off the floor on the way up on reps 2 and 3 — this usually means ankle mobility or weight distribution shifting too far forward. Try pausing in the bottom to reset your foot pressure before driving up."

---

## 5. Grade Band Mapping (Form Sub-Score)

Per-rep fault count rolls up into a set-level Form score. **Proposed mapping (needs Phase 0 validation against real coach judgment, not just internal logic):**

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full depth on all reps | A | 93–100 |
| 1 minor fault (e.g., one borderline-depth rep) OR consistent small heel lift | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated across multiple reps | B / B- | 73–82 |
| 3+ faults, or any back-rounding fault present (weighted more heavily — injury-relevant) | C or below | ≤72 |

**Why back rounding is weighted more heavily than depth or heel lift:** it's the fault most associated with injury risk under load, so the rubric should not let a back-rounding rep be "averaged out" by otherwise-clean reps the way a borderline-depth rep might be. This is a deliberate asymmetry in the grade band logic, not an oversight — flag this explicitly when you build the scoring function so it isn't accidentally "simplified" into a flat average later.

**This table is a starting hypothesis, not a final answer.** Phase 0's actual job is running this against real squat video and checking whether the resulting letter grade matches what a real coach would say watching the same clip. Expect to revise the thresholds, not just confirm them.

---

## 6. Open Items for Phase 0 Calibration

These are not v1 product decisions (those are locked in the main spec) — they're the empirical tuning work this specific rubric still needs once you have real video to test against:

1. **Depth tolerance band** (pixels/degrees) — needs real footage across different body proportions (limb length affects how "parallel" looks at a given joint angle).
2. **Back-rounding inflection threshold** — the fault most likely to need a coach's eye on real clips before a number is trustworthy.
3. **Heel-lift tolerance** — needs to account for camera distance/resolution noise so small pose-estimation jitter doesn't get flagged as a real fault.
4. **Grade band cutoffs** (the 93/83/73 lines in Section 5) — hypothesis only, validate against coach baseline.

---

*This rubric covers Form only. Intensity and Tempo scoring for squat use the cross-exercise logic defined in the main Project Specifications document (Sections 4.1.1 and 4.2) and do not need exercise-specific rubrics in the same way Form does — tempo timing and intensity proxies generalize across exercises; fault detection does not.*

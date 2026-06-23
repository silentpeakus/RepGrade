# RepGrade Exercise Rubric: Bench Press (v1)

**Rubric version:** 1.0
**Exercise:** Bench Press
**Required camera angle:** Side view (sagittal plane)
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

This rubric grades sagittal-plane faults visible from the side: bar path, range of motion (full touch to lockout), and hip/glute contact with the bench. Elbow flare angle (how wide the elbows travel relative to the torso) has both a sagittal and frontal component — side view captures *some* of this (elbow position relative to the bar at the bottom) but cannot fully judge symmetric flare on both arms simultaneously. This rubric grades elbow position as visible from the side; full bilateral elbow-flare symmetry is out of scope for v1 single-camera grading.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Wrist/bar proxy | Bar path tracking (vertical displacement, forward/back drift) |
| Elbow | Elbow position relative to torso at bottom of rep, lockout detection |
| Shoulder | Bar path reference point, range-of-motion baseline |
| Hip | Glute-bench contact (lift-off detection) |

Pose model needs frame-by-frame (x, y) coordinates for these four points. Bar path is the primary signal for this exercise — unlike squat, where bar path was skipped, bench press grading depends heavily on it.

---

## 3. Rep Boundary Detection

- **Start:** bar/wrist at full lockout (elbows extended, arms vertical), velocity ≈ 0
- **Bottom:** bar at lowest point (chest touch), local minimum of wrist y-coordinate
- **End:** return to full lockout, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Range of Motion (Touch Point)

**Standard:** Bar must reach the chest (or very near it — full stretch at the bottom) on every rep. Partial reps that stop short are a fault.

- **Pass:** Wrist y-coordinate at rep bottom reaches within a small tolerance of the athlete's chest-height baseline (established from their own lockout-to-setup positioning at the start of the set).
- **Fail:** Bottom position falls short of that baseline by more than the tolerance band — exact tolerance TBD during Phase 0 calibration (chest depth varies by athlete build, so this likely needs to be calibrated per-athlete from their own first rep rather than a single fixed pixel value).

**Cue trigger (corrective):** "Reps 4 and 5 cut short — the bar didn't reach your chest. Slow down the descent and make sure you're getting a full stretch before pressing."

**Cue trigger (positive):** If all reps reach the chest cleanly: "You touched your chest on every rep — full range of motion held throughout the set." Leads the cue list per Section 4.2.3.

### 4.2 Bar Path (Forward Drift)

**Standard:** Bar should travel in a relatively straight vertical line (or a slight J-curve, which is normal/expected) — not drift significantly forward over the face/shoulders during the press.

- **Pass:** Wrist x-coordinate stays within a tolerance band of a straight line from chest-touch point to lockout point.
- **Fail:** Bar drifts forward (toward the feet, away from the face) beyond the tolerance band mid-rep — typically a sign of compensating with shoulders/triceps instead of a stable press pattern.

**Cue trigger:** "Your bar path drifted forward on rep 3 instead of staying vertical — focus on pressing the bar back toward your face slightly, not straight up and forward."

### 4.3 Hip/Glute Lift-Off

**Standard:** Hips should remain in contact with the bench throughout the rep (no arching up off the bench to leg-drive the weight up — a common fault when the weight is near-maximal).

- **Pass:** Hip y-coordinate stays within a small tolerance of the starting bench-contact position throughout the rep.
- **Fail:** Hip y-coordinate rises above the tolerance band — most commonly during the press phase on a heavy/grinding rep.

**Cue trigger:** "Your hips came off the bench on rep 5 — keep your glutes planted and drive through your upper back and legs instead of arching to generate momentum."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults, full ROM on all reps | A | 93–100 |
| 1 minor fault (e.g., one borderline-ROM rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated across multiple reps | B / B- | 73–82 |
| 3+ faults, or any hip lift-off present (weighted more heavily — indicates the working weight may be exceeding controlled capacity) | C or below | ≤72 |

**Why hip lift-off is weighted more heavily:** unlike a slightly-short rep or minor bar drift, hip lift-off usually signals the athlete is compensating with momentum/leg drive rather than controlled pressing strength — it's a more meaningful form breakdown than the other two faults, similar to how back rounding was weighted in the squat rubric. Same asymmetric-weighting principle, applied to this exercise's most form-critical fault.

This table is a starting hypothesis — validate against real video and coach judgment in Phase 0, expect to revise.

---

## 6. Open Items for Phase 0 Calibration

1. **Chest-touch baseline calibration** — needs to be set per-athlete from their own first rep, not a fixed value, since chest depth varies by build.
2. **Bar path tolerance band** — needs real footage to determine what counts as "normal J-curve" vs. an actual drift fault.
3. **Hip lift-off tolerance** — small natural hip movement vs. a real lift-off needs a real threshold, not a guess.
4. **Grade band cutoffs** — hypothesis only.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

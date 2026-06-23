# RepGrade Exercise Rubric: Overhead Press (v1)

**Rubric version:** 1.0
**Exercise:** Overhead Press
**Required camera angle:** Front view
**Status:** Draft — pending validation against real video (Phase 0)

---

## 1. Scope & Camera Constraint

Unlike squat/bench/deadlift, this rubric requires a **front-view** camera, not side view. The dominant OHP faults — bar path drifting forward instead of staying vertical, and left/right asymmetry (one arm pressing ahead of the other, or the bar tilting side to side) — are frontal-plane faults. A side view would hide left/right asymmetry entirely and only partially capture forward drift. Range of motion (lockout overhead, starting position at the shoulders) is visible from either angle, so front view loses nothing there.

This is the first rubric in the v1 set to use front view instead of side view — flagging this because it means the pre-flight validation and capture-guidance UI need to prompt the athlete differently for this exercise specifically, not apply one universal "stand to the side" instruction across all exercises.

---

## 2. Joints & Keypoints Tracked

| Keypoint | Purpose |
|---|---|
| Left wrist / right wrist | Bar path symmetry (side-to-side tilt detection) |
| Left elbow / right elbow | Press symmetry, lockout detection |
| Left shoulder / right shoulder | Baseline reference for symmetry and bar path |
| Nose/head (proxy for centerline) | Forward-drift reference — bar should not pass in front of the face |

Bilateral tracking (left and right separately) matters here in a way it didn't for squat/bench/deadlift, since the core fault is an L/R imbalance.

---

## 3. Rep Boundary Detection

- **Start:** bar at shoulder/collarbone height, both wrists level, velocity ≈ 0
- **Top:** bar at full overhead lockout, both elbows extended, velocity ≈ 0
- **End:** return to shoulder height, velocity ≈ 0

---

## 4. Fault Definitions & Thresholds

### 4.1 Bar Path Symmetry (Side-to-Side Tilt)

**Standard:** Both wrists should rise at roughly the same rate and reach lockout at roughly the same height — the bar should not visibly tilt to one side during the press.

- **Pass:** Left and right wrist y-coordinates stay within a tolerance band of each other throughout the rep.
- **Fail:** A detectable y-coordinate gap between left and right wrist exceeding the tolerance band at any point in the press — most common near the top, when one side fatigues or locks out first.

**Cue trigger (corrective):** "The bar tilted to your left on rep 4 — your left arm locked out before your right. Slow down and press evenly on both sides."

**Cue trigger (positive):** If both sides stayed even across the set: "Both arms pressed evenly on every rep — no side-to-side tilt in the bar path." Leads the cue list per Section 4.2.3.

### 4.2 Forward Drift (Bar Passing in Front of Face)

**Standard:** Bar should travel close to a vertical line near the face — not loop forward away from the body, which shifts the load off the shoulders and onto a less stable position.

- **Pass:** Wrist x-coordinate (midpoint of both wrists) stays within a tolerance band of a vertical line from the starting shoulder position.
- **Fail:** Bar drifts forward beyond the tolerance band — typically visible as the press moving up and out rather than straight up.

**Cue trigger:** "The bar drifted forward away from your face on rep 3 — focus on pressing straight up, brushing close to your face, and finishing with the bar stacked over your shoulders."

### 4.3 Lockout Completion

**Standard:** Both elbows must reach full extension overhead on every rep — partial presses that stop short are a fault.

- **Pass:** Both elbow angles reach within a tolerance band of full extension at the top of the rep.
- **Fail:** One or both elbows fall short of full extension — exact tolerance TBD during Phase 0 (some athletes have natural elbow hyperextension/limited extension variance, so this likely needs individual calibration similar to bench press's chest-touch baseline).

**Cue trigger:** "Reps 2 and 5 didn't reach full lockout — press all the way through until your arms are fully extended overhead."

---

## 5. Grade Band Mapping (Form Sub-Score)

| Faults across the set | Form Letter | Numeric |
|---|---|---|
| 0 faults | A | 93–100 |
| 1 minor fault (e.g., slight asymmetry on one rep) | A- / B+ | 83–92 |
| 2 faults, or 1 fault repeated | B / B- | 73–82 |
| 3+ faults, or persistent asymmetry across most reps (weighted more heavily — suggests a meaningful strength imbalance worth flagging, not just a form cue) | C or below | ≤72 |

**Why persistent asymmetry is weighted more heavily:** a single tilted rep is likely fatigue; asymmetry showing up consistently across the set is a more durable signal worth surfacing distinctly (this also has a natural tie-in to future "imbalance tracking" features, though that's out of scope for v1 — noting it here since the rubric is already tracking the data needed for it later). Same asymmetric-weighting principle as squat/bench/deadlift, applied to OHP's most form-critical fault. Hypothesis pending Phase 0 validation.

---

## 6. Open Items for Phase 0 Calibration

1. **Symmetry tolerance band** — needs real footage; natural dominant-arm asymmetry exists even in good reps and shouldn't be over-flagged.
2. **Forward-drift tolerance** — needs calibration against real pressing footage.
3. **Lockout tolerance** — may need individual calibration similar to bench press's chest-touch baseline, since natural elbow extension varies by athlete.
4. **Grade band cutoffs** — hypothesis only.
5. **Capture guidance UI** — flag to product/design that this exercise needs front-view framing instructions distinct from the side-view default used elsewhere.

---

*This rubric covers Form only. Intensity and Tempo use the cross-exercise logic in the main Project Specifications document.*

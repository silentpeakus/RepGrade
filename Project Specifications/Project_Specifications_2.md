# Project Specifications: RepGrade (v1 — Athlete MVP)

**Document owner:** [Your name]
**Last updated:** June 20, 2026
**Status:** v1 scope locked — ready for Phase 0

---

## 1. Product Summary

RepGrade is an AI-powered bodybuilding form analysis app. Athletes upload a set video; RepGrade grades it across three dimensions — **Form**, **Intensity**, and **Tempo** — and rolls those into a single GPA-style score per exercise and overall. Over time, RepGrade tells the athlete when their technique on a given exercise is consistent enough to safely progress weight (progressive overload).

**v1 scope (this document):** Athlete-only. Upload → analyze → grade → feedback → GPA history / report card. Trainer dashboard is explicitly **out of scope** for v1 and is noted only as a forward-compatibility constraint on the data model (Section 4.4).

---

## 2. Goals and Non-Goals

### 2.1 Goals (v1)
- Athlete can upload a video of a single set of a single exercise.
- System returns, within an acceptable wait time, a grade on Form, Intensity, and Tempo, plus 2–4 specific, actionable cues.
- Grades roll up into a per-exercise GPA and an overall GPA, viewable as a "report card" over time.
- System flags when an exercise's recent grade trend justifies a progressive-overload recommendation.
- Athlete can see history: past videos, grades, and trends per exercise.

### 2.2 Non-Goals (v1)
- Trainer dashboard, client management, multi-user accounts (v2).
- Real-time / live-camera analysis (v1 is upload-after-the-fact only).
- Programming / workout planning (RepGrade grades sets, it does not prescribe full programs in v1).
- Support for non-bodybuilding modalities (Olympic lifts, gymnastics, sport-specific movement) — bodybuilding/hypertrophy-style exercises only.
- Social/community features (leaderboards, sharing) — not in v1, but the GPA framing should be built so it *could* support this later.

---

## 3. User Flow (Athlete, v1)

1. **Capture / Upload**
   - **Decision: both capture paths supported.** Athlete can either record a set in-app or upload existing footage from their camera roll.
   - Athlete selects the exercise from a list (auto-detection is a v2 stretch goal; v1 relies on explicit selection for grading accuracy).
   - Athlete uploads the video (or finishes in-app recording, which then proceeds through the same upload path).
   - **Design implication:** in-app recording lets the app guide framing/angle in real time (e.g., on-screen guide for camera distance and angle per exercise), which materially reduces pre-flight validation failures. Camera-roll uploads get no such guardrail at capture time, so pre-flight validation (step 2 below) needs to be more thorough and more athlete-friendly for that path, since rejections will be more frequent.

2. **Pre-flight validation**
   - System checks: video length, file size/format, that a person and barbell/dumbbell/machine are visible, lighting/framing sufficient.
   - If validation fails, athlete gets specific re-shoot guidance (e.g., "Move the camera further back — your legs are out of frame.") rather than a generic error.

3. **Processing**
   - Video is sent to the grading pipeline (Section 5).
   - **Decision: 1–2 minutes is an acceptable wait, provided the athlete knows it's coming.** This means a clear progress/status UI (not a spinner with no context) is required, but it also means v1 does not need to optimize for sub-10-second sync processing — a reasonable async/queued model is acceptable. This materially simplifies pipeline design (Section 5) versus a near-instant requirement.

4. **Results**
   - Athlete receives:
     - Overall set grade (letter, e.g., B+)
     - Sub-scores: Form, Intensity, Tempo
     - 2–4 specific cues tied to *what was observed* (e.g., "Knees caved in on reps 3 and 5 — focus on pushing knees out."), each paired with a key still-frame at the relevant rep where feasible
     - **Decision: full annotated video overlay (joint tracking burned into the video) is out of scope for v1.** Text cues + key still-frames only — see Section 8 for rationale.
     - Progressive-overload signal: "Ready to add weight" / "Maintain current weight" / "Dial back — form breaking down," with the reasoning behind it.

5. **History / Report Card**
   - Athlete can view GPA trend per exercise over time.
   - Athlete can view overall GPA across all logged sessions.
   - Athlete can drill into any past set to review the original grade, cues, and video.

---

## 4. Data Requirements

This is the core of what the AI grading pipeline needs — both as **inputs to capture** and **outputs to produce**.

### 4.1 Inputs Required for Grading

| Input | Source | Required? | Notes |
|---|---|---|---|
| Video file | Athlete upload | Required | See constraints below |
| Exercise identity | Athlete-selected (dropdown/search) | Required for v1 | Auto-detection via vision model is a v2 stretch goal — do not rely on this for v1 grading accuracy |
| Camera angle | Athlete-selected or inferred | Recommended | Form cues differ by angle (e.g., squat depth needs a side view; knee valgus needs a front/45° view). Athlete should be prompted to choose the correct angle for the exercise. |
| Bodyweight / load used | Athlete-entered | **Optional, but prompted at upload** (decided) | Not required to submit a video, but the upload flow should actively ask for it each time rather than hiding it as a buried optional field. Needed for any future "intensity relative to 1RM" features; even in v1 it materially improves Intensity scoring (see 4.1.1) |
| Target rep range | Athlete-entered (e.g., "8–10") | **Required for v1** | Simple numeric range entered at upload, no inference logic needed. This is a foundational field, not a stretch feature — the Progressive Overload Stability Gate (Section 4.2.2) cannot evaluate "hit the top of the target range" without it, and it cannot be backfilled onto historical sets later. Capture it from day one even though nothing else in v1 strictly requires it yet. |
| RPE / RIR (perceived effort) | Athlete-entered (e.g., RPE 1–10 or RIR 0–5+) | **Required for v1** | Simple self-reported number at upload. Feeds the Intensity Floor gate (Section 4.2.2). Self-report is known to be noisy, especially in less experienced lifters, but deriving an objective effort signal from bar-speed velocity decay is a real research effort better suited to v2 — see Section 4.2.2 for the tradeoff. |
| Rep count (visually detected) | Derived from pose pipeline | Derived | Not athlete-entered; computed |
| Prior grading history for this exercise | System (database) | Derived | Needed to compute GPA trend and the progressive-overload signal |

**Video constraints (must define and enforce):**
- Max length: **60 seconds per set (decided)**
- Max file size
- Min resolution (pose estimation accuracy degrades sharply below a certain resolution)
- Frame rate minimum (tempo timing is meaningless below ~24fps; phone defaults are usually fine, but confirm)
- Single person in frame, full range of motion visible (camera shouldn't crop the bar path or joints being evaluated)

**4.1.1 Why load/bodyweight matters even in v1:** Pose estimation can tell you *that* a knee caved in, but it cannot tell you whether 185lbs for 8 reps is appropriately intense for that athlete. Without some notion of load, "Intensity" scoring is reduced to proxy signals (bar speed, rep-to-rep velocity decay, visible strain/grinding on later reps). **Decision: optional-but-prompted.** The upload flow asks for weight/reps every time, but a video can still be submitted without it. When load is missing, Intensity scoring falls back to velocity/strain proxies (slower, grindier reps toward the end of a set imply higher relative intensity) — weaker signal than load-aware scoring, but removes friction for athletes who don't bother tracking numbers. The grading pipeline should record whether a given Intensity score was load-aware or proxy-based, since this affects how much weight that score should carry in GPA trend logic.

### 4.2 Outputs Produced per Grading Event

| Output | Type | Notes |
|---|---|---|
| Form score | Letter + underlying numeric (e.g., 0–100 mapped to A–F) | Per-exercise rubric required (see 4.2.1) |
| Intensity score | Letter + numeric | See 4.1.1 caveat |
| Tempo score | Letter + numeric | Eccentric/concentric/pause timing vs. target tempo |
| Composite set grade | Letter + numeric | Weighted roll-up of the three (weights TBD — likely configurable per exercise) |
| Cues | 2–4 short text strings, each tied to a specific rep/timestamp where possible | This is the qualitative LLM layer |
| Rep-level breakdown | Array of per-rep metrics (joint angles at key points, tempo per rep, detected faults) | Powers both the cues and the history charts |
| GPA contribution | Numeric, feeds into rolling exercise GPA and overall GPA | **Decision: recency-weighted.** More recent sets carry more weight than older ones in the rolling average — see Section 4.3 for rationale. Exact decay function/window is a Phase 1 implementation detail, not a v1 product-spec decision. |
| Progressive overload signal | Enum: Ready / Maintain / Regress, + 1-sentence reasoning | See Section 4.2.2 for full gate logic (decided) |

**4.2.1 Per-exercise rubric requirement:** "Good form" means structurally different things per exercise (squat depth and knee tracking vs. bench bar path and elbow flare vs. deadlift back rounding). This means the pose-estimation layer needs a **rubric definition per supported exercise** — the joints to track, the angles/positions that matter, and the thresholds for each grade band. This is the single largest content-creation task in the roadmap and should be scoped exercise-by-exercise, not assumed to generalize.

**Decision: 13 exercises confirmed for v1**, spanning major compounds and their most common accessories:

- **Lower body:** Back squat, deadlift, Romanian deadlift, leg press
- **Push:** Bench press, overhead press, incline dumbbell press, dip, lateral raise
- **Pull:** Barbell row, lat pulldown, seated cable row, pull-up

This list is final for v1 — confirmed June 2026. Rubric-writing in Phase 0 should scope to exactly these 13, not the earlier placeholder range. (Note: lateral raise is categorized under Push/shoulders here, not Pull, since it's a deltoid-driven movement — flagging in case the original grouping was intentional rather than a labeling slip.)

**4.2.2 Progressive Overload Logic — the "Stability Gate" (decided for v1)**

This is the core trust mechanic of the product — the system telling an athlete when it's actually time to add weight. v1 ships a 3-gate check, all of which must pass:

```
IF  (Form GPA, weighted avg over the current load's last 2+ sessions) >= 3.7   [Gate 1: Form]
AND (Top of target rep range met for 2 consecutive sessions at current load)   [Gate 2: Consistency]
AND (RPE >= 8, or RIR <= 2, self-reported, on the qualifying sessions)         [Gate 3: Intensity Floor]
THEN: Recommend +2.5% to 5% load increase
ELSE: Maintain current load
```

**Why the Intensity Floor matters (Gate 3):** without it, an athlete grinding out perfect-looking reps at a weight that's far too light for them gets a false "Ready" signal — high Form GPA, reps met, but the set never actually tested their strength. RPE ≥ 8 / RIR ≤ 2 ensures the form score being evaluated came from a set that was actually hard, which is the only condition under which "form held up" is meaningful evidence that more weight is appropriate.

**Scoped down for v1 (decisions, not open questions):**
- **Form GPA window is tied to Gate 2's 2-session check**, not an independent rolling window — i.e., the 3.7 threshold is evaluated over the same 2+ sessions at the current load that Gate 2 is checking, not the athlete's all-time or unrelated recent average. This keeps the gate internally consistent: a strong long-term average can't paper over two mediocre sessions at the weight actually being evaluated for increase.
- **RPE/RIR is self-reported** in v1 — a simple number entered at upload (see Section 4.1). Deriving an objective "effective RPE" from bar-speed velocity decay is a real research and tuning effort, not a v1 task; self-report is noisy but sufficient to ship the core mechanic. Revisit as a v2 refinement once real usage data shows how unreliable self-report actually is in practice.
- **Output stays a 3-state signal for v1: Ready / Maintain / Regress.** A failed gate doesn't get its own enum value yet — instead, the *cue text* returned alongside "Maintain" should say which gate failed and why (e.g., "Your form's solid and you're hitting your reps, but these sets aren't intense enough yet — push closer to failure before adding weight" vs. "Dial in your form at this weight before pushing further"). Splitting "Maintain" into gate-specific enum states (e.g., Hold-Form vs. Hold-Intensity) is a reasonable v2 refinement once it's clear which failure mode athletes hit most often — it doesn't require new data to add later, since the underlying gate results are already being computed and can just be surfaced more granularly.
- **"Regress"** is reserved for form actively breaking down (a meaningfully declining Form GPA trend at the current load), not merely "not ready yet" — these are different athlete situations and shouldn't share a signal.

### 4.3 GPA / History Data Model (conceptual)

- `Athlete` → has many `Sessions`
- `Session` → has many `SetEntries` (one per uploaded video)
- `SetEntry` → belongs to one `Exercise`, has one `Grade` (Form/Intensity/Tempo/Composite), has many `RepDetections`, has one `ProgressiveOverloadSignal`, and stores `TargetRepRange` and `RPE`/`RIR` as athlete-entered fields (required at upload — see Section 4.1)
- `Exercise` → has a `Rubric` (versioned — rubrics will improve over time, and you'll want to know which rubric version graded a historical set)
- **Rolling GPA formula — decided: recency-weighted average.** More recent `SetEntry.Grade` values count more heavily than older ones, for a given `Exercise`/`Athlete` pair. Rationale: a lifter who's improved over the last month shouldn't have their current GPA dragged down by an unrepresentative average against months-old sets — recency-weighting matches what the GPA is supposed to communicate (current standing, not lifetime average). Exact decay function and lookback window are Phase 1 implementation details, not specified here.
- This is distinct from the Stability Gate's own fixed 2-session window (Section 4.2.2), which does not use this weighting — the gate always looks at the last 2+ sessions at the current load specifically, regardless of how the headline GPA is computed.
- Stability Gate evaluation (Section 4.2.2) reads `SetEntry.Grade`, `TargetRepRange`, and `RPE`/`RIR` across the last 2+ `SetEntries` at the current load for a given `Exercise`/`Athlete` pair — this is a computed check, not a stored field, but depends on `TargetRepRange` and `RPE` being present on every relevant `SetEntry`

**Important architectural note:** Version your rubrics from day one. When you improve the squat rubric in month 4, you do not want old grades silently reinterpreted under a new standard — store which rubric version produced each grade.

### 4.4 Forward-compatibility note (for the Trainer feature, not built in v1)

Even though the trainer dashboard is v2, the data model above should already support it without rework: `Athlete` records should support being linked to a `Trainer` later (many-to-many or one-to-many TBD), and nothing in the `SetEntry`/`Grade` structure should be athlete-app-specific. This costs nothing to do now and avoids a migration later.

---

## 5. Grading Pipeline Architecture (Hybrid Approach)

Per your direction, grading uses a **hybrid pipeline**: pose estimation for objective, reproducible metrics; an LLM for qualitative coaching language. High-level flow:

```
Video Upload
     │
     ▼
Pre-flight validation (format, length, framing)
     │
     ▼
Pose Estimation Service (external — not Base44 native)
  - **Decision: use an existing pose-estimation library/model (e.g., MediaPipe-class tooling) rather than training a custom model.** Training a bodybuilding-specific model from scratch requires assembling and labeling a large annotated video dataset before any rubric work can even begin — a multi-month detour that competes with the actual differentiator. Existing pose libraries already handle single-person, visible-body keypoint tracking well, which covers the core use case. Revisit a custom model later only if specific accuracy gaps emerge (e.g., heavy occlusion from gym equipment, loaded barbells confusing keypoint detection) that off-the-shelf models can't solve.
  - Extracts joint coordinates per frame
  - Detects rep boundaries (start/end of each rep)
  - Computes per-rep metrics: joint angles, ROM, tempo (eccentric/concentric/pause durations), bar-path proxy if visible
     │
     ▼
Rubric Scoring Layer
  - Applies the per-exercise rubric to the computed metrics
  - Produces objective Form/Tempo sub-scores and rep-level fault flags
     │
     ▼
LLM Coaching Layer (Claude or similar)
  - Receives: rubric scores + rep-level fault flags + (optionally) key frames
  - Produces: human-readable cues, the "why," and tone-appropriate coaching language
  - Does NOT independently re-score form from raw video in v1 — it explains/contextualizes what the pose layer already detected. (This keeps grading reproducible and auditable; an LLM re-grading the same video twice can drift, which is bad for a GPA product where consistency *is* the trust mechanic.)
     │
     ▼
Composite Grade + GPA update + Progressive Overload Signal
     │
     ▼
Stored to database, returned to athlete
```

**Why the LLM doesn't do primary scoring:** A GPA-style product lives or dies on the athlete trusting that a B+ today and a B+ next month mean the same thing. Pose-estimation-driven rubric scoring is deterministic and versionable. Pure LLM video grading is currently neither fully reproducible nor cheap to run at scale, and is best used for the part it's actually good at: turning "left knee valgus angle exceeded threshold on reps 2, 4, 6" into something a person can act on at the gym.

### 5.1 Where Base44 fits

Based on Base44's current capabilities: it's a strong fit for the **application shell** — auth, the data model in Section 4.3, video upload + CDN-backed storage, and the UI. It is **not** a fit for running the pose-estimation model itself — that needs a real ML inference environment (GPU or CPU-bound Python/compute, e.g., a containerized service running a pose model). Two viable integration patterns:

- **Pattern A:** Base44 backend function receives the uploaded video, calls out to an external pose-estimation service (your own container, hosted separately) via API, gets metrics back, then calls Base44's built-in LLM integration for the coaching-language step, and writes results to Base44 entities.
- **Pattern B:** Base44 backend function hands the video off to a single external orchestration service that runs both the pose pipeline *and* the LLM call, and returns a finished grade payload to Base44 for storage.

Pattern B is simpler to reason about and keeps Base44 strictly as the app/data layer; recommended default unless you have a reason to want the LLM call itself inside Base44's environment.

---

## 6. High-Level Roadmap

This is sequenced by *risk*, not just feature size — the grading accuracy is the product, so it gets validated before UI polish.

### Phase 0: Rubric & Pipeline Validation (no app UI required)
- Define the per-exercise rubric (joints tracked, fault thresholds, grade bands) for each of the 13 confirmed v1 exercises (Section 4.2.1).
- Stand up the pose-estimation service; validate accuracy against a manual "this is what a coach would say" baseline on a test set of real videos.
- Validate end-to-end: video in → rubric scores out, before any LLM or app work.

### Phase 1: Grading Core
- Build the rubric scoring layer on top of validated pose output.
- Build the LLM coaching-cue layer (prompt design, rep-fault-to-cue mapping).
- Implement the recency-weighted GPA formula (Section 4.3) — set exact decay function/lookback window during this phase.
- Implement the Progressive Overload Stability Gate exactly as specified in Section 4.2.2 (Form GPA ≥ 3.7 over the qualifying window, 2-session rep consistency, RPE/RIR Intensity Floor).
- This phase should be testable via API/script, independent of any frontend.

### Phase 2: Base44 App Shell
- Auth, athlete profile, exercise selection, video upload + storage.
- Backend function wiring to the grading pipeline (Pattern A or B above).
- Results screen (grade, cues, sub-scores).

### Phase 3: History & Report Card
- GPA roll-up views, per-exercise trend charts, session history.
- Progressive overload signal surfaced in history context ("you've been Ready for 3 sessions").

### Phase 4: Polish & Beta
- Pre-flight validation UX (catching bad uploads before wasted processing time) — extra emphasis needed for camera-roll uploads, which lack the framing guardrails of in-app recording.
- Closed beta with real athletes; recalibrate rubrics against real-world feedback.
- Full video overlay (joint tracking burned into video) is explicitly deferred past v1 — do not schedule it here.

### Phase 5 (post-v1, not detailed here): Trainer dashboard, multi-user, exercise catalog expansion.

---

## 7. Decisions Log & Remaining Open Questions

### 7.1 Resolved (as of this revision)

| Question | Decision |
|---|---|
| Exercise list scope | **Final: 13 exercises** — back squat, deadlift, Romanian deadlift, leg press, bench press, overhead press, incline dumbbell press, dip, lateral raise, barbell row, lat pulldown, seated cable row, pull-up. See Section 4.2.1. |
| Load entry | Optional, but actively prompted at every upload. Velocity/strain proxy used when omitted. |
| Capture method | Both in-app recording and camera-roll upload supported. |
| Processing time | 1–2 minutes acceptable with clear progress UI. No sub-10-second sync requirement. |
| Pose estimation: build vs. buy | Buy/use existing pose-estimation library; do not train a custom model for v1. |
| Annotated video output | Text cues + key still-frames only at launch. Full video overlay deferred post-v1. |
| Progressive overload rule | 3-gate "Stability Gate" logic (Form GPA ≥ 3.7, 2-session rep consistency, RPE ≥ 8/RIR ≤ 2) — full detail in Section 4.2.2. Self-reported RPE and a 3-state signal (Ready/Maintain/Regress) for v1; gate-specific sub-states and derived-RPE are v2 refinements. |
| GPA formula | **Recency-weighted average.** Recent sets count more than older ones. Exact decay/window set during Phase 1 implementation. See Section 4.3. |
| Max video length | **60 seconds per set.** See Section 4.1. |

### 7.2 Still Open

None remaining as of this revision. All items required to begin Phase 0 are resolved. Implementation-level details deferred intentionally to Phase 1 (exact GPA decay function/window) are not blockers — see Section 4.3.

---

## 8. Risks & Considerations

- **Rubric quality is the product.** If the grading doesn't match what a real coach would say, nothing else matters. Budget real time (and ideally a real coach's input) for Phase 0 — don't treat it as a formality before "the real work."
- **Video variability in the wild** (bad lighting, partial framing, baggy clothing obscuring joints) will be the biggest practical failure mode, not model accuracy in ideal conditions. Pre-flight validation (Section 3, step 2) is not optional polish — it's load-bearing.
- **Processing cost/latency at scale:** pose estimation + LLM calls per video is non-trivial compute cost per grading event. Worth modeling unit economics early, even pre-launch.
- **Grading consistency over time** is what makes a GPA trustworthy. Rubric versioning (Section 4.3) and minimizing per-call LLM scoring drift (Section 5) both exist to protect this.
- **Self-reported RPE is noisy, especially for less experienced lifters** (Section 4.2.2) — athletes commonly misjudge proximity to failure. The Intensity Floor gate inherits this noise in v1. Worth watching in beta whether this produces visibly wrong "Ready" or "Maintain" signals; if so, a velocity-derived effective-RPE proxy becomes a higher-priority v2 item than currently scoped.

---

*End of draft. All v1 scoping decisions are now resolved (Section 7.1). Remaining work is implementation detail (e.g., exact GPA decay function) to be settled during Phase 1, not open product questions. Roadmap in Section 6 can now be time-estimated.*

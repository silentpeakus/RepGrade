# Project Specifications: RepGrade (v1 — Differentiation Features)

**Document owner:** [Your name]
**Last updated:** June 22, 2026
**Status:** Draft for review
**Companion to:** `Project_Specifications_2.md` (v1 scope locked). This document adds no new
pipeline work and overrides none of the locked decisions in §7.1 of that document — it specifies
how already-computed outputs are surfaced, plus one net-new content asset (Feature 3).

---

## 1. Purpose

The locked v1 spec already contains RepGrade's structural moat — the GPA model and the Progressive
Overload Stability Gate (`Project_Specifications_2.md` §4.2.2). Competitor apps in this category
(e.g. FormFix-class single-rep "is this good?" checkers) grade a lift in isolation and stop there.
They have no longitudinal model and nothing resembling a progression-readiness mechanic.

This document specifies three features that convert that structural advantage into something an
athlete can *see and act on*, without expanding v1 scope:

1. **Stability Gate "Ready to progress?" view** — make the gate the hero of the UI, not a footnote.
2. **"Why this grade" transparency** — expose the objective thresholds behind each sub-score.
3. **Corrective drill prescription on a failed gate** — turn "Maintain" into a next action.

Features 1 and 2 surface data the pipeline already produces (`Project_Specifications_2.md` §4.2,
§4.2.2) and require no new computation. Feature 3 introduces one new content asset (a fault→drill
library) and is flagged as such in §4.

**Explicitly still out of scope (unchanged from locked spec §2.2 / §7.1):** burned-in video overlay,
live/real-time coaching, social sharing. None of the features below reintroduce those.

---

## 2. Feature 1 — Stability Gate "Ready to Progress?" View

### 2.1 Summary

A dedicated per-exercise screen that renders the three Stability Gates as an explicit pass/fail
checklist, with the current standing on each and the single reason progression is or isn't unlocked.
Today the progression signal is one enum returned on the results screen
(`Project_Specifications_2.md` §3.4 / §4.2). This feature promotes it to a first-class, persistent
view the athlete can open for any exercise at any time.

### 2.2 Rationale

The Stability Gate is the one thing in RepGrade a competitor cannot copy without rebuilding their
data model — it depends on the GPA history, target-rep consistency, and RPE that a single-rep checker
never stores. Making it a buried result line under-sells the product's only structural moat. As a
standalone, openable view it becomes the most distinctive and screenshot-worthy surface in the app.

### 2.3 UI specification

Design system per `CLAUDE.md`: charcoal `#121212` background, deep-grey `#1E1E1E` surfaces, warm
amber `#FFB000` for the unlocked/action state, sharp borders, no excessive rounded corners,
clinical/minimalist.

- **Header:** exercise name + current working load (e.g. "Back squat · 185 lb").
- **Verdict banner:** the three-state signal (Ready / Maintain / Regress). Amber when Ready;
  neutral grey when Maintain; high-contrast warning treatment when Regress. One sentence of reasoning
  directly beneath, sourced from the existing cue text (`Project_Specifications_2.md` §4.2.2).
- **Three gate rows**, each showing the gate name, the athlete's current value, the threshold, and a
  pass/fail state:
  - Gate 1 — Form: Form GPA over the qualifying window vs. ≥ 3.7
  - Gate 2 — Consistency: sessions at top of target rep range vs. 2 consecutive required
  - Gate 3 — Intensity floor: self-reported RPE/RIR on qualifying sessions vs. RPE ≥ 8 / RIR ≤ 2
- **Progression recommendation** (only when all three pass): the +2.5%–5% load suggestion with the
  resulting target weight pre-computed.
- A failed gate row links to its explanation (Feature 2) and, where applicable, a prescribed drill
  (Feature 3).

### 2.4 Data dependencies

None new. Reads `SetEntry.Grade`, `TargetRepRange`, `RPE`/`RIR`, and the computed gate results
already defined in `Project_Specifications_2.md` §4.2.2 / §4.3. This is a presentation layer over an
existing computed check.

### 2.5 v1-scope confirmation

Compatible. Surfaces existing outputs only; introduces no new pipeline stage, no live analysis, no
social surface.

---

## 3. Feature 2 — "Why This Grade" Transparency

### 3.1 Summary

For any graded set, the athlete can expand each sub-score (Form, Intensity, Tempo) to see the
objective measurements and rubric thresholds that produced it — e.g. "Squat depth: hip crease 4°
below knee (passing band ≥ 0°)", "Tempo eccentric: 1.2s vs. 2.0s target — too fast". This makes the
grade auditable to the athlete rather than a black-box letter.

### 3.2 Rationale

The locked spec stakes the entire product on grading *consistency being trustworthy* — "a B+ today
and a B+ next month mean the same thing" (`Project_Specifications_2.md` §5, §8). Trust is built by
showing the work, not by asserting a letter. Exposing the measured value against the rubric band
also directly differentiates from competitors that return vague verbal feedback with no quantities.
It reuses the rep-level breakdown the pipeline already computes (`Project_Specifications_2.md` §4.2),
so the cost is UI, not analysis.

### 3.3 UI specification

- Each sub-score on the results screen is expandable.
- Expanded state lists the contributing metrics for that dimension: measured value, the rubric's
  passing band, and a pass/marginal/fail state per metric.
- Each line cites the rep(s) it was measured on, consistent with how cues are already rep-tied
  (`Project_Specifications_2.md` §3.4).
- **Rubric version is displayed** (e.g. "graded under Squat rubric v1.1"), satisfying the versioning
  requirement in `Project_Specifications_2.md` §4.3 and pre-empting "why did my old grade change"
  confusion when rubrics improve.
- Plain-language summary stays primary; the numeric breakdown is opt-in expansion, so beginners
  aren't overwhelmed.

### 3.4 Data dependencies

None new. The rubric scoring layer already computes per-metric values, thresholds, and fault flags
(`Project_Specifications_2.md` §4.2 rep-level breakdown, §5 Rubric Scoring Layer). This feature
requires that those intermediate values be *returned to the client*, not discarded after the letter
grade is computed — a payload/serialization requirement, not a new computation.

### 3.5 v1-scope confirmation

Compatible. No overlay, no LLM re-scoring (the displayed numbers come from the deterministic rubric
layer, preserving the reproducibility guarantee in `Project_Specifications_2.md` §5).

---

## 4. Feature 3 — Corrective Drill Prescription on a Failed Gate

### 4.1 Summary

When the Stability Gate returns Maintain or Regress because of a specific recurring fault, RepGrade
prescribes a targeted corrective drill and re-checks it on the next logged session for that exercise.
This converts "Maintain" from a dead end into a concrete next action.

### 4.2 Rationale

Today a failed gate produces explanatory cue text (`Project_Specifications_2.md` §4.2.2) — it tells
the athlete *what* is wrong but not *what to do between now and the next attempt*. Pairing the
diagnosis with a prescribed drill closes the loop and is a coaching behavior no single-rep checker
offers. It reinforces the "performance intelligence layer" positioning in `CLAUDE.md`.

### 4.3 New content requirement (flagged honestly)

**This is the one feature here that is genuinely net-new work, not just surfacing.** It requires a
**fault → drill mapping library**: for each fault a rubric can flag (e.g. knee valgus, insufficient
depth, lumbar flexion, rushed eccentric), one or more prescribed corrective drills with brief
instructions. This is analogous in nature — though much smaller in scope — to the per-exercise rubric
authoring already identified as the largest content task in Phase 0 (`Project_Specifications_2.md`
§4.2.1), and like rubrics it benefits from real-coach input. It should be authored against the same
13-exercise v1 list and the fault taxonomy those rubrics already define, so it does not introduce a
new taxonomy — it maps onto the existing one.

Recommended sequencing: author the drill library *after* the rubrics are validated in Phase 0 (the
fault taxonomy must be stable first), targeting Phase 3/4 alongside the history and report-card work.

### 4.4 UI specification

- Surfaces inside the Feature 1 gate view and the results screen, attached to the specific failed
  gate / dominant fault.
- Shows: the targeted fault, the prescribed drill (name + 1–2 line instruction), and a "re-check next
  session" affordance.
- On the next logged set of that exercise, the gate view indicates whether the targeted fault
  improved, reusing existing rep-level fault detection — no new analysis.

### 4.5 Data dependencies

- Reads existing rep-level fault flags (`Project_Specifications_2.md` §4.2).
- **New:** a `Drill` content entity and a fault→drill association (see §4.3). Should be versioned for
  the same reason rubrics are (`Project_Specifications_2.md` §4.3).
- The "did it improve" re-check is a comparison over existing fault flags across two `SetEntries`,
  consistent with how the Stability Gate already reads the last 2+ sessions — a computed check, not a
  stored field.

### 4.6 v1-scope confirmation

Conditionally compatible. The surfacing and re-check logic fit v1; the **drill content library is the
gating dependency** and is the reason this feature, unlike Features 1 and 2, carries real authoring
cost. If v1 timeline is tight, Features 1 and 2 ship independently and this lands in a fast-follow.

---

## 5. Decisions Log & Open Questions

### 5.1 Proposed (pending your review)

| Item | Proposal |
|---|---|
| Stability Gate as a standalone, openable per-exercise view | Adopt for v1 — pure presentation over existing computed gate results. |
| Per-sub-score "why this grade" expansion with measured value vs. rubric band | Adopt for v1 — requires returning existing rubric intermediates to the client, no new computation. |
| Display rubric version on every grade | Adopt for v1 — already mandated by `Project_Specifications_2.md` §4.3; this just surfaces it. |
| Corrective drill prescription on failed gate | Adopt as fast-follow; depends on a net-new fault→drill content library authored after Phase 0 rubric validation. |

### 5.2 Open Questions

1. **Drill library authoring owner/source:** in-house, contracted coach, or curated from an existing
   movement library? Determines Feature 3 cost and timeline (§4.3).
2. **Gate-view entry point:** is the "Ready to progress?" view reached from the exercise history
   screen, the results screen, or both? (UI placement, not a data decision.)
3. **Transparency depth for beginners:** confirm the numeric breakdown stays collapsed by default so
   the clinical detail doesn't undercut approachability for novice lifters (§3.3).

---

*End of draft. Features 1 and 2 are surfacing-only and can be scheduled into the existing Phase 2/3
UI work without affecting the locked roadmap. Feature 3's only blocker is the drill content library,
which should be sequenced after Phase 0 rubric validation since it depends on the finalized fault
taxonomy.*

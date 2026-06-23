# Project Specifications: RepGrade (v1 — Beginner-Aware Scoring)

**Document owner:** [Your name]
**Last updated:** June 22, 2026
**Status:** Draft for review
**Companion to:** `Project_Specifications_2.md` (v1 scope locked). This document
refines how Form sub-scores are computed and banded. It does **not** alter any
locked decision in §7.1 of that document, and it does **not** weaken the
Progressive Overload Stability Gate (§4.2.2) — see §3 for why.

---

## 1. Problem

RepGrade's expected user base skews **beginner**. The Form rubrics
(`rubrics/*.md`) grade against absolute biomechanical standards, and the v1
grade-band mapping (e.g. squat rubric §5) is **binary and additive**: a fault is
present or it isn't, and "3+ faults, or any back-rounding, → C or below."

Against a beginner population this produces two failure modes:

1. **Demoralization / churn.** A novice whose every early set lands at C/D sees a
   flat wall of low grades with no visible reward for getting better, and leaves.
2. **No signal of progress.** A lifter improving from a quarter-squat toward
   parallel gets the *same* "depth fault" both times — the rubric can't see the
   improvement until they cross the absolute line, even though week-over-week
   they're clearly progressing.

The naive fix — lowering the fault thresholds so beginners score higher — is
**rejected outright** (§3). This document specifies the correct fix.

---

## 2. The Core Distinction: Safety Faults vs Performance Faults

Every fault a rubric can flag is classified into one of two classes. This
classification is the foundation of everything else in this document.

| Class | Examples | Treatment |
|---|---|---|
| **Safety fault** | back rounding under load, heels lifting, knees caving (valgus, when a front-angle exercise is added) | **Absolute. Never scaled by experience.** These are injury-risk patterns — a beginner needs to hear them *loudest*, not have them softened. They cap the grade and block progression regardless of level. |
| **Performance fault** | depth / ROM shortfall, tempo deviation | **Graded on a continuous curve and scaled by experience level (§4).** A beginner training to parallel is at an appropriate stage, not "failing." |

**Per-rubric tagging required:** each fault defined in each rubric's §4 must be
tagged `safety` or `performance`. For the squat rubric: back rounding =
`safety`; heel lift = `safety`; depth = `performance`. This is a small,
one-time annotation pass across the 13 rubrics, done alongside Phase 0.

---

## 3. Why This Does Not Weaken the Stability Gate

The Progressive Overload Stability Gate (`Project_Specifications_2.md` §4.2.2)
only recommends adding weight when Form GPA ≥ 3.7. The entire trust mechanic
depends on that grade being honest — inflating grades would tell a beginner with
dangerous form to load up, which is an injury liability and destroys the
product's credibility (spec §5, §8).

This proposal preserves that integrity by construction:

- **Safety faults remain absolute and grade-capping.** A beginner with a rounding
  back cannot reach a 3.7 Form GPA no matter their experience level, so they
  cannot pass the gate. The dangerous-form-never-progresses property is intact.
- **Experience leveling applies only to performance faults.** A "Beginner"-level
  lifter who hits *beginner-appropriate* depth with no safety faults legitimately
  earns a high grade and may progress — which is exactly correct: progressive
  overload for a beginner *should* be relative to their current capacity, not to
  an advanced lifter's depth.

In other words, the gate still blocks the cases it must block. Leveling only
changes the cases that were never dangerous in the first place.

---

## 4. The Three Changes

### 4.1 Graduated scoring (replaces binary pass/fail) — highest leverage

Performance faults move from `pass / borderline / fail` to a **continuous penalty
as a function of how far off the standard the rep was.** Depth, for example, is
scored on the *distance* between the hip and the knee line, not a yes/no on
crossing it. A lifter improving from well-above-parallel toward the line sees
their Form numeric climb every session, before they ever achieve "full depth."

- This converts the rubric from a **pass/fail gate** into a **progress meter** —
  directly addressing both failure modes in §1.
- It composes with the already-locked **recency-weighted GPA**
  (`Project_Specifications_2.md` §4.3): graduated per-rep scores make
  week-over-week improvement visible in the trend, which is what keeps a beginner
  engaged.
- Safety faults are **not** graduated — they remain discrete and heavily
  weighted, consistent with the squat rubric §5 "asymmetric weighting" note.

**Architectural note — decide this now, not later.** Retrofitting graduated
scoring onto a shipped binary pipeline is a rewrite of the rubric scoring layer
and a migration of historical grades. Building the scoring layer
(`Project_Specifications_2.md` §5 "Rubric Scoring Layer", Phase 1) as continuous
from day one costs little; converting later costs a lot.

### 4.2 Experience levels

- Athletes self-select an experience level at onboarding (e.g.
  Beginner / Intermediate / Advanced). Default and exact tier names TBD.
- Level adjusts the **target standard for performance faults only** (e.g.
  Beginner target depth = parallel; Advanced = below parallel). The underlying
  measurement is unchanged and always recorded in absolute terms — only the band
  the score maps into is level-aware.
- Level **never** adjusts safety-fault thresholds (§2, §3).

### 4.3 Framing and tone

- A beginner who earns a C still sees a C — but framed as a single prioritized
  next action ("your #1 fix is depth — here's a drill"), per the `CLAUDE.md`
  clinical-but-not-discouraging voice.
- This is where the corrective-drill library
  (`Project_Specifications_3.md` §4) does its work. No new data required.

---

## 5. Data Model Implications

Additive to `Project_Specifications_2.md` §4.3 — no rework of existing entities:

- `Athlete` gains an `experience_level` field (and ideally a history of it, so a
  past grade can be interpreted under the level in effect when it was earned —
  same principle as rubric versioning).
- `Exercise` rubric metadata gains a `fault_class` (`safety` | `performance`) per
  defined fault.
- `RepDetection` stores a **continuous per-fault severity** (e.g. depth shortfall
  magnitude), not just a boolean flag, so graduated scores are reproducible and
  the history charts can show improvement granularity.
- `Grade` records the `experience_level` and rubric version it was produced
  under (extends the §4.3 versioning principle).

**Consistency note (addressing the §5/§8 trust claim honestly):** a
Beginner-level B+ and an Advanced-level B+ are not the same absolute performance.
The grade is therefore meaningful **within an athlete's current level**, and
level is stored with each grade so trends are read in-context. This is a
deliberate, disclosed trade: the product optimizes for "is this athlete
improving and safe to progress *for where they are*," which is what the GPA is
meant to communicate, over a single cross-population absolute scale. Level
transitions are explicit events, so a trend line annotates when the bar moved.

---

## 6. Scope

- **In scope for v1 architecture:** graduated performance scoring (§4.1) and the
  safety/performance fault tagging (§2). These are Phase 1 scoring-layer
  decisions and must be built in from the start.
- **In scope, lightweight:** `experience_level` on the athlete + level-aware
  performance bands (§4.2). Onboarding UI is a small Phase 2 addition.
- **Empirical, deferred to beta (not a blocker):** the actual band cutoffs per
  level, and whether 3 tiers is right. Per `Project_Specifications_2.md` §8,
  rubric calibration against real athletes happens in beta; the *shape* of the
  system is decided here, the *numbers* are tuned there.
- **Unchanged / still locked:** everything in `Project_Specifications_2.md` §7.1,
  and the Stability Gate logic in §4.2.2.

---

## 7. Decisions Log & Open Questions

### 7.1 Proposed (pending your review)

| Item | Proposal |
|---|---|
| Soften fault thresholds for beginners | **Rejected.** Would break the Stability Gate's safety guarantee (§3). |
| Safety vs performance fault classification | Adopt. Tag every rubric fault; safety faults stay absolute and grade-capping. |
| Graduated (continuous) performance scoring | Adopt for v1 architecture — build the scoring layer continuous from day one (§4.1). |
| Experience levels scaling performance bands only | Adopt. Levels never touch safety thresholds. |
| Store continuous per-fault severity + level + rubric version on each grade | Adopt — additive to the §4.3 data model. |

### 7.2 Open Questions

1. **Number and names of experience tiers** (2 vs 3 vs 4; Beginner/Intermediate/
   Advanced vs movement-specific). Product decision; affects onboarding.
2. **Per-level target standards** for each performance fault — empirical, set in
   beta against real grade distributions.
3. **Self-selected vs assessed level:** do we trust the athlete's self-rating, or
   calibrate level from their first few graded sets? Self-selection ships v1;
   auto-calibration is a candidate v2 refinement (parallels the self-reported-RPE
   trade-off in `Project_Specifications_2.md` §4.2.2).

---

*End of draft. The decisions here are architectural (continuous scoring, fault
classification, level-aware bands) and should be settled before the Phase 1
rubric scoring layer is built. The numeric calibration (per-level cutoffs) is
intentionally deferred to beta, consistent with the locked spec's §8 approach.*

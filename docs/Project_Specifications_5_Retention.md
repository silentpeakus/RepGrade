# Project Specifications: RepGrade (v1 — Retention & Notification Layer)

**Document owner:** Joseph Burke
**Last updated:** June 25, 2026
**Status:** Draft for review
**Companion to:** `Project_Specifications_3.md` (v1 scope locked) and
`Project_Specifications_4.md` (beginner-aware scoring). This document does
**not** alter any locked decision in Spec_3 §7.1, and does not change Stability
Gate logic (Spec_3 §4.2.2) or graduated-scoring logic (Spec_4 §4.1). It amends
**Spec_3 §6 (Roadmap)** only, by re-sequencing where notification
infrastructure is built and adding it as an explicit deliverable rather than an
implied polish item.

---

## 1. Problem

Spec_3's roadmap (§6) sequences by technical risk: grading accuracy validated
before app shell, app shell before history views. That sequencing is correct
for *engineering* risk. It is incomplete for *retention* risk, which has a
different dependency chain than feature-build order implies.

As scoped, the core async upload flow (Spec_3 §3.3 — 1–2 minute processing
wait, "acceptable provided the athlete knows it's coming") has no mechanism to
bring the athlete back to the app once processing finishes if they've
navigated away. Without a notification at the end of that wait, the MVP's
core loop — upload → grade → feedback — does not actually close for any
athlete who isn't staring at the screen for the full processing window. This
is not a retention nice-to-have; it is a gap in the v1 loop as currently
scoped.

Separately, the Progressive Overload Stability Gate (Spec_3 §4.2.2) is the
product's primary trust mechanic and, per prior architecture discussion, its
highest-leverage retention surface — but as scoped it is only ever *displayed*
post-upload, never used to *initiate* a return visit.

---

## 2. The Two Notification Categories

Notifications split by data dependency, not by build phase. This distinction
is the basis for the re-sequencing in §3.

| Category | Definition | Data dependency | Examples |
|---|---|---|---|
| **A — Zero-history** | Fires off a single SetEntry or simple timestamp check. No trend or gate evaluation required. | Exists as soon as one graded set exists (Spec_3 §4.3 data model already supports this). | "Your grade is ready." / "Haven't logged squat in 10 days." |
| **B — Gate-aware** | Fires based on Stability Gate state, which requires 2+ sessions at the current load to evaluate (Spec_3 §4.2.2). | Requires the gate-evaluation logic from Phase 1, wired to real session history. | "One solid set away from a Ready signal on squat." / "Your squat GPA is climbing." |

Category A has no dependency on history/trend UI work and should not be
scheduled behind it. Category B genuinely cannot fire meaningfully before
sufficient session history exists, but does not require the *visual* trend
chart to exist first — it only requires the gate computation, which is a
Phase 1 backend capability.

---

## 3. Roadmap Amendment (modifies Spec_3 §6)

### Phase 2: Base44 App Shell — **amended**

Original Phase 2 scope (auth, profile, exercise selection, upload, backend
wiring, results screen) is unchanged. **Add the following as explicit Phase 2
deliverables, not deferred items:**

- **Processing-complete notification (Category A).** When the async grading
  job (Spec_3 §3.3) finishes, the athlete receives a push notification if the
  app is backgrounded or closed. This is the resolution of the 1–2 minute
  async wait already committed to in Spec_3 §3.3 — shipping Phase 2 without
  it means the core upload→grade loop does not actually close for any athlete
  who navigates away during processing.
- **Lapsed-user re-engagement notification (Category A).** A simple check
  against `last upload timestamp` (already present per Spec_3 §4.3's
  `SetEntry` model) — no new data required. Suggested default trigger: no
  upload in 10–14 days. Exact threshold is a Phase 4 tuning detail, not a
  blocker to building the mechanism now.

**Rationale for pulling these into Phase 2:** both depend only on data that
exists the moment a single `SetEntry` is created. Neither depends on
Phase 3's history/trend work. Deferring them to "whenever notifications get
built" risks shipping the closed-beta version of the app with a loop that
silently drops athletes mid-flow — which would contaminate early retention
signal from the very testers most useful for validating the product (see
§4 for why this matters for your beta specifically).

### Phase 3: History & Report Card — **amended, re-ordered internally**

Original Phase 3 scope (GPA roll-up views, trend charts, session history,
overload signal "surfaced in history context") is unchanged in substance, but
**re-ordered**: the Stability-Gate-driven notification should be built
**before** the trend-chart visualization work, not after.

- **Gate-aware notification (Category B) — build first within Phase 3.**
  Once the Stability Gate (Spec_3 §4.2.2) is evaluating 2+-session windows per
  exercise/athlete, surface that state as a push notification, not only as an
  in-app result: "You're one solid set away from a Ready signal on squat."
  This reuses the gate computation Phase 1 already produces (Spec_3 §4.3 —
  "this is a computed check, not a stored field") — no new backend logic, only
  a new delivery surface for an existing computation.
- **Trend-chart visualization — build second within Phase 3.** Per-exercise
  GPA trend charts and session history views, as originally scoped. Lower
  retention leverage than the gate notification per session, even though both
  read from the same underlying data — sequencing reflects that priority.

**Rationale for re-ordering:** the notification and the chart consume the
same gate/GPA computation, so neither is blocked on the other technically.
Given finite Phase 3 build time, the notification is the higher-leverage
deliverable and should not wait on chart UI polish.

---

## 4. Why This Matters for the Closed Beta Specifically

Per current plan, a small group of testers will use the app before any Meta
ad spend. If Phase 2 ships without Category A notifications, the most likely
beta failure mode is **silent loop abandonment**: a tester uploads, backgrounds
the app during the 1–2 minute wait, forgets, and never returns to see the
grade — not because the grading or rubric quality was bad, but because the
loop never resolved for them. This would corrupt the very signal the beta
exists to produce (does the GPA/Progressive-Overload framing actually hook
people), by introducing a dropout cause unrelated to product quality.
Building Category A notifications before beta testing begins is therefore a
beta-validity requirement, not only a retention feature.

---

## 5. Scope Boundaries (what this document does not change)

- Does not alter Stability Gate logic, thresholds, or output enum
  (Spec_3 §4.2.2 — unchanged).
- Does not alter the recency-weighted GPA formula (Spec_3 §4.3 — unchanged).
- Does not alter graduated scoring or experience-level logic (Spec_4 — unchanged).
- Does not add new data model entities. Both notification categories read
  existing fields (`SetEntry` timestamps, computed Stability Gate state).
- Does not specify exact copy, send-time windows, frequency caps, or
  notification-permission UX — those are Phase 2/3 implementation details,
  consistent with how Spec_3 treats other Phase 1 implementation details
  (e.g., GPA decay function) as non-blocking specifics to be set during
  the build, not pre-decided here.

---

## 6. Decisions Log

| Item | Decision |
|---|---|
| Processing-complete notification | **Add to Phase 2** as explicit deliverable. Category A — no history dependency. |
| Lapsed-user re-engagement notification | **Add to Phase 2** as explicit deliverable. Category A — no history dependency. |
| Stability-Gate-aware notification | **Remains Phase 3, but build before trend-chart UI.** Category B — depends on gate evaluation, not on chart visualization. |
| Trend-chart visualization | Remains Phase 3, built after the gate-aware notification within that phase. |
| Exact notification copy, timing thresholds, frequency caps | Open — Phase 2/3 implementation detail, not a v1 product-spec blocker (same treatment as Spec_3 §7.2's deferred implementation details). |

---

## 7. Open Questions

1. **Notification permission timing:** request push permission at onboarding,
   or contextually at first upload? Affects opt-in rate; no strong default
   recommended here — worth a quick test with the closed beta group.
2. **Frequency capping:** how many re-engagement notifications before
   suppressing further sends to a lapsed user, to avoid uninstall-driving
   notification fatigue. Empirical — set during Phase 4 beta tuning, consistent
   with how Spec_3 §8 treats other beta-calibrated parameters.
3. **Category B copy variation by gate-failure reason:** Spec_3 §4.2.2 already
   specifies that "Maintain" cue text should explain *which* gate failed.
   Should the notification text vary the same way, or stay generic and push
   the athlete into the app to see the specific reasoning? Leaning toward the
   latter (keeps notification short, drives an app open) but flagging as open.

---

*End of draft. This document is additive to Spec_3 §6 and does not require
re-opening any decision in Spec_3 §7.1 or Spec_4 §7.1. Recommended next step:
fold the Phase 2/Phase 3 amendments in §3 directly into Spec_3's roadmap
section once reviewed, so there is a single current roadmap rather than two
documents to cross-reference.*

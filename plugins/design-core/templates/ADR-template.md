---
adr: ADR-NNNN
title: <Topic — short noun phrase>
status: proposed
date: YYYY-MM-DD
accepted_date: YYYY-MM-DD       # set when status flips to accepted
cross_cutting: false             # set true if this ADR's rules apply to multiple specs without owning any single one
supersedes: []                   # ADR IDs this one replaces (e.g. ["ADR-0042"])
superseded_by: []                # set when this ADR is itself superseded
related_specs: []                # component slugs this ADR locks (e.g. ["bone-economy", "premium"])
sources:
  - "Path or URL to the canonical source(s) — audit folder, commit message, transcript"
---

# ADR-NNNN — <Topic>

## Status

Proposed | Accepted (YYYY-MM-DD) | Superseded by ADR-NNNN | Rejected.

## Context

What problem does this address? What constraints exist? What was the trigger to make this decision?

Two design tensions resolved here (if applicable):
- **Tension 1 description.**
- **Tension 2 description.**

## Decision

The locked answer, in current-state language. No "we will" — write as if the decision is already in effect.

### Sub-section A

…

### Sub-section B

…

## Consequences

What this lock means for other parts of the system. List affected components and how they consume this decision.

- **Component X** consumes / responds to this how
- **Component Y** etc.

## Alternatives considered

Options that were on the table but rejected. Brief one-liner per alternative + why rejected.

- **Alternative 1.** Rejected because …
- **Alternative 2.** Rejected because …

## What is NOT yet locked (optional)

For partial locks: list values / sub-decisions that remain draft and what triggers their finalisation. A future ADR will lock these.

## References

- Audit folder: `docs/_audit/<date>_<topic>/05-decisions-log.md`
- Spec: `docs/components/<slug>.md`
- Lock confirmation: spec `last_updated: YYYY-MM-DD`
- Commit: `<sha>` (if relevant)

---

## Template usage (delete this section in the actual ADR)

- **Numbering:** find the next free `ADR-NNNN` (zero-padded to 4 digits). Numbers are monotonic and never reused — even rejected ADRs keep their number.
- **Slug:** must match the related component spec slug (one-name-everywhere rule). Spec at `docs/components/bone-economy.md` → ADR at `docs/decisions/ADR-NNNN-bone-economy.md`.
- **Cross-cutting flag:** set `cross_cutting: true` if this ADR captures rules that apply to MULTIPLE component specs without locking any single one (e.g. "governance rules", "universal product rules"). The `adr-related-specs-bidirectional` lint rule skips cross-cutting ADRs.
- **Status flow:** `proposed` → `accepted` (irreversible) | `rejected`. To change an `accepted` ADR, write a NEW ADR that supersedes it; flip the old one's status to `superseded` with `superseded_by: ADR-MMMM`. **Never edit the body of an accepted ADR.**
- **Pointer pattern:** when the body would restate a fact owned by another ADR or spec, write a pointer instead: `see [ADR-MMMM § Section name]`. Pointers prevent drift.

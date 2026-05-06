---
name: Decision Register
slug: decisions-index
status: active
last_updated: YYYY-MM-DD
---

# Decision Register

Append-only log of architecturally significant decisions for this project. Each ADR is a single immutable file. To change a decision, write a NEW ADR that supersedes the old; never edit an accepted ADR.

## How to read

1. **Looking for current state?** Read the live spec at `docs/components/<slug>.md`. The component frontmatter `locked_by:` field points back to the ADR that locked it. ADRs are not the spec — they are the decision record.
2. **Wondering why a decision was made?** Read the ADR. Each one carries Context, Decision, Consequences, and Alternatives Considered.
3. **Tracing change history?** Use the supersedes / superseded_by fields, or read `CHANGELOG.md` at repo root for the human-readable summary.

## Status values

- **proposed** — drafted, awaiting user accept
- **accepted** — locked, immutable; live spec carries `locked_by: ADR-NNNN`
- **superseded** — replaced by a later ADR; content frozen for trace integrity
- **rejected** — drafted but not accepted; kept for context

## One-topic-per-ADR rule

**Each ADR is the canonical record for ONE topic.** Cross-references between ADRs are POINTERS, not duplicate text.

- If ADR-A needs to mention a fact owned by ADR-B, ADR-A says "see ADR-B § Section name". It does NOT restate the fact.
- A fact lives in exactly one ADR. When it changes, only that ADR updates (or its successor via supersede chain). All pointers automatically lead to the current truth.
- This is the principle that prevents drift. Pointers eliminate that class of bug by construction.

**Pointer integrity is lint-enforced** (`tools/lint-docs.js`):
- Every cross-ADR pointer must resolve to an existing ADR with `status: accepted` or `status: superseded` (with `superseded_by:` set).
- Superseded ADRs are not deleted — readers follow the chain forward.
- Restated facts are flagged as duplication warnings (if the same value table or rule appears verbatim in 2+ ADRs).

**Where to put cross-cutting rules:** their own dedicated ADR, with `cross_cutting: true` frontmatter flag. Other ADRs link.

## Naming rule

**One name, used everywhere.** Internal name = external name. No translation layer between code, docs, and UI copy.

- Whatever the user sees ("Premium", "Bone Economy", "Onboarding") is also the spec slug, the ADR slug, the Swift class name root, the CSS prefix, the audit folder slug.
- Pick the user-facing name as the canonical one — never invent a separate "internal" name.

**ADR file slug MUST match the related component spec slug.**
- Spec at `docs/components/<slug>.md` → ADR named `ADR-NNNN-<slug>.md`
- Same slug both ends. Mechanical lookup.

If an ADR covers multiple specs (rare), pick the primary one and list the others in `related_specs:`. For ADRs that don't lock a single spec (governance, universal rules), set `cross_cutting: true`.

## Index

| ADR | Title | Status | Accepted | Supersedes | Superseded by |
|---|---|---|---|---|---|
| (replace this row when adding the first ADR) | | proposed | — | — | — |

## Numbering

ADRs are numbered monotonically — ADR-0001, ADR-0002, etc. Numbers are never reused, even for rejected ADRs.

## Working files

`_working/` holds in-flight audits (e.g. lock-status audits) that are not themselves ADRs. These get archived to `docs/_archive/` once their work resolves into accepted ADRs.

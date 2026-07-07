---
name: prior-art-search
description: Use when asked to find similar projects, existing tools, prior art, libraries, or whether something already exists before building.
metadata:
  short-description: Multi-angle search for existing tools before building
---

# Prior-Art Search

One search angle always misses things. Sweep several, then judge.

## 1) Sweep (parallel angles)
- **By problem words**: GitHub search on 2–3 phrasings of the problem, not the imagined solution name.
- **By ecosystem**: `npm search` / PyPI / crates for the domain keywords; registries surface things GitHub search ranks poorly.
- **By neighbors**: who depends on / is depended on by the closest known tool (`gh api` dependents, awesome-lists in the domain).
- **By feature**: search issues/discussions of the big incumbent (e.g. Playwright, ESLint) for people asking for this feature — links to third-party solutions cluster there.

## 2) Qualify each candidate
Per candidate, one row: stars, last commit date, open-issue responsiveness, license, and — most important — the exact overlap and the exact gap vs the idea. Install/run the top 2 candidates on a real example when feasible; READMEs oversell.

## 3) Conclude
- **Adopt** (which one, and the gap you accept), **extend** (fork/plugin point), or **build** (state what specifically nothing covers).
- List dead/abandoned lookalikes too, with why they died — that's design input, not noise.

Notes:
- Timebox: if 4 angles surface nothing close, say so and stop — absence of prior art after a real sweep is a valid, reportable result.

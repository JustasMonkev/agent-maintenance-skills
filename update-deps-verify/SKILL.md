---
name: update-deps-verify
description: Use when asked to update dependencies, upgrade packages, avoid deprecated packages, or fix issues after a dependency update.
metadata:
  short-description: Batched dependency updates with verification
---

# Update Deps and Verify

Never big-bang update. Batch, verify, commit, repeat.

## 0) Baseline
- Run build + lint + tests BEFORE touching anything. If the baseline is red, report it and fix or get agreement first — otherwise you can't attribute breakage.

## 1) Survey
- `npm outdated` (or `flutter pub outdated` / expo equivalent). Bucket into: patch, minor, major.
- Check each major's changelog/release notes for breaking changes before deciding.
- Flag deprecated packages (`npm view <pkg> deprecated`) and propose maintained replacements — never keep or add a deprecated dep.

## 2) Update in batches
- Batch 1: all patch+minor at once → verify.
- Then majors one at a time → verify each, applying the documented migration.
- Expo projects: use `npx expo install --fix` so versions match the SDK, not raw latest.

## 3) Verify per batch
- Build, lint, typecheck, full test suite. Fix failures inside the batch before moving on.
- Commit per batch with the package list in the message, so a bad batch is one revert.

## 4) Report
- Table: package, old → new, breaking notes. List anything intentionally NOT updated and why (peer conflict, requires code migration too large, deprecated with no replacement).

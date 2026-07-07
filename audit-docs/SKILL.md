---
name: audit-docs
description: Use when asked to audit docs, review docs accuracy, or validate documentation claims against actual code, commands, APIs, configs, and diagrams.
metadata:
  short-description: Verify every doc claim against the code
---

# Docs Audit

Docs lie by going stale. Verify claims against code; never grade prose style.

## 1) Inventory claims
Walk each doc file and extract every checkable claim:
- Commands and flags (do they run? do the flags exist in the CLI source?)
- File paths and module names referenced (do they exist?)
- API/config examples (do the fields match the current types/schema?)
- Mermaid/architecture diagrams (does each node and edge correspond to a real module and a real dependency?)
- Version numbers, install instructions, env vars.

## 2) Verify
- Cheap checks first: paths via `ls`/glob, flags via `--help` or the arg-parser source, config fields via the schema/types.
- Runnable examples: actually run them in a scratch dir when safe; otherwise trace the code path and say "traced, not executed".
- Diagrams: grep imports to confirm each drawn edge; list edges that exist in code but are missing from the diagram (coverage), and drawn edges with no code counterpart (drift).

## 3) Report
Per file: `✅ verified / ❌ wrong (with the correct current value) / ⚠️ unverifiable (why)`.
- Lead with the wrong ones — those actively mislead.
- End with a coverage note: significant code areas (public commands, exported APIs) that no doc mentions.

Notes:
- Fixing is a separate pass — audit output must stay a faithful report, not a mixed diff.

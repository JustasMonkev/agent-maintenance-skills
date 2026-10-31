# Dispatch record

All implementation calls used `collaboration.spawn_agent` with
`model: "gpt-6.1-sol"`, `fork_turns: "none"`, and no reasoning-effort override.
Names: todo_baseline_1, todo_baseline_2, todo_lean_1, todo_lean_2. The brief below
was identical except for OWNED_DIRECTORY and the condition paragraph. Original
paths are retained as execution provenance; replace the temporary root when
repeating the experiment. The task and finish-with-evidence input are saved here.

## Common brief

Build the app described in /tmp/lean-first-study/benchmark/task.md. Apply
finish-with-evidence at /tmp/lean-first-study/benchmark/finish-with-evidence.md.
You own only OWNED_DIRECTORY. You are not alone in the filesystem; do not edit
or inspect other submissions, benchmark checks, or parent work. Start from the
empty owned directory.

CONDITION_PARAGRAPH

Keep the app small and satisfy the supplied contract. No subagents. Available
tools: Node v26.5.0; Playwright is at
/Users/justas/Desktop/mcp-accessibility-scanner/node_modules/playwright/index.mjs
if you need browser verification; Lean 4.35.0 is at
/Users/justas/Desktop/mcp-accessibility-scanner/tmp/lean-bench/lean-4.35.0-darwin_aarch64/bin/lean
if needed. Work in your owned directory, not the host cwd. Save NOTES.md and
evidence.log with checks actually executed, and report completion with files and
remaining limits. No commits, push, global installation, or reading evaluation
tests. Finish a bounded first draft; do not wait for parent feedback.

## Baseline condition paragraph

Use ordinary implementation/reasoning/tests; do not load any additional skill.

## Lean-first condition paragraph

Use $lean-first at /tmp/lean-first-study/lean-first/SKILL.md before implementing;
do not load any other additional skill.

## Ownership

Each owns its corresponding folder under
/tmp/lean-first-study/benchmark/projects/{baseline-1,baseline-2,lean-1,lean-2}.

## Independent reviews

The same requested model was used for a fresh-context, condition-blinded
production-code review and for isolated negative controls. The mutation worker
received a 146-word compact handoff and the lazy-mutation workflow; its outcomes,
actual diagnostics, baseline/restored checks, cleanup and limits are saved in
evidence/negative-controls.json. The static review saw only anonymous production
files and the task, not results, notes, or models. See evidence/blind-review.md.

---
name: prevent-mistakes
description: Evidence-first guardrails for changing code. Understand before editing, name likely failure modes, make the smallest correct change, enforce recurring mistakes with checks, verify the actual claim, and report only what ran. Use when implementing, fixing, or refactoring code in a repository, especially bug fixes, async or stateful logic, public interfaces, or work beside uncommitted changes. Not for questions, read-only reviews, or prose-only tasks.
---

# Prevent mistakes

Catch avoidable implementation mistakes before review, using repository evidence and checks that actually run. This raises the odds of a correct change; it guarantees nothing.

Precedence: host permissions, then user instructions, then repository instructions, then this skill. If the authorized scope rules out a step (no commands, no test edits, no Git), skip it and report the reduced evidence.

## Pick the path

**Light path**: a trivial, local change with no behavior branch (typo, copy text, comment, a rename inside one file, a constant nobody branches on). Read applicable instructions, note the working tree state, make the edit, run the cheapest relevant check if one exists (formatter, type check, the touched command's `--help`), review the diff, report in two lines. Switch to the full path the moment the change touches behavior, a public interface, or shared state.

**Full path**: everything else. Steps 1 to 7.

## 1. Understand before editing

- Read instruction files that apply to the paths you will touch: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING*`, nested instruction files, and anything they point to.
- Snapshot the working tree (`git status`, `git diff`, or a file listing without Git). Files already modified belong to the user: edit around them, keep their hunks byte-for-byte, and leave staging, stashing, resetting, and committing to the user. If your change must land in such a file, touch only your own hunks and say so in the report.
- Name the requested behavior in one sentence, then find its implementation, its callers, and the checks that already cover it. Search outward from the target (callers, tests, config) until the change's effects are bounded; a whole-repo sweep needs a reason.
- Discover how this repository verifies itself: manifests, task runners, CI config, contributor docs. `scripts/discover.sh` (read-only) prints candidates. Use what the repo uses.

Done when you can state the behavior, the code that implements it, what depends on it, and the command that checks it (or that none exists).

Ask the user only when an open question changes correctness or scope and the repository cannot answer it. Otherwise take the reading the evidence supports and state it as an assumption.

## 2. Name the risks

List the one to three most likely ways this change goes wrong. Tie each to evidence (a line, a test, a commit, an issue) and label it **observed** (seen in code, tests, or history) or **assumed** (plausible, unconfirmed). For prompts on compatibility, state ownership, async ordering, error handling, security boundaries, and performance, read [references/risks.md](references/risks.md); use only the categories this change touches.

Without Git history or network access, say so, lean on code and tests, and label history-dependent risks assumed.

Done when each risk carries evidence or the assumed label, and a planned check that would catch it.

## 3. Make the smallest correct change

- Reuse established APIs, helpers, and installed dependencies. Before copying a nearby pattern, confirm it is sound: neighbouring code may carry the very bug you are fixing.
- Preserve public behavior, signatures, defaults, and error types unless the task requires a change.
- Fix the cause. Failures stay visible (errors propagate or are reported, never swallowed; fallbacks never mask a failure). Ordering is explicit (tokens, cancellation, awaits), never sleeps or arbitrary delays. Scope matches the request: no speculative abstraction, no drive-by cleanup.

Done when every hunk traces to the request or to its verification.

## 4. Enforce at the strongest practical level

When a risk can be made impossible rather than merely tested, prefer, in order: an API or ownership boundary, then types, then a focused static check whose message names the fix, then a behavioral test. Use prose (docs, agent instructions) only for judgment no tool can check.

Stay proportionate: a small task earns a test or a type, never a redesign. Propose larger enforcement in the report instead of doing it.

Add new enforcement for a mistake class only when evidence shows it **recurs** (two or more instances in history, sibling code, review comments, or repeated user corrections). A one-off gets fixed, not banned. Enforcement and rule text live in the project (its tests, lint config, instruction files), never in this skill. See [references/enforcement.md](references/enforcement.md).

## 5. Verify the claim

**Baseline first**: before your first edit, run the checks relevant to the change, so pre-existing failures are known without stashing, reverting, or checking out anything later. If that is too slow, run the narrowest subset and say so.

Match evidence to the claim:

| Claim | Evidence |
|---|---|
| Bug fixed | Reproduce first: the check goes **red** on current code, **green** after the fix. |
| UI behavior | Exercise the user journey in the running app when runtime access exists; otherwise report it unexercised. |
| Faster | Comparable before/after measurements on the same workload and machine. |
| Public interface | Affected consumers still build and pass; compatibility stated. |
| Refactor | The same checks pass before and after. |
| Docs only | Statements match the code; examples run or type-check where practical. |

A new regression check must be seen failing against the broken behavior: run it before the fix, or temporarily revert the fix. Assert observable behavior, not implementation details.

Keep the oracle honest: assertions, expected values, skips, lint rules, and check configuration change only when the requested behavior changes, and the report says why.

Afterwards, compare with the baseline. Failures absent from the baseline are yours to fix. Failures present in the baseline are pre-existing: report them with that evidence, and leave them alone unless they block the task.

Done when every claim you will report has a check that ran in this session, or is listed as unverified.

## 6. Review the final diff

Read the whole diff against your starting snapshot, then re-read the original request. Confirm:

- every hunk traces to the request; unrelated edits are gone
- the user's pre-existing changes are intact
- no duplicated logic, accidental public API change, or new dependency without need
- failure paths are handled, not hidden
- debug output, scratch files, and temporary reverts are removed
- the request is fully satisfied

## 7. Report

- **Changed**: files and behavior.
- **Verified**: each command that ran and its result; pre-existing failures labeled as such.
- **Unverified**: what did not run and why (no runtime, no network, no Git, not permitted, too slow).
- **Open**: assumed risks still unconfirmed; enforcement proposed but not added.

A check counts as run only if its output appeared in this session.

## Composing

When another loaded skill owns a phase (debugging, test-first development, acceptance criteria, handoff), follow it for that phase; this skill adds the risk, enforcement, and honest-evidence passes. It needs no extra agents, plugins, paid services, or network.

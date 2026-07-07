---
name: monitor-upstream
description: Use when asked to monitor an upstream repository for new commits, releases, merged PRs, or breaking changes affecting a local fork or wrapper.
metadata:
  short-description: Diff upstream repo activity since last check
---

# Monitor Upstream

Recurring check of an upstream repo against a local fork/wrapper. Stateful: never re-report what was already seen.

## State
- Keep `last-seen.json` next to this skill (or in the target repo's `.upstream-watch/`): `{repo, last_commit_sha, last_release_tag, last_checked_iso}`.
- First run: initialize state from current upstream HEAD and report nothing but the baseline.

## 1) Fetch deltas
- `gh api repos/{owner}/{repo}/commits?since={last_checked}` — new commits.
- `gh api repos/{owner}/{repo}/releases` — new releases since `last_release_tag`.
- `gh pr list --repo {owner}/{repo} --state merged --search "merged:>{last_checked}"` — merged PRs.

## 2) Classify each change
- **Breaking**: public API/tool schema changes, renamed flags, removed exports — anything the local code calls.
- **Relevant**: touches files/subsystems the local project wraps or patches (grep local imports/patches to decide).
- **Noise**: docs, CI, unrelated areas — count them, don't list them.

## 3) Report and update state
- Output: breaking changes first with the local call sites affected, then relevant changes with one-line summaries, then `N noise commits skipped`.
- Write the new SHA/tag/timestamp back to state only after the report is delivered.

Notes:
- If the local project carries patches against upstream files, diff those files specifically and say whether each patch still applies.

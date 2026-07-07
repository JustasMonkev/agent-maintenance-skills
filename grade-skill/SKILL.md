---
name: grade-skill
description: Use when asked to grade, evaluate, assess, score, or review an agent skill's quality.
metadata:
  short-description: Rubric-based skill grading with live stress tests
---

# Grade a Skill

A skill is graded by running it, not by reading it.

## Rubric (10 points)
- **Trigger clarity (2)**: does the description say exactly WHEN to invoke it? Would an agent fire it on the right prompts and not on the wrong ones?
- **Actionability (2)**: are steps executable as written — real commands, real paths, decision rules — or vague advice ("check the logs")?
- **Round-trip economy (2)**: can an agent follow it with minimal tool calls? No steps that force re-discovery of things the skill could state.
- **Failure handling (2)**: does it say what to do when a step fails (auth missing, empty result, flaky env)?
- **Scope discipline (2)**: covers its one job; no bloat, no duplicated general knowledge the model already has; under ~100 lines or split into references.

## Process
1. Read the SKILL.md and any bundled scripts/references.
2. Write 3 realistic task prompts the skill should handle + 1 it should NOT trigger on.
3. Dispatch a fresh agent per prompt with only the skill as guidance; observe where it stalls, guesses, or asks avoidable questions.
4. Score each rubric line with one sentence of evidence from the runs.

## Report
- `score/10`, per-criterion breakdown, then the 3 highest-impact concrete edits (quote the line to change and the replacement).
- A 10/10 requires all 4 test runs to succeed without the agent needing knowledge the skill omitted.

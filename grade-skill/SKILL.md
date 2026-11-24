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
1. **Write the answer key first.** Choose three realistic requests the skill should handle;
   describe a successful result for each. Add a near miss for a neighboring skill and an
   unrelated request that fits no skill in the test catalog. Record the expected selection
   for all five. Don't name the skill in a request unless you're testing explicit invocation.
2. **Test discovery.** For every request use the same catalog of real skill names and
   frontmatter descriptions, including the target and its neighbors. Give a fresh agent
   only the catalog and one request: “Which single skill, if any, best fits this request?
   Return its name or NONE. Do not perform the task.” Don't identify the target, disclose
   the key or give the agent access to skill bodies. Record its choice before comparing
   with the key. This tests description-based selection, not a host's automatic loading.
3. **Test execution separately.** For each of the three in-scope requests, give a fresh
   agent the actual skill and task inputs in a suitable workspace, even if discovery
   missed it. Compare the work to the expected result; note where it stalls, guesses,
   or needs information the skill omitted.
4. Score trigger clarity from the routing choices and the other criteria from execution.
   If an isolated trial couldn't run, mark it untested rather than inferring its outcome.

## Report
- `score/10`, per-criterion breakdown, then the 3 highest-impact concrete edits (quote the line to change and the replacement).
- Show expected → observed selections and the three execution outcomes. A 10/10 requires all five routes to match and all three tasks to succeed without the agent needing knowledge the skill omitted.

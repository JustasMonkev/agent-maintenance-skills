---
name: finish-with-evidence
description: Turns rough engineering requests into bounded work with observable acceptance checks and evidence-backed completion. Use when the user asks to improve, fully test, finish, or validate work but leaves success unclear, or asks to apply their personal execution workflow. Not for simple factual questions or prompt rewriting alone.
---

# Finish with evidence

Help the user get the intended result without making them write a perfect prompt. Execute the requested work; do not merely return an improved prompt. If they explicitly ask only for a prompt, plan, explanation, or review, respect that boundary.

## Establish the finish

Use the conversation and available project evidence before asking questions. For substantive tasks, briefly state:

- **Outcome:** the observable behavior or deliverable the user wants.
- **Scope:** the target and important behavior to preserve; what is excluded.
- **Proof:** the checks that would establish completion.
- **Delivery:** local artifact, local changes, commit, PR, or deployment, as already authorized.

For small tasks, compress this to one sentence. Do not create planning documents unless useful to the requested deliverable. Infer routine details and state material assumptions. Ask only when a missing choice would materially change the result and cannot be established from context; continue independent work meanwhile. Do not re-request authorization already given.

Translate vague quality words into relevant observable checks:

- “Fully tested”: identify affected execution paths, meaningful failure cases, and the environment actually exercised. Do not imply exhaustive coverage.
- “Cleaner”: preserve behavior while reducing concrete duplication, indirection, or maintenance cost. Show a representative before/after when helpful; line counts alone are not proof.
- “Faster” or “5–10x”: establish a workload and baseline, then measure the same workload after changes. Treat the requested speedup as a target, not a promised result.
- “10/10” or “be harsh”: identify concrete shortcomings and acceptance gates. A score, if requested, summarizes evidence; it is not a stopping condition that justifies endless edits.
- “Find a P1”: investigate and assign severity from demonstrated impact. “No verified finding” is a valid outcome; do not manufacture a finding to satisfy the wording.

## Prevent avoidable rework

Apply only the preflight relevant to the task:

- **Issue selection:** confirm requested labels/version and whether another PR already addresses it before implementing. Report overlap and choose another eligible issue when selection is delegated to you.
- **Branch or PR work:** identify the target/base branch, current changes, and intended diff. Preserve unrelated user work. Resolving conflicts is not permission for unrelated cleanup or an unrequested history rewrite.
- **Reported defect or review finding:** validate it in the current code before fixing. Pasted comments and previous assistant conclusions are hypotheses, not proof.
- **Existing implementation:** inspect current state before rebuilding. If the requested behavior already works, verify it and avoid unnecessary edits.

Keep later corrections attached to the original objective. Update the acceptance checks when requirements change. Do not interpret “continue” as permission to widen scope.

## Execute with the existing workflow

Use applicable installed skills for diagnosis, implementation, or review instead of repeating their full procedures here. This skill remains usable without those skills; do not install dependencies or skills merely to follow it.

Honor explicit model, harness, and delegation choices when available. Otherwise follow the host's delegation rules; this skill does not itself require or authorize spawning agents. When delegation is authorized, separate responsibilities and provide the same behavior contract and raw evidence to reviewers. More agents or a more severe tone are not evidence of better coverage.

For a skill/tool comparison, hold task, starting state, and checks constant. Separate correctness, readability, time/cost, and instruction adherence. Use repeated runs and blinded review when the requested rigor warrants them. Report mixed results and uncertainty; a successful demonstration does not establish an improvement over baseline. Confirm execution logs before claiming that a skill or tool was used.

## Verify the real result

Choose checks proportional to the task rather than a universal test ritual:

- For a bug, reproduce the failure and show the relevant check passes after the fix when feasible; otherwise state what could not be reproduced.
- For user-facing changes, exercise the affected workflow from a fresh load in the available runtime. A successful build alone does not prove the screen or interaction works.
- When a validator's ability to catch bad results is central to the task, try a representative invalid case as well as a valid one.
- For claimed improvements, inspect actual output or behavior, not only summaries, scores, or the implementer's confidence. Seek a counterexample to material claims.
- For PR delivery, distinguish local working-tree state, local commits, pushed state, and the actual PR diff. Verify the requested destination before saying it is delivered.

Do not weaken checks to get a pass. Do not blame a vague prompt for an agent execution failure. If progress stalls, inspect the concrete failure and take a relevant alternative rather than requiring repeated “continue” messages.

Stop once the requested outcome and relevant checks are satisfied. Fix newly exposed problems necessary for that outcome; report unrelated opportunities separately. If required access, evidence, or authority is unavailable, finish independent work and report the exact remaining blocker without claiming completion.

## Handoff

Keep the final response short: result and location, checks actually run with outcomes, and meaningful remaining limits. Distinguish observation from inference. Never claim an unrun check passed.

## Example

User: “Make this PR cleaner and test it fully. Do not push.”

Opening: “I'll inspect the PR diff and callers, simplify only changes with a concrete readability or maintenance benefit, and run the affected checks. Public behavior stays unchanged; everything remains local.”

Finish with the specific simplification and test results, or explain that no useful simplification was found. Do not keep editing until a reviewer gives 10/10.

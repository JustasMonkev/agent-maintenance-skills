---
name: lean-first
description: Draft and check a small executable Lean model of consequential decision or state-transition logic before implementing it in the target language. Use for model-first development, tricky invariants, or an explicit Lean-first request; not routine UI work or a general TypeScript bug scan.
---

# Lean first

Use Lean to clarify a difficult contract before committing to its implementation.
The deliverable is still the user's requested software, not a formalization project.

## Choose the useful boundary

Identify the smallest pure decision or state transition whose mistakes matter.
Keep UI, I/O, storage drivers, framework glue, and unrelated code outside the model.
For routine logic with no useful invariant, explain that ordinary tests are a better
fit and continue the requested implementation. If Lean is explicitly requested,
try a bounded model before deciding its value.

Write down the observable contract and the inputs it actually accepts. Separate
requirements from assumptions and design choices. Look for interactions between
operations: identity allocation after deletion, repeated requests, invalid edits,
limits, and restoration are examples, not a mandatory feature list.

## Make the draft executable

Check the installed Lean version and pin the version used. Prefer the standard
library for a small model; do not introduce Mathlib or a new build system without
a concrete need. If Lean cannot run, report the missing prerequisite rather than
presenting pseudocode as verified.

Represent the chosen state and operations faithfully. State validity, preservation
of that validity, and the intended effect of an operation are different claims:
prove the ones that constrain the design. A theorem about a detached counter or
a restatement of a definition is not evidence about the whole state transition.
Do not make the specification weaker simply to finish a proof.

Run the checker on the actual definitions and proofs. Do not use `sorry`, admitted
proofs, or custom axioms to stand in for a missing argument. Distinguish a discovered
counterexample from a syntax error, a failed tactic, or an unproved conjecture.
Try a representative incorrect transition or counterexample when it helps establish
that the chosen property excludes the mistake of interest.

Keep proof effort proportional to the task. If the model mainly adds ceremony or
proving library plumbing stalls the work, narrow the claim, disclose the limit,
and finish the application. Do not call the design fully verified.

## Cross the implementation boundary

Translate the checked design into idiomatic target-language code. Do not port
proof scaffolding, dependent types, or a general abstraction framework merely
because they made the Lean model convenient.

Record material semantic differences: natural numbers versus bounded machine
numbers, structural equality versus object identity, Unicode/whitespace handling,
mutation, serialization, and I/O failure. Cover the relevant boundaries with
runtime checks or tests; a model assumption is not input validation.

Keep a runnable connection to production logic: compare operation traces or
boundary examples against the executable model, or check the same explicit
contract in both implementations. Identify which connection was used and its
coverage. Finite agreement is not a proof of implementation equivalence.

Finish the actual user flow and exercise it in its runtime. A proof about a pure
transition says nothing by itself about event wiring, persistence, accessibility,
network failures, or concurrency.

## Hand off evidence, not certainty

Report the modeled boundary, checked properties and exact commands, any design
decision changed by the model, implementation checks, and remaining assumptions.
If no bug or design improvement was observed, say so. Separate proof/model effort
from implementation time; cleaner code, faster delivery, and better edge-case
coverage require comparison evidence rather than being benefits to assume.

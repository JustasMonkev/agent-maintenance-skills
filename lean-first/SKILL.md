---
name: lean-first
description: Check consequential decision or state-transition logic against a small executable Lean model, searching short operation sequences for counterexamples, then implement or fix the target code. Use for model-first development, tricky invariants, auditing existing state logic, or an explicit Lean-first request; not routine UI work or a broad bug scan.
---

# Lean first

Find contract bugs cheaply. The deliverable is still the user's working software.

## 1. Contract and risks (a few lines, no code)

Scope to the smallest pure state + operations whose mistakes matter; leave UI, I/O
and glue out. Note state, operations, accepted inputs, invariants, and per-operation
effects. List risks as concrete traces:

- each operation after another on the same entity (after delete, release, expire, undo)
- repeats and retries; update of an existing key vs insert of a new one
- boundaries: 0, fractional, NaN, limit, exact deadline (`<` vs `<=`), unknown id, untrimmed text
- identity and order: id reuse after removal or undo; position after update or restore
- aliasing: any operation that mutates its input or state shared with history
- side channels: counters, stats, history entries recorded on no-ops

Record spec gaps as assumptions.

## 2. Triage by reading, then search only if it pays

Walk each risk trace through the existing code (or design) once. Fix every deviation
you can confirm by reading, each with a one-line trace test. In small modules this
step usually finds everything; do not repeat it with heavier machinery.

Run `lean --version`. Search mechanically only when Lean is available, the user asked
for a model, or a risk depends on behavior you could not settle by reading (container
ordering, aliasing across copies, several interacting operations, code too large to
trace). Otherwise skip the search and say so.

- **Lean available:** std-only file with `State`, `step : State → Op → State`, `inv :
  State → Bool`; `#eval` the risk traces and all sequences up to length 3 on a tiny
  domain. Prove only the 1–3 properties that constrain the design; no `sorry`, `admit`
  or axioms; never weaken the spec to finish. Then replay the risk traces (and any
  counterexamples) as target-language tests asserting the model's `#eval` results and
  resulting state against the real code; a passing model says nothing about the code
  until those match.
- **Lean missing, search still warranted:** do not install it. Write one target-language
  test over all sequences up to length 3 (2 keys, 3 time points, capacity 2) asserting
  invariants, input immutability and spec-stated effects; near 60 lines, under a second.
  Report that nothing was proved.

A counterexample is a bug to fix and keep as a trace test. Stop once the search runs
clean; do not grow it into a second implementation.

## Delegate the noisy part

A sub-agent keeps compiler output, failed tactics and test logs out of the main
context, but starts with a large fixed prompt (tens of thousands of tokens). Do the
contract, risks and reading triage yourself; they need the code and are cheap. Hand
work to a fresh sub-agent when a sub-agent tool exists and any one of these holds,
whatever the module size:

- a Lean proof loop or a search you expect to iterate on failures;
- a module too large to trace by reading (several hundred lines or more);
- several such modules: one sub-agent each, in parallel;
- your context is already long, or the user asked you to keep it small.

If none holds, work inline, even across several small modules. Prefer a faster,
cheaper model for the sub-agent when you can choose.

Brief it with file paths, the contract, the risk traces, bugs already fixed, domain
bounds, and which files it may write (tests or model only, unless it owns a whole
module). Ask for at most 15 lines back: each counterexample as a minimal op trace with
expected vs actual, files written, commands run, and what was proved vs only checked.
Fix bugs yourself and rerun its check once.

## 3. Implementation boundary

Implement idiomatically; no proof scaffolding. Check gaps the model hides: Nat vs float
or bounded ints, structural vs reference equality, in-place mutation through shallow
copies, Unicode and whitespace, serialization, I/O failure. A model assumption is not
input validation. Exercise the real flow; a proof says nothing about wiring or concurrency.

## 4. Report (≤8 lines)

Lean version or "Lean unavailable"; each bug with its trace; what was proved vs
bounded-checked vs tested, and which traces were replayed against the code; remaining
assumptions. Claim gains only with comparison evidence.

# Everyday todos: first draft

## Scope and design
Static HTML/CSS and native ES modules; serve this directory via any static HTTP server and open index.html. No build or runtime dependencies. todo.mjs is a pure domain module; app.mjs owns DOM and localStorage. Titles render through textContent. Filters are transient; only domain state is persisted at todo-benchmark-v1. Cancel never modifies the domain state.

Assumptions: transitions receive valid states and well-shaped actions as specified. Number.MAX_SAFE_INTEGER is an exhausted nextId because allocating it would leave no valid strictly greater safe nextId. Invalid stored snapshots reset atomically. A read failure starts an empty in-memory session with a visible message. Write failures retain all current work in memory. No cross-tab sync, undo, backend, or due dates.

## Lean-first boundary
Read and used the supplied lean-first skill before implementation. Model.lean uses Lean 4.35.0 standard library and models add/remove identity allocation with positive natural numbers. It proves add/remove preserve positivity and the strict allocation upper bound; proves the post-delete allocation candidate differs from every previous ID. Executable example allocates [1,3] after deleting 2. The representative incorrect list-length allocator produces reused ID 2. No sorry or custom axioms. Uniqueness is not separately formalized: the allocation bound supplies freshness for add, but the model does not prove the entire application.

Initial Lean tactic attempts failed, were corrected, and the final file checked successfully. No product design change resulted: the monotonic nextId design already met the requirement. Model effort was a short bounded preimplementation pass; implementation/testing was the larger phase. No measured speed or quality advantage is claimed.

The model omits text, toggles, edits, storage, UI, and JS integer bounds. JavaScript trims using String.trim and guards machine-number exhaustion; parseStored validates serialized input. The same delete/add [1,3] trace is checked by node test.mjs. Finite trace agreement is not implementation equivalence.

## Checks actually run
- Lean 4.35.0 version and checker on Model.lean; final exit 0.
- node test.mjs: passed identity trace, input immutability, blank/no-op operations, filters, edit completion preservation, clear, atomic parsing, fresh initial state and exhausted allocation.
- node browser-test.mjs with Playwright Chromium: passed add by Enter and button, literal HTML title, completion, cancel, save, active filtering/global count, reload persistence, clear/delete, storage read/write failure messaging and retained work, and 375px horizontal overflow check.
- Ordinary Python static server used for browser check. Sandbox blocked initial bind/browser attempts; approved retries succeeded. Raw outputs and command summary are in evidence.log.

## Remaining limits
No exhaustive formal proof, no equivalence proof, no automated accessibility audit, and no manual screen-reader or cross-browser testing. Browser checks establish observed workflows, not all possible interaction sequences. Tests require Node and the supplied absolute Playwright installation; the application itself has no dependencies. Visual focus styling and responsive wrapping are implemented; screenshot-based visual review was not performed.

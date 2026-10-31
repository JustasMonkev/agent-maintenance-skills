# Blinded static maintainability review

## Scope and method

Reviewed the common task and the production `todo.mjs`, `app.mjs`, `index.html`, and `style.css` files in A–D. Used targeted symbol/side-effect searches followed by focused source reads. Did not inspect submission notes, tests, outcomes, or treatment information, and did not execute behavior checks. Findings below are static hypotheses, not tested defects. File references are relative to `/tmp/lean-first-blind`.

## Qualitative ranking

**A ≈ C, then D, then B**, with only modest separation. A and C are effectively tied: A has slightly simpler domain validation/control flow; C centralizes more view-state derivation. D has useful interaction/state-handling improvements but substantially less readable presentation and an additional editable-state interaction to reason about. B has the densest action logic and mixes unrelated status responsibilities. D versus B is the weakest ordering and could reasonably become a tie if compact formatting carries little weight for the maintaining team.

This is a maintainability judgment, not a correctness leaderboard or a line-count comparison. All four use the same appropriately small architecture. None needs a framework, dependency, generic store, repository interface, or component hierarchy to satisfy this task.

## Shared strengths and costs

- All separate pure domain operations and atomic storage parsing from DOM/storage effects (`A/todo.mjs:5`, `B/todo.mjs:2`, `C/todo.mjs:5`, `D/todo.mjs:2`). Immutable transformations and explicit IDs are straightforward to inspect. Parsers validate before returning a sanitized snapshot (`A/todo.mjs:35–46`, `B/todo.mjs:17–27`, `C/todo.mjs:30–42`, `D/todo.mjs:19–29`). Repeating these checks in a single boundary is appropriate; a schema framework would not obviously help.
- All keep current domain state in memory before attempting a save and catch storage failures (`A/app.mjs:11–22`, `B/app.mjs:6–10`, `C/app.mjs:14–25`, `D/app.mjs:11–18`). Failure does not visibly roll state back in source. Title rendering uses `textContent`, not HTML (`A/app.mjs:64`, `B/app.mjs:32`, `C/app.mjs:72`, `D/app.mjs:48`).
- Each has one small button-construction helper and otherwise direct browser APIs. No speculative extension points or substantial abstraction tax appeared. Repeated map/filter expressions correspond to distinct domain operations, not clear evidence of harmful duplication.
- Each reconstructs the whole list on render. That is easy to understand at this scale, but transient edit input values live only in DOM nodes. An unrelated add or clear operation can recreate an edit form from the stored title and lose the unsaved draft (`A/app.mjs:33,43,80,90`; `B/app.mjs:16,24,42,48`; `C/app.mjs:39,49,87,97`; `D/app.mjs:26,40,56,58`). This is an interaction hypothesis worth testing, not grounds for introducing a general rendering system. A small explicit policy for cancelling or preserving drafts would address the maintenance ambiguity.
- All have long compound validation predicates. They are localized and match the stated invariant set; splitting them is a readability choice, not a demonstrated defect. All CSS includes focus styling and long-title wrapping; static review cannot establish actual viewport usability or visual quality.

## A: clear action boundaries, a little view-state scattering

A's switch gives edit, toggle, remove, and unknown actions their own branches (`A/todo.mjs:16–27`). The simple validation loop (`A/todo.mjs:39–44`) has less hidden callback state than C's `every` plus Set mutation. Descriptive local names and mostly one statement per line make UI creation and storage handling readily traceable (`A/app.mjs:24–30,38–67`). These are readability advantages, not behavioral guarantees.

The render function derives count, emptiness, and clear-button state, but selected-filter attributes are updated separately inside the click handler (`A/app.mjs:71–74,84–88`). A future programmatic filter change needs to remember both paths. Cancel, Escape, Save, toggle, and delete replace their focused DOM nodes without explicit focus restoration (`A/app.mjs:46–53,61–67`); this is a keyboard-flow hypothesis and a future maintenance obligation. C shares much of the latter issue, while D handles some cases explicitly.

A clears the new-title input after calling update even if the domain rejected an exhausted-ID add (`A/app.mjs:80–81`, `A/todo.mjs:8`). B and C have the same boundary mismatch. It is a concrete static mismatch in success signaling, but its user impact requires a boundary-case check.

## C: consistent derived UI, slightly more implicit parser behavior

C derives selected-filter attributes directly from `filter` during render (`C/app.mjs:80`), unlike A/B's separate event-handler updates. It also puts edit-input focus in render (`C/app.mjs:81`) rather than relying on every edit-entry caller to remember it. These choices make view reconstruction internally consistent. Save's button type is explicit (`C/app.mjs:51`). The same-title edit is a domain no-op (`C/todo.mjs:20`), avoiding a needless save; this is a minor benefit, not a major architectural distinction.

The parser's `every` predicate mutates `ids`, then a final ternary chooses the snapshot (`C/todo.mjs:35–40`). This is valid-looking local logic, but the loop used elsewhere expresses the validation/accumulation sequence more directly. That is a style preference, not a defect. Like A, C retains clear action branches rather than B's combined nested conditional (`C/todo.mjs:16–23`). C's source formatting, including HTML and CSS, is readily navigable.

C's render-time focus policy can also move focus when an unrelated action renders while editing (`C/app.mjs:81,87,97`), and it does not explicitly restore focus after edit completion/cancellation. Those interactions need behavioral checks before stronger claims.

## D: useful success/focus contracts, compressed source and extra edit interaction

`dispatch` returns whether the transition changed state (`D/app.mjs:11–18`), and the add handler clears the title only on success (`D/app.mjs:56`). This makes the domain/UI contract more robust than A/B/C at ID exhaustion. Filter selection is derived in render (`D/app.mjs:28`). The dedicated storage status (`D/app.mjs:3,15–16`) avoids mixing validation text with persistence failure. `focusEdit` names and localizes focus restoration after Save/Cancel, and deletion returns focus to the new input (`D/app.mjs:42–55`). These small helpers have identifiable responsibilities.

D creates the completion checkbox outside the edit/non-edit branch (`D/app.mjs:34–38`), so completion remains mutable while an edit draft is open. Its change handler dispatches and rerenders, rebuilding the edit input from the saved title (`D/app.mjs:36,40`). This creates an extra draft/completion/cancel interaction absent from A/B/C, whose checkbox is in the non-edit branch. It may also complicate the task's promise that cancelling preserves completion state. Treat as a test hypothesis, not a proven failure.

Several event handlers combine state changes, rendering, dispatch, DOM lookup, and focus on one line (`D/app.mjs:45,49–50,56–58`). The entire stylesheet is one line (`D/style.css:1`), making local rule discovery, diffs, and conflict resolution harder. Formatting alone is not an architectural defect, but here it materially obscures multiple responsibilities within handlers and stylesheet maintenance. D's domain action branches are still easier to extend independently than B's combined map expression (`D/todo.mjs:11–14`).

## B: sound small boundaries, more coupled detail within them

B retains the good pure-domain/UI boundary, and no unnecessary module hierarchy is present. However, its final domain map combines matching-ID selection and toggle-versus-edit policy in nested ternaries (`B/todo.mjs:9–12`). Adding another action requires understanding the earlier whitelist/guards and the implicit final edit branch together. A/C/D's explicit branches reduce that cognitive coupling without requiring extra abstractions.

UI handlers similarly pack several operations into single lines (`B/app.mjs:27,31–33,42,46`). This is mostly a readability preference until modifying those paths, not evidence that compact code is wrong. `apply` writes storage even on no-op transitions (`B/app.mjs:6–9`), whereas A/C/D distinguish unchanged state; unnecessary side effects make status behavior less directly tied to actual edits.

B also uses the same status node for storage failures and blank-input validation (`B/app.mjs:9,27,41`). A blank attempt can overwrite an outstanding save-failure explanation although no successful save occurred. That is a specific error-state interaction to test. Keeping persistence status separate, as D does, or explicitly defining message priority would make this easier to maintain. B's CSS is conventionally structured and its small-screen edit wrapping is explicit (`B/style.css:25–27`); it should not be penalized simply for having fewer source lines.

## Bottom line

The primary differences are local clarity and UI-state lifecycle discipline, not abstraction depth. A/C provide the most consistently readable starting points. D contains worthwhile small success/focus contracts that A/C could adopt, but its compressed presentation and live-checkbox/edit interaction add maintenance burden. B remains understandable and appropriately scoped, with the least explicit action branching and status-state policy. Behavior checks may alter the practical preference; this static review does not certify any submission as correct.

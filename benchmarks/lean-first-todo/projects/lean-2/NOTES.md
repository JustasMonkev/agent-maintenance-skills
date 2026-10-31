# Everyday todos: bounded first draft

## Outcome and scope
Static vanilla HTML/CSS/ES module todo app, with immutable pure API in todo.mjs.
Serve this directory with any ordinary static HTTP server and open index.html.
No build, runtime dependency, backend, cross-tab synchronization, undo, or due dates.

## Design and assumptions
- nextId is persisted separately from the list and never derived from its length.
- MAX_SAFE_INTEGER is an exhausted allocator: adding there cannot yield a valid successor, so it is a no-op.
- Stored snapshots are accepted atomically or reset to fresh initial state. Invalid storage is not partially recovered.
- One inline edit at a time. Filtering cancels that edit. Escape also cancels.
- A failed storage read starts a usable empty session and shows a message. Failed writes keep current memory and show a visible status; a successful later write clears the status.
- Titles render with textContent; duplicate titles are not identities. Native buttons, forms, labels and checkbox controls supply keyboard interactions and visible focus CSS.

## Lean-first boundary
Model.lean checked with Lean 4.35.0 before application implementation. It models list identities, allocator, add and remove (not titles, parsing, completion toggles, UI or I/O). Checked add preserves positive/bounded IDs and positive allocator under Valid, deletion preserves allocator, and an add after deletion does not reuse any original identity. The explicit remove-1/add trace yields IDs [2,3], also asserted against production JavaScript in test.mjs. No sorry or custom axioms.

Validity here does not include uniqueness; add freshness is a separate theorem and incoming state uniqueness is validated by JavaScript. Natural numbers in Lean are unbounded; JavaScript uses safe-integer validation and refuses an exhausted allocator. Trimming/Unicode and serialization are JavaScript concerns, not formal claims. This is finite trace connection, not equivalence proof. The model reinforced the selected persisted allocator design; it found no implementation bug or novel design improvement. Proof/model effort was a short pre-implementation pass; implementation/browser work was separate and longer, with no measured speed comparison.

## Checks actually executed
- Lean --version and lean Model.lean: passed; executable trace [2,3].
- node test.mjs: passed; immutable inputs, blank actions, duplicates, unknown/missing ID no-ops, toggle/edit completion, filters, stable identity trace, round-trip and atomic invalid storage rejection, exhaustion and clear.
- node browser-test.mjs: first attempt blocked by sandbox localhost listen EPERM; rerun with execution approval passed in headless Chromium at 375px width.
- Browser exercised literal HTML titles, add, toggle, cancelled edit, saved edit, active filter/count, reload persistence, clear, delete, long-title layout, throwing storage writes, throwing storage getter, and absence of page errors in the main workflow.

## Limits
Not exhaustive browser or assistive-technology testing; no screen-reader session or visual screenshot review. Keyboard Escape is implemented, but automated browser checks used clicks, not an exhaustive tab-order walkthrough. localStorage failure necessarily prevents reload persistence. Tests use the supplied external Playwright installation as development tooling only; the app itself has no dependencies.

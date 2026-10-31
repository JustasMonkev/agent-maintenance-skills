# Todo notebook

## Outcome and scope
A dependency-free static app with the supplied pure domain API, add/edit/toggle/delete, filters, active count, clear completed, and localStorage persistence. Serve this directory with an ordinary static HTTP server and open index.html. No build or backend.

## First design decisions
- Immutable array transitions in todo.mjs; all storage and DOM effects live in app.mjs.
- Monotonically increasing numeric identities, persisted with nextId.
- Treat MAX_SAFE_INTEGER nextId as exhausted because adding would require an invalid nextId in the resulting snapshot.
- Reject malformed stored snapshots atomically. Missing or malformed storage starts empty.
- Use native forms/buttons/checkboxes, visible keyboard focus, textContent for titles, and wrapping narrow-screen layouts.
- Edit cancellation does not call the domain transition. Blank edits remain in edit mode, preserving the stored title.
- Storage exceptions keep the current in-memory state and show a status message. A later successful save clears the warning.

## Edge cases and checks actually executed
- `node test.mjs`: passed. Checks fresh initial state, immutable additions/toggles, trimmed titles, duplicate identities, blank no-ops, missing IDs and unknown actions, filters, preserved completion during edits, clear/remove identity monotonicity, valid reload parsing, atomic invalid-snapshot rejection, exhausted IDs.
- `python3 -m http.server 8768`: served this directory during browser checks.
- `node browser-test.mjs`: first attempt was blocked during Chromium startup by macOS sandbox permissions; rerun with execution permission passed.
- Browser check uses Chromium at 375px width: add, safe rendering of HTML-like title, toggle, filtered remaining count, edit cancel/save, reload persistence, clear and delete, simulated storage write/read failures, no horizontal overflow or JavaScript page errors.
- `node --check app.mjs` and `node --check todo.mjs`: passed.
- evidence.log retains actual test output including the initial environment failure.

## Limits
The browser test imports the host's existing Playwright path and needs the local server above; the app itself has no runtime dependencies. No screen-reader, manual visual inspection, or non-Chromium browser testing was performed. No cross-tab synchronization, undo, backend, or due dates, as scoped.

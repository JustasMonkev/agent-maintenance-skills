# Everyday todos

## Outcome and scope
A dependency-free static todo app with immutable domain operations and localStorage persistence. Serve this directory over ordinary HTTP and open index.html. No build step is needed. No backend, cross-tab synchronization, undo, or due dates.

## First design decisions and assumptions
- Keep domain rules in todo.mjs, DOM interactions in app.mjs, styling separate.
- Rebuild the small list from state using DOM methods and textContent, never title HTML.
- Store the full validated state at todo-benchmark-v1. Keep in-memory changes on failed writes and display a status message.
- Treat Number.MAX_SAFE_INTEGER as exhausted nextId: adding there would require an unsafe successor, violating the valid state invariant.
- Filtering is view-only. Remaining count always counts every active todo.
- Edit mode is temporary UI state; Save changes only the title, Cancel/Escape changes nothing. Blank saves stay in edit mode.

## Edge cases addressed
Blank titles, trimmed additions/edits, duplicate independent IDs, deleted IDs not reused, atomic malformed snapshot rejection, safe integer exhaustion, missing IDs and unknown actions, title markup displayed literally, long title wrapping, unavailable storage.

## Checks actually run
- `node test.mjs`: passed domain assertions for immutability, trimming/no-ops, duplicate identity, toggle/edit completion preservation, filters, clear/delete, reload identity, invalid snapshots and ID exhaustion.
- `node browser-test.mjs`: first attempt blocked by sandbox loopback permissions; rerun with permission passed. Chromium exercised adding, literal markup, completion, cancellation, save, active filtering and global count, reload, clear/delete, write/read failures, and no horizontal overflow at 375px.
- Raw output, including the initial environment failure, is in evidence.log.

## Limits
First draft, not exhaustive testing. No screen-reader or real mobile-device testing. Focus rings and native keyboard controls are implemented, but screen-reader announcements and every keyboard navigation sequence were not manually audited. Browser test imports the host-provided Playwright path; the app itself has no runtime dependencies. No external assets or frameworks.

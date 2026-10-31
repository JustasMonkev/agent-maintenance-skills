# Frozen todo-app task

Build a simple, usable todo app with vanilla JavaScript ES modules, HTML and CSS.
No frameworks, build step, external assets or runtime dependencies. The app must
work when its folder is served by an ordinary static HTTP server. Use index.html
as its entrypoint and todo.mjs for the pure domain API below. Other file choices
are yours. This is a first-draft comparison: finish and verify your own work, but
do not inspect other submissions or the evaluator's tests.

## Product

Add, edit, complete/uncomplete, delete and filter todos; clear completed todos.
Show the remaining active count, including when filtering. Preserve data after
reload using localStorage key `todo-benchmark-v1`. A storage read/write failure
must not crash the app or discard the current in-memory work; visibly explain
when saving fails. No backend, cross-tab synchronization, undo or due dates.

Trim titles. Blank additions and blank edits must not change domain state.
Duplicate titles are allowed and remain independently editable. Stable identities
must survive deletion and reload. Render title text as text, not HTML. Support
keyboard use, visible focus, narrow screens and long titles. Edit supports Save
and Cancel; cancelling preserves the old title and completion state.

## Pure API (named exports from todo.mjs)

- `initialState()` returns a fresh `{ todos: [], nextId: 1 }`.
- `transition(state, action)` implements `{ type: 'add', title }`,
  `{ type: 'edit', id, title }`, `{ type: 'toggle', id }`,
  `{ type: 'remove', id }`, and `{ type: 'clearCompleted' }`.
  Inputs are immutable; unknown actions or missing IDs are no-ops. New todos
  append with completed=false and id=nextId, then increment nextId. IDs are
  positive safe integers, never reused; exhausted nextId cannot add a todo.
- `visibleTodos(state, filter)` returns all, active, or completed todos in their
  original order for filters `'all'`, `'active'`, `'completed'`; it does not mutate.
- `parseStored(text)` accepts the serialized state shape below. Null, bad JSON,
  or an invalid snapshot returns a fresh initial state; reject invalid snapshots
  atomically rather than silently retaining a subset.

A valid snapshot has an array of todos with unique positive safe-integer IDs,
nonempty already-trimmed string titles, and boolean completed values. nextId is
a positive safe integer greater than every stored ID. Unknown extra fields may
be discarded or preserved. Transitions receive valid states and well-shaped
actions; the unknown-action/missing-ID behavior above is also required.

## UI hooks (to keep behavior checks independent of layout)

- Input accessible name `New todo`, submit button `Add`.
- List `data-testid="todo-list"`; each todo uses `data-testid="todo"`.
- Each todo has checkbox accessible name `Complete TITLE` and buttons
  `Edit TITLE` / `Delete TITLE`, using its current title.
- Edit input accessible name `Edit todo`; buttons `Save` and `Cancel`.
- Filter buttons `All`, `Active`, `Completed`; button `Clear completed`.
- Remaining count element `data-testid="remaining"` includes the number.
- Visible status/error messaging has role=status or role=alert.

## Submission

Leave runnable code and any tests you wrote. Record your assumptions, first design
decisions, encountered edge cases, tests actually run and limits in NOTES.md.
Record commands/output in evidence.log where practical. Do not commit or push.

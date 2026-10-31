import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

if (process.argv.length !== 3)
  throw new Error('Usage: node check-domain.mjs PROJECT_DIRECTORY');
const { initialState, transition, visibleTodos, parseStored } = await import(pathToFileURL(path.resolve(process.argv[2], 'todo.mjs')));
const empty = () => ({ todos: [], nextId: 1 });
const todo = (id, title, completed = false) => ({ id, title, completed });
const sample = () => ({ todos: [todo(1, 'Alpha'), todo(3, 'Beta', true)], nextId: 7 });

test('initial states are fresh and valid', () => {
  const first = initialState();
  assert.deepEqual(first, empty());
  first.todos.push(todo(1, 'Modified'));
  assert.deepEqual(initialState(), empty());
});

test('addition trims Unicode whitespace and appends a stable identity', () => {
  assert.deepEqual(transition(sample(), { type: 'add', title: '\u00a0 Gamma \u2003' }), {
    todos: [...sample().todos, todo(7, 'Gamma')], nextId: 8,
  });
});

test('empty additions and edits preserve all state', () => {
  for (const title of ['', ' \t\n', '\u00a0\u2003']) {
    assert.deepEqual(transition(sample(), { type: 'add', title }), sample());
    assert.deepEqual(transition(sample(), { type: 'edit', id: 3, title }), sample());
  }
});

test('duplicate titles have independent identities', () => {
  let state = transition(empty(), { type: 'add', title: 'Same' });
  state = transition(state, { type: 'add', title: 'Same' });
  state = transition(state, { type: 'toggle', id: 1 });
  assert.deepEqual(state, { todos: [todo(1, 'Same', true), todo(2, 'Same')], nextId: 3 });
});

test('edit preserves completion, identity, order and nextId', () => {
  assert.deepEqual(transition(sample(), { type: 'edit', id: 3, title: ' Updated ' }), {
    todos: [todo(1, 'Alpha'), todo(3, 'Updated', true)], nextId: 7,
  });
});

test('toggle twice restores values and changes only the requested todo', () => {
  const once = transition(sample(), { type: 'toggle', id: 1 });
  assert.deepEqual(once, { todos: [todo(1, 'Alpha', true), todo(3, 'Beta', true)], nextId: 7 });
  assert.deepEqual(transition(once, { type: 'toggle', id: 1 }), sample());
});

test('missing identities and unknown actions are no-ops', () => {
  for (const action of [{ type: 'edit', id: 999, title: 'X' }, { type: 'toggle', id: 999 },
    { type: 'remove', id: 999 }, { type: 'unknown' }])
    assert.deepEqual(transition(sample(), action), sample());
});

test('removal preserves allocator and identities are never reused', () => {
  const removed = transition(sample(), { type: 'remove', id: 3 });
  assert.deepEqual(removed, { todos: [todo(1, 'Alpha')], nextId: 7 });
  assert.deepEqual(transition(removed, { type: 'add', title: 'New' }), {
    todos: [todo(1, 'Alpha'), todo(7, 'New')], nextId: 8,
  });
});

test('clear completed is selective, idempotent and preserves allocator', () => {
  const cleared = transition(sample(), { type: 'clearCompleted' });
  assert.deepEqual(cleared, { todos: [todo(1, 'Alpha')], nextId: 7 });
  assert.deepEqual(transition(cleared, { type: 'clearCompleted' }), cleared);
});

test('filters select in original order without changing full state', () => {
  const state = sample();
  assert.deepEqual(visibleTodos(state, 'all'), state.todos);
  assert.deepEqual(visibleTodos(state, 'active'), [todo(1, 'Alpha')]);
  assert.deepEqual(visibleTodos(state, 'completed'), [todo(3, 'Beta', true)]);
  assert.deepEqual(state, sample());
});

test('transitions accept deeply frozen inputs and never mutate them', () => {
  const state = sample();
  for (const item of state.todos)
    Object.freeze(item);
  Object.freeze(state.todos);
  Object.freeze(state);
  for (const action of [{ type: 'add', title: 'New' }, { type: 'edit', id: 1, title: 'Changed' },
    { type: 'toggle', id: 3 }, { type: 'remove', id: 1 }, { type: 'clearCompleted' }]) {
    transition(state, Object.freeze(action));
    assert.deepEqual(state, sample());
  }
});

test('exhausted safe-integer allocator is a no-op', () => {
  const state = { todos: [], nextId: Number.MAX_SAFE_INTEGER };
  assert.deepEqual(transition(state, { type: 'add', title: 'No capacity' }), state);
  const last = transition({ todos: [], nextId: Number.MAX_SAFE_INTEGER - 1 }, { type: 'add', title: 'Last' });
  assert.deepEqual(last, { todos: [todo(Number.MAX_SAFE_INTEGER - 1, 'Last')], nextId: Number.MAX_SAFE_INTEGER });
});

test('valid storage round-trip preserves future identity allocation', () => {
  assert.deepEqual(parseStored(JSON.stringify(sample())), sample());
  assert.deepEqual(transition(parseStored(JSON.stringify(sample())), { type: 'add', title: 'Restored' }), {
    todos: [...sample().todos, todo(7, 'Restored')], nextId: 8,
  });
});

test('missing, malformed and wrong-root storage resets atomically', () => {
  for (const text of [null, '', '{', 'null', '[]', 'true', '42', '"text"', '{}', '{"todos":[]}'])
    assert.deepEqual(parseStored(text), empty(), `Input: ${text}`);
});

test('invalid todo shapes reject the whole snapshot', () => {
  for (const item of [null, {}, todo(0, 'Bad'), todo(-1, 'Bad'), todo(1.5, 'Bad'),
    todo(Number.MAX_SAFE_INTEGER + 1, 'Bad'), todo('2', 'Bad'), todo(2, ''), todo(2, ' Bad '),
    todo(2, 4), todo(2, 'Bad', 1), { id: 2, title: 'Bad' }]) {
    assert.deepEqual(parseStored(JSON.stringify({ todos: [todo(1, 'Good'), item], nextId: 10 })), empty());
  }
});

test('duplicate identities and invalid allocators reject storage', () => {
  assert.deepEqual(parseStored(JSON.stringify({ todos: [todo(1, 'A'), todo(1, 'B')], nextId: 2 })), empty());
  for (const nextId of [0, -1, 2, 3, 3.5, '7', null, Number.MAX_SAFE_INTEGER + 1])
    assert.deepEqual(parseStored(JSON.stringify({ todos: sample().todos, nextId })), empty());
});

test('invalid snapshot resets do not share mutable state', () => {
  const first = parseStored('{');
  first.todos.push(todo(1, 'Modified'));
  assert.deepEqual(parseStored('{'), empty());
});

test('hostile markup remains ordinary domain text', () => {
  const title = '<img src=x onerror=alert(1)>';
  assert.deepEqual(transition(empty(), { type: 'add', title }), { todos: [todo(1, title)], nextId: 2 });
});

test('5000 deterministic mixed operations agree with an independent reference', () => {
  let seed = 123456;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  let expected = empty();
  let actual = initialState();
  for (let step = 0; step < 5000; step++) {
    const type = ['add', 'edit', 'toggle', 'remove', 'clearCompleted', 'unknown'][next() % 6];
    const title = [' Alpha ', 'Beta', '', '\u00a0', '<b>text</b>', 'Same'][next() % 6];
    const action = { type, title, id: next() % (expected.nextId + 2) };
    expected = reference(expected, action);
    actual = transition(actual, action);
    assert.deepEqual(actual, expected, `Step ${step}: ${JSON.stringify(action)}`);
    if (step % 17 === 0)
      actual = parseStored(JSON.stringify(actual));
  }
});

function reference(state, action) {
  const copy = structuredClone(state);
  const item = copy.todos.find(item => item.id === action.id);
  switch (action.type) {
    case 'add':
      if (action.title.trim() && copy.nextId < Number.MAX_SAFE_INTEGER)
        copy.todos.push(todo(copy.nextId++, action.title.trim()));
      break;
    case 'edit':
      if (item && action.title.trim())
        item.title = action.title.trim();
      break;
    case 'toggle':
      if (item)
        item.completed = !item.completed;
      break;
    case 'remove':
      copy.todos = copy.todos.filter(item => item.id !== action.id);
      break;
    case 'clearCompleted':
      copy.todos = copy.todos.filter(item => !item.completed);
      break;
  }
  return copy;
}

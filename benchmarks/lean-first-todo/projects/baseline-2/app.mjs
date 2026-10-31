import { initialState, parseStored, transition, visibleTodos } from './todo.mjs';
const key = 'todo-benchmark-v1';
const list = document.querySelector('[data-testid="todo-list"]');
const status = document.querySelector('#status');
let state = initialState();
let filter = 'all';
let editing = null;
try { state = parseStored(localStorage.getItem(key)); }
catch { status.textContent = 'Saved todos could not be loaded. You can still work in this session.'; }

function update(action) {
  const next = transition(state, action);
  if (next !== state) {
    state = next;
    try {
      localStorage.setItem(key, JSON.stringify(state));
      status.textContent = '';
    } catch {
      status.textContent = 'Saving failed. Your changes are kept in this session, but may be lost after reload.';
    }
  }
  render();
}
function button(text, label, handler) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  if (label) element.setAttribute('aria-label', label);
  element.addEventListener('click', handler);
  return element;
}
function render() {
  list.replaceChildren();
  const todos = visibleTodos(state, filter);
  for (const todo of todos) {
    const row = document.createElement('li');
    row.dataset.testid = 'todo';
    if (editing === todo.id) {
      const form = document.createElement('form');
      form.className = 'edit-form';
      const input = document.createElement('input');
      input.setAttribute('aria-label', 'Edit todo');
      input.value = todo.title;
      const save = document.createElement('button');
      save.textContent = 'Save';
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim()) { input.focus(); return; }
        editing = null;
        update({ type: 'edit', id: todo.id, title: input.value });
      });
      const cancel = button('Cancel', null, () => { editing = null; render(); });
      input.addEventListener('keydown', event => { if (event.key === 'Escape') { editing = null; render(); } });
      form.append(input, save, cancel);
      row.append(form);
    } else {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `Complete ${todo.title}`);
      checkbox.addEventListener('change', () => update({ type: 'toggle', id: todo.id }));
      const title = document.createElement('span');
      title.className = todo.completed ? 'title completed' : 'title';
      title.textContent = todo.title;
      row.append(checkbox, title,
        button('Edit', `Edit ${todo.title}`, () => { editing = todo.id; render(); list.querySelector('[aria-label="Edit todo"]').focus(); }),
        button('Delete', `Delete ${todo.title}`, () => update({ type: 'remove', id: todo.id })));
    }
    list.append(row);
  }
  document.querySelector('[data-testid="remaining"]').textContent = `${state.todos.filter(todo => !todo.completed).length} remaining`;
  document.querySelector('#empty').hidden = todos.length > 0;
  document.querySelector('#empty').textContent = state.todos.length ? 'No todos in this view.' : 'Your notebook is clear. Add a task above.';
  document.querySelector('#clear').disabled = !state.todos.some(todo => todo.completed);
}
document.querySelector('#add-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#new-todo');
  if (!input.value.trim()) return;
  update({ type: 'add', title: input.value });
  input.value = '';
  input.focus();
});
document.querySelectorAll('[data-filter]').forEach(element => element.addEventListener('click', () => {
  filter = element.dataset.filter;
  editing = null;
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === element)));
  render();
}));
document.querySelector('#clear').addEventListener('click', () => update({ type: 'clearCompleted' }));
render();

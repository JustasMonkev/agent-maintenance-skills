import { initialState, transition, visibleTodos, parseStored } from './todo.mjs';

const key = 'todo-benchmark-v1';
const status = document.querySelector('#status');
let state = initialState();
let filter = 'all';
let editingId = null;
try {
  state = parseStored(localStorage.getItem(key));
} catch {
  status.textContent = 'Saved todos could not be read. You can keep working, but storage may be unavailable.';
}

function apply(action) {
  const next = transition(state, action);
  if (next !== state) {
    state = next;
    try {
      localStorage.setItem(key, JSON.stringify(state));
      status.textContent = '';
    } catch {
      status.textContent = 'Saving failed. Your todos are still here, but changes may be lost after reload.';
    }
  }
  render();
}

function button(text, label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  if (label) element.setAttribute('aria-label', label);
  element.addEventListener('click', action);
  return element;
}

function render() {
  const list = document.querySelector('[data-testid="todo-list"]');
  list.replaceChildren();
  const todos = visibleTodos(state, filter);
  for (const todo of todos) {
    const row = document.createElement('li');
    row.dataset.testid = 'todo';
    if (editingId === todo.id) {
      const form = document.createElement('form');
      form.className = 'edit-form';
      const input = document.createElement('input');
      input.setAttribute('aria-label', 'Edit todo');
      input.value = todo.title;
      const save = document.createElement('button');
      save.type = 'submit';
      save.textContent = 'Save';
      form.append(input, save, button('Cancel', null, () => { editingId = null; render(); }));
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim()) { input.focus(); return; }
        editingId = null;
        apply({ type: 'edit', id: todo.id, title: input.value });
      });
      form.addEventListener('keydown', event => {
        if (event.key === 'Escape') { editingId = null; render(); }
      });
      row.append(form);
    } else {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `Complete ${todo.title}`);
      checkbox.addEventListener('change', () => apply({ type: 'toggle', id: todo.id }));
      const title = document.createElement('span');
      title.className = todo.completed ? 'title completed' : 'title';
      title.textContent = todo.title;
      row.append(checkbox, title, button('Edit', `Edit ${todo.title}`, () => { editingId = todo.id; render(); }), button('Delete', `Delete ${todo.title}`, () => apply({ type: 'remove', id: todo.id })));
    }
    list.append(row);
  }
  document.querySelector('[data-testid="remaining"]').textContent = `${state.todos.filter(todo => !todo.completed).length} active remaining`;
  document.querySelector('#empty').textContent = todos.length ? '' : filter === 'all' ? 'A clear page. Add your first todo above.' : `No ${filter} todos.`;
  document.querySelector('#clear').disabled = !state.todos.some(todo => todo.completed);
  for (const item of document.querySelectorAll('[data-filter]')) item.setAttribute('aria-pressed', String(item.dataset.filter === filter));
  if (editingId !== null) document.querySelector('[aria-label="Edit todo"]')?.focus();
}

document.querySelector('#add-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#new-todo');
  apply({ type: 'add', title: input.value });
  input.value = '';
  input.focus();
});
document.querySelector('#filters').addEventListener('click', event => {
  if (!event.target.dataset.filter) return;
  filter = event.target.dataset.filter;
  editingId = null;
  render();
});
document.querySelector('#clear').addEventListener('click', () => apply({ type: 'clearCompleted' }));
render();

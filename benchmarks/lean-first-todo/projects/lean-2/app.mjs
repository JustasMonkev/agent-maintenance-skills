import { initialState, transition, visibleTodos, parseStored } from './todo.mjs';
const key = 'todo-benchmark-v1';
const status = document.querySelector('#storage-status');
let state = initialState();
try { state = parseStored(localStorage.getItem(key)); }
catch { status.textContent = 'Saved todos could not be read. You can still work here, but storage may be unavailable.'; }
let filter = 'all';
let editing = null;
const list = document.querySelector('[data-testid="todo-list"]');
const newInput = document.querySelector('#new-todo');
function dispatch(action) {
  const next = transition(state, action);
  if (next === state) return false;
  state = next;
  try { localStorage.setItem(key, JSON.stringify(state)); status.textContent = ''; }
  catch { status.textContent = 'Saving failed. Your todos are still available here, but may be lost after reload.'; }
  render();
  return true;
}
function button(text, label, action) {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
  if (label) b.setAttribute('aria-label', label);
  b.addEventListener('click', action); return b;
}
function render() {
  list.replaceChildren();
  document.querySelector('[data-testid="remaining"]').textContent = `${state.todos.filter(t => !t.completed).length} remaining`;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  const todos = visibleTodos(state, filter);
  document.querySelector('#empty').textContent = todos.length ? '' : filter === 'all' ? 'Nothing here yet. Add your first todo above.' : `No ${filter} todos.`;
  document.querySelector('#clear').disabled = !state.todos.some(t => t.completed);
  for (const todo of todos) {
    const li = document.createElement('li'); li.dataset.testid = 'todo';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Complete ${todo.title}`);
    checkbox.addEventListener('change', () => dispatch({ type: 'toggle', id: todo.id }));
    li.append(checkbox);
    if (editing === todo.id) {
      const form = document.createElement('form'); form.className = 'edit-form';
      const input = document.createElement('input'); input.value = todo.title; input.setAttribute('aria-label', 'Edit todo'); input.required = true;
      const save = document.createElement('button'); save.textContent = 'Save';
      const cancel = () => { editing = null; render(); focusEdit(todo.id); };
      form.append(input, save, button('Cancel', null, cancel));
      input.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); cancel(); } });
      form.addEventListener('submit', e => { e.preventDefault(); if (!input.value.trim()) { input.focus(); return; } editing = null; dispatch({ type: 'edit', id: todo.id, title: input.value }); focusEdit(todo.id); });
      li.append(form);
    } else {
      const title = document.createElement('span'); title.textContent = todo.title; title.className = todo.completed ? 'title done' : 'title';
      const edit = button('Edit', `Edit ${todo.title}`, () => { editing = todo.id; render(); list.querySelector('[aria-label="Edit todo"]').focus(); }); edit.dataset.id = todo.id;
      li.append(title, edit, button('Delete', `Delete ${todo.title}`, () => { dispatch({type:'remove', id:todo.id}); newInput.focus(); }));
    }
    list.append(li);
  }
}
function focusEdit(id) { list.querySelector(`button[data-id="${id}"]`)?.focus(); }
document.querySelector('#add-form').addEventListener('submit', e => { e.preventDefault(); if (dispatch({type:'add',title:newInput.value})) newInput.value = ''; newInput.focus(); });
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; editing = null; render(); }));
document.querySelector('#clear').addEventListener('click', () => { editing = null; dispatch({type:'clearCompleted'}); });
render();

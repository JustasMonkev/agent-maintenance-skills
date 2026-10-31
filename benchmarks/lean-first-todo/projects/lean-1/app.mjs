import { initialState, transition, visibleTodos, parseStored } from './todo.mjs';
const key = 'todo-benchmark-v1';
const status = document.querySelector('#status');
let state = initialState(), filter = 'all', editing = null;
try { state = parseStored(localStorage.getItem(key)); } catch { status.textContent = 'Storage is unavailable. Changes will remain in this tab but may not be saved.'; }
function apply(action) {
  state = transition(state, action);
  try { localStorage.setItem(key, JSON.stringify(state)); status.textContent = ''; }
  catch { status.textContent = 'Could not save changes. Your work is still available in this tab.'; }
  render();
}
function button(text, label, handler) {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.setAttribute('aria-label', label); b.addEventListener('click', handler); return b;
}
function render() {
  const list = document.querySelector('[data-testid="todo-list"]'); list.replaceChildren();
  document.querySelector('[data-testid="remaining"]').textContent = `${state.todos.filter(t => !t.completed).length} remaining`;
  const shown = visibleTodos(state, filter);
  document.querySelector('#empty').textContent = shown.length ? '' : filter === 'all' ? 'Nothing here yet. Add your first todo.' : `No ${filter} todos.`;
  for (const t of shown) {
    const li = document.createElement('li'); li.dataset.testid = 'todo';
    if (editing === t.id) {
      const form = document.createElement('form'); form.className = 'edit-form';
      const input = document.createElement('input'); input.setAttribute('aria-label', 'Edit todo'); input.value = t.title;
      const save = document.createElement('button'); save.textContent = 'Save';
      form.append(input, save, button('Cancel', 'Cancel', () => { editing = null; render(); }));
      form.addEventListener('submit', e => { e.preventDefault(); if (!input.value.trim()) { status.textContent = 'Please enter a title, or Cancel to keep the original.'; input.focus(); return; } editing = null; apply({type:'edit', id:t.id, title:input.value}); });
      input.addEventListener('keydown', e => { if (e.key === 'Escape') { editing = null; render(); } });
      li.append(form);
    } else {
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = t.completed; checkbox.setAttribute('aria-label', `Complete ${t.title}`); checkbox.addEventListener('change', () => apply({type:'toggle', id:t.id}));
      const title = document.createElement('span'); title.className = t.completed ? 'title done' : 'title'; title.textContent = t.title;
      li.append(checkbox, title, button('Edit', `Edit ${t.title}`, () => { editing = t.id; render(); list.querySelector('[aria-label="Edit todo"]').focus(); }), button('Delete', `Delete ${t.title}`, () => apply({type:'remove', id:t.id})));
    }
    list.append(li);
  }
  document.querySelector('#clear').disabled = !state.todos.some(t => t.completed);
}
document.querySelector('#add-form').addEventListener('submit', e => {
  e.preventDefault(); const input = document.querySelector('#new-todo');
  if (!input.value.trim()) { status.textContent = 'Please enter a todo title.'; input.focus(); return; }
  apply({type:'add', title:input.value}); input.value = ''; input.focus();
});
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.filter; editing = null;
  document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === b))); render();
}));
document.querySelector('#clear').addEventListener('click', () => apply({type:'clearCompleted'}));
render();

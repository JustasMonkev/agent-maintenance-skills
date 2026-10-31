export const initialState = () => ({ todos: [], nextId: 1 });
export function transition(state, action) {
  if (action.type === 'add') {
    const title = action.title.trim();
    if (!title || state.nextId >= Number.MAX_SAFE_INTEGER) return state;
    return { todos: [...state.todos, { id: state.nextId, title, completed: false }], nextId: state.nextId + 1 };
  }
  if (action.type === 'clearCompleted') return { ...state, todos: state.todos.filter(t => !t.completed) };
  if (!['edit', 'toggle', 'remove'].includes(action.type) || !state.todos.some(t => t.id === action.id)) return state;
  if (action.type === 'remove') return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
  if (action.type === 'edit' && !action.title.trim()) return state;
  return { ...state, todos: state.todos.map(t => t.id !== action.id ? t : action.type === 'toggle' ? { ...t, completed: !t.completed } : { ...t, title: action.title.trim() }) };
}
export function visibleTodos(state, filter) {
  return state.todos.filter(t => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true);
}
export function parseStored(text) {
  try {
    const s = JSON.parse(text);
    if (!s || !Array.isArray(s.todos) || !Number.isSafeInteger(s.nextId) || s.nextId <= 0) return initialState();
    const ids = new Set();
    for (const t of s.todos) {
      if (!t || !Number.isSafeInteger(t.id) || t.id <= 0 || t.id >= s.nextId || ids.has(t.id) || typeof t.title !== 'string' || !t.title || t.title !== t.title.trim() || typeof t.completed !== 'boolean') return initialState();
      ids.add(t.id);
    }
    return { todos: s.todos.map(({id, title, completed}) => ({id, title, completed})), nextId: s.nextId };
  } catch { return initialState(); }
}

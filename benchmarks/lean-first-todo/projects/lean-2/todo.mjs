export const initialState = () => ({ todos: [], nextId: 1 });
export function transition(state, action) {
  const title = typeof action.title === 'string' ? action.title.trim() : '';
  if (action.type === 'add') {
    if (!title || state.nextId === Number.MAX_SAFE_INTEGER) return state;
    return { todos: [...state.todos, { id: state.nextId, title, completed: false }], nextId: state.nextId + 1 };
  }
  if (action.type === 'clearCompleted') return { ...state, todos: state.todos.filter(t => !t.completed) };
  const found = state.todos.some(t => t.id === action.id);
  if (!found) return state;
  if (action.type === 'remove') return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
  if (action.type === 'edit' && title) return { ...state, todos: state.todos.map(t => t.id === action.id ? { ...t, title } : t) };
  if (action.type === 'toggle') return { ...state, todos: state.todos.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t) };
  return state;
}
export function visibleTodos(state, filter) {
  return state.todos.filter(t => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true);
}
export function parseStored(text) {
  try {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.todos) || !Number.isSafeInteger(data.nextId) || data.nextId < 1) return initialState();
    const ids = new Set();
    for (const t of data.todos) {
      if (!t || !Number.isSafeInteger(t.id) || t.id < 1 || t.id >= data.nextId || ids.has(t.id) || typeof t.title !== 'string' || !t.title || t.title !== t.title.trim() || typeof t.completed !== 'boolean') return initialState();
      ids.add(t.id);
    }
    return { todos: data.todos.map(({id,title,completed}) => ({id,title,completed})), nextId: data.nextId };
  } catch { return initialState(); }
}

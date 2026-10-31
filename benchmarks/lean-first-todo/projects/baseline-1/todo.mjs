export function initialState() {
  return { todos: [], nextId: 1 };
}

export function transition(state, action) {
  if (action.type === 'add') {
    const title = action.title.trim();
    if (!title || state.nextId === Number.MAX_SAFE_INTEGER) return state;
    return { todos: [...state.todos, { id: state.nextId, title, completed: false }], nextId: state.nextId + 1 };
  }
  if (action.type === 'clearCompleted') {
    return { ...state, todos: state.todos.filter(todo => !todo.completed) };
  }
  const todo = state.todos.find(todo => todo.id === action.id);
  if (!todo) return state;
  if (action.type === 'remove') return { ...state, todos: state.todos.filter(todo => todo.id !== action.id) };
  if (action.type === 'toggle') return { ...state, todos: state.todos.map(item => item.id === action.id ? { ...item, completed: !item.completed } : item) };
  if (action.type === 'edit') {
    const title = action.title.trim();
    if (!title || title === todo.title) return state;
    return { ...state, todos: state.todos.map(item => item.id === action.id ? { ...item, title } : item) };
  }
  return state;
}

export function visibleTodos(state, filter) {
  return state.todos.filter(todo => filter === 'active' ? !todo.completed : filter === 'completed' ? todo.completed : true);
}

export function parseStored(text) {
  try {
    const state = JSON.parse(text);
    if (!state || !Array.isArray(state.todos) || !Number.isSafeInteger(state.nextId) || state.nextId < 1) return initialState();
    const ids = new Set();
    const valid = state.todos.every(todo => {
      if (!todo || !Number.isSafeInteger(todo.id) || todo.id < 1 || todo.id >= state.nextId || ids.has(todo.id) || typeof todo.title !== 'string' || !todo.title || todo.title !== todo.title.trim() || typeof todo.completed !== 'boolean') return false;
      ids.add(todo.id);
      return true;
    });
    return valid ? { todos: state.todos.map(({ id, title, completed }) => ({ id, title, completed })), nextId: state.nextId } : initialState();
  } catch {
    return initialState();
  }
}

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
  switch (action.type) {
    case 'edit': {
      const title = action.title.trim();
      if (!title) return state;
      return { ...state, todos: state.todos.map(item => item.id === action.id ? { ...item, title } : item) };
    }
    case 'toggle':
      return { ...state, todos: state.todos.map(item => item.id === action.id ? { ...item, completed: !item.completed } : item) };
    case 'remove':
      return { ...state, todos: state.todos.filter(item => item.id !== action.id) };
    default:
      return state;
  }
}

export function visibleTodos(state, filter) {
  return state.todos.filter(todo => filter === 'active' ? !todo.completed : filter === 'completed' ? todo.completed : true);
}

export function parseStored(text) {
  try {
    const state = JSON.parse(text);
    if (!state || !Array.isArray(state.todos) || !Number.isSafeInteger(state.nextId) || state.nextId < 1) return initialState();
    const ids = new Set();
    for (const todo of state.todos) {
      if (!todo || !Number.isSafeInteger(todo.id) || todo.id < 1 || todo.id >= state.nextId || ids.has(todo.id) || typeof todo.title !== 'string' || !todo.title || todo.title.trim() !== todo.title || typeof todo.completed !== 'boolean') return initialState();
      ids.add(todo.id);
    }
    return { todos: state.todos.map(({ id, title, completed }) => ({ id, title, completed })), nextId: state.nextId };
  } catch {
    return initialState();
  }
}

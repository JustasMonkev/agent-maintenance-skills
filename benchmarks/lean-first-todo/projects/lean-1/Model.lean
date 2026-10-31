-- Lean 4.35.0. Titles are assumed validated before this identity boundary.
structure Todo where
  id : Nat
  completed : Bool
  deriving Repr, DecidableEq
structure State where
  todos : List Todo
  nextId : Nat
  deriving Repr, DecidableEq
def valid (s : State) : Prop :=
  0 < s.nextId ∧ ∀ t ∈ s.todos, 0 < t.id ∧ t.id < s.nextId
def add (s : State) : State :=
  { todos := s.todos ++ [{ id := s.nextId, completed := false }], nextId := s.nextId + 1 }
def remove (s : State) (id : Nat) : State :=
  { s with todos := s.todos.filter (fun t => t.id != id) }
theorem add_valid (s : State) (h : valid s) : valid (add s) := by
  constructor
  · simp [add]
  · intro t ht
    simp only [add, List.mem_append, List.mem_singleton] at ht
    rcases ht with ht | ht
    · have hp := h.2 t ht
      exact ⟨hp.1, by change t.id < s.nextId + 1; omega⟩
    · subst t
      exact ⟨h.1, by simp [add]⟩
theorem remove_valid (s : State) (id : Nat) (h : valid s) : valid (remove s id) := by
  constructor
  · exact h.1
  · intro t ht
    have hm := (List.mem_filter.mp ht).1
    exact h.2 t hm
theorem delete_then_add_allocates_fresh (s : State) (id : Nat) (h : valid s) :
    ∀ t ∈ s.todos, t.id ≠ (remove s id).nextId := by
  intro t ht
  have hp := h.2 t ht
  change t.id ≠ s.nextId
  omega
#eval add (remove { todos := [{id := 1, completed := false}, {id := 2, completed := true}], nextId := 3 } 2)
example : (add (remove { todos := [{id := 1, completed := false}, {id := 2, completed := true}], nextId := 3 } 2)).todos.map Todo.id = [1, 3] := by decide
-- Reusing list length + 1 after deletion would allocate 2, an old identity.
example : (remove { todos := [{id := 1, completed := false}, {id := 2, completed := true}], nextId := 3 } 2).todos.length + 1 = 2 := by decide

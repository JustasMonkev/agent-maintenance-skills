import Std
structure Todo where
  id : Nat
  completed : Bool := false
  deriving Repr, BEq
structure State where
  todos : List Todo
  nextId : Nat
  deriving Repr
 def remove (s : State) (id : Nat) : State :=
  { s with todos := s.todos.filter (fun t => t.id != id) }
def add (s : State) : State :=
  { todos := s.todos ++ [{ id := s.nextId }], nextId := s.nextId + 1 }
def Valid (s : State) : Prop :=
  0 < s.nextId ∧ ∀ t ∈ s.todos, 0 < t.id ∧ t.id < s.nextId
 theorem add_valid (s : State) (h : Valid s) : Valid (add s) := by
  constructor
  · simp [add]
  · intro t ht
    simp only [add, List.mem_append, List.mem_singleton] at ht
    rcases ht with ht | ht
    · exact ⟨(h.2 t ht).1, Nat.lt_trans (h.2 t ht).2 (Nat.lt_succ_self _)⟩
    · subst t; exact ⟨h.1, Nat.lt_succ_self _⟩
theorem remove_keeps_allocator (s : State) (id : Nat) :
    (remove s id).nextId = s.nextId := rfl
theorem remove_then_add_fresh (s : State) (id : Nat) (h : Valid s) :
    ∀ t ∈ s.todos, t.id ≠ (remove s id).nextId := by
  intro t ht
  exact Nat.ne_of_lt (h.2 t ht).2
-- This counterexample excludes deriving the next identity from remaining length.
#eval (add (remove { todos := [{id := 1}, {id := 2}], nextId := 3 } 1)).todos
example : (add (remove { todos := [{id := 1}, {id := 2}], nextId := 3 } 1)).todos.map Todo.id = [2, 3] := by decide

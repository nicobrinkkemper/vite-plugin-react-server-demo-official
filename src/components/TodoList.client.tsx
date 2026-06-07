"use client";
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { usePersistentState } from '../hooks/usePersistentState.js';

/**
 * Wrap a state update in the View Transitions API so todo adds/removes/edits
 * animate — the new card fades in, a removed card fades out, and the rest glide
 * to their new positions — instead of snapping (which also masks the scrollbar
 * reflow). flushSync applies the update synchronously so the browser can
 * snapshot the resulting DOM. Degrades gracefully: where startViewTransition is
 * unsupported, the update just runs with no animation.
 */
function withViewTransition(update: () => void) {
  const doc =
    typeof document !== 'undefined'
      ? (document as Document & {
          startViewTransition?: (cb: () => void) => unknown;
        })
      : undefined;
  if (doc?.startViewTransition) {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

type Props = {
  initialTodos: Todo[];
  styles: CSSModuleClasses;
  addTodo: (title: string) => Promise<{ success: boolean; id?: number }>;
  toggleTodo: (id: number) => Promise<{ success: boolean }>;
  deleteTodo: (id: number) => Promise<{ success: boolean }>;
  editTodo: (id: number, title: string) => Promise<{ success: boolean }>;
  clearCompletedTodos: () => Promise<{ success: boolean }>;
  getTodos: () => Promise<Todo[]>;
  isGithubPages: boolean;
};

export function TodoList({
  initialTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  getTodos,
  clearCompletedTodos,
  styles,
  isGithubPages
}: Props) {
  // On a static host (no backend) the changes only live in React state, so they
  // would vanish on refresh. usePersistentState mirrors them to localStorage so
  // add/toggle/delete/edit survive a reload. With a backend (NOT isGithubPages)
  // it's disabled and behaves exactly like plain useState — the server actions
  // are the source of truth and localStorage is left untouched.
  const [todos, setTodos] = usePersistentState<Todo[]>('bidoof.todos', initialTodos, isGithubPages);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingCount = todos.filter(todo => !todo.completed).length;

  // On a static host (e.g. GitHub Pages) the SQLite-backed server actions have
  // no server to run on, so each operation runs CLIENT-SIDE only: the UI is
  // fully interactive, the changes just aren't persisted (a refresh resets
  // them). With a backend the real server actions run and persist. Either way
  // the success path below does the same local state update.
  const runAdd = (title: string) =>
    isGithubPages ? Promise.resolve({ success: true, id: Date.now() }) : addTodo(title);
  const runToggle = (id: number) =>
    isGithubPages ? Promise.resolve({ success: true }) : toggleTodo(id);
  const runDelete = (id: number) =>
    isGithubPages ? Promise.resolve({ success: true }) : deleteTodo(id);
  const runEdit = (id: number, title: string) =>
    isGithubPages ? Promise.resolve({ success: true }) : editTodo(id, title);
  const runClear = () =>
    isGithubPages ? Promise.resolve({ success: true }) : clearCompletedTodos();

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await runAdd(newTodo);
      if (result.success && result.id) {
        const newTodoItem: Todo = {
          id: result.id,
          title: newTodo,
          completed: false,
          created_at: new Date().toISOString()
        };
        withViewTransition(() => {
          setTodos([...todos, newTodoItem]);
          setNewTodo('');
        });
        // Refocus on the next frame, once `loading` is back to false and the
        // input is re-enabled, so you can keep adding without re-clicking.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTodo(id: number) {
    setLoading(true);
    setError(null);
    try {
      const result = await runToggle(id);
      if (result.success) {
        withViewTransition(() =>
          setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ))
        );
      }
    } catch (err) {
      setError('Failed to toggle todo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTodo(id: number) {
    setLoading(true);
    setError(null);
    try {
      const result = await runDelete(id);
      if (result.success) {
        withViewTransition(() => setTodos(todos.filter(todo => todo.id !== id)));
      }
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditTodo(id: number) {
    if (!editText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await runEdit(id, editText);
      if (result.success) {
        withViewTransition(() => {
          setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, title: editText } : todo
          ));
          setEditingId(null);
          setEditText('');
        });
      }
    } catch (err) {
      setError('Failed to edit todo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearCompleted() {
    setLoading(true);
    setError(null);
    try {
      const result = await runClear();
      if (result.success) {
        withViewTransition(() => setTodos(todos.filter(todo => !todo.completed)));
      }
    } catch (err) {
      setError('Failed to clear completed todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles["todo-list"]}>
      <h1>Todo List</h1>

      {isGithubPages && (
        <p style={{ fontSize: '0.85em', opacity: 0.75, margin: '0.5em 0' }}>
          💾 No backend — changes are saved in your browser (localStorage), not on a server.
        </p>
      )}

      {error && <div className={styles["error-message"]}>{error}</div>}

      <form onSubmit={handleAddTodo}>
        <input
          ref={inputRef}
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Add
        </button>
      </form>

      <div className={styles["todo-stats"]}>
        <span>{remainingCount === 0 ? '' : `${remainingCount} items left`}</span>
        {todos.some(todo => todo.completed) && (
          <button
            onClick={handleClearCompleted}
            disabled={loading}
            className={styles["clear-completed"]}
          >
            Clear completed
          </button>
        )}
      </div>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.completed ? 'completed' : ''}
            style={{ viewTransitionName: `todo-${todo.id}` }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
              disabled={loading}
            />
            {editingId === todo.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditTodo(todo.id);
                }}
                className={styles["edit-form"]}
              >
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button type="submit" disabled={loading}>Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditText('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span
                  style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                  onDoubleClick={() => {
                    setEditingId(todo.id);
                    setEditText(todo.title);
                  }}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={loading}
                  className={styles["delete-button"]}
                >
                  ×
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

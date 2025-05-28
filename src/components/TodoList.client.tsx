"use client";
import React, { useState } from 'react';
import '../css/todoStyles.css';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

type Props = {
  initialTodos: Todo[];
  addTodo: (title: string) => Promise<{ success: boolean; id?: number }>;
  toggleTodo: (id: number) => Promise<{ success: boolean }>;
  deleteTodo: (id: number) => Promise<{ success: boolean }>;
  editTodo: (id: number, title: string) => Promise<{ success: boolean }>;
  clearCompletedTodos: () => Promise<{ success: boolean }>;
  getTodos: () => Promise<Todo[]>;
};

export function TodoList({ 
  initialTodos, 
  addTodo, 
  toggleTodo, 
  deleteTodo, 
  editTodo,
  getTodos,
  clearCompletedTodos 
}: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingCount = todos.filter(todo => !todo.completed).length;

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await addTodo(newTodo);
      if (result.success && result.id) {
        const newTodoItem: Todo = {
          id: result.id,
          title: newTodo,
          completed: false,
          created_at: new Date().toISOString()
        };
        setTodos([...todos, newTodoItem]);
        setNewTodo('');
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
      const result = await toggleTodo(id);
      if (result.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
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
      const result = await deleteTodo(id);
      if (result.success) {
        setTodos(todos.filter(todo => todo.id !== id));
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
      const result = await editTodo(id, editText);
      if (result.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, title: editText } : todo
        ));
        setEditingId(null);
        setEditText('');
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
      const result = await clearCompletedTodos();
      if (result.success) {
        setTodos(todos.filter(todo => !todo.completed));
      }
    } catch (err) {
      setError('Failed to clear completed todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="todo-list">
      <h1>Todo List</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Add'}
        </button>
      </form>

      <div className="todo-stats">
        <span>{remainingCount} items left</span>
        {todos.some(todo => todo.completed) && (
          <button 
            onClick={handleClearCompleted}
            disabled={loading}
            className="clear-completed"
          >
            Clear completed
          </button>
        )}
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
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
                className="edit-form"
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
                  className="delete-button"
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
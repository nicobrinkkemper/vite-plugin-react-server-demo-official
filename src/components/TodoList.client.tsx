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
  addTodo: (title: string) => Promise<{ success: boolean }>;
};

export function TodoList({ initialTodos, addTodo }: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await addTodo(newTodo);
    setNewTodo('');
  }

  return (
    <div className="todo-list">
      <h1>Todo List</h1>
      
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit" onClick={handleAddTodo}>Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 
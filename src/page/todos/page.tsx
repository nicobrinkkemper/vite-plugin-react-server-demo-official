import React from 'react';
import { TodoList } from '../../components/TodoList.client.js';
import type { Props } from './props.js';

export async function Page({
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  clearCompletedTodos,
  getTodos,
  initialTodos,
}: Props) {
  console.log("initialTodos", initialTodos);
  return (
    <div>
      <TodoList 
        initialTodos={initialTodos}
        addTodo={addTodo}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodo={editTodo}
        clearCompletedTodos={clearCompletedTodos}
      />
    </div>
  );
} 
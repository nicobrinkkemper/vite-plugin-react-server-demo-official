import React from "react";
import { TodoList } from "../../components/TodoList.client.js";
import type { Props } from "./props.js";
import styles from "../../css/todoStyles.module.css";

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
        getTodos={getTodos}
        styles={styles}
      />
    </div>
  );
}

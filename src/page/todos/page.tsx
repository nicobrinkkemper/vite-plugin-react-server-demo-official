import React from "react";
import { TodoList } from "../../components/TodoList.client.js";
import type { Props } from "./props.js";
import styles from "../../css/todoStyles.module.css";
import { Link } from "../../components/Link.client.js";


export async function Page({
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  clearCompletedTodos,
  getTodos,
  initialTodos,
  isGithubPages
}: Props) {
  return (
    <div className={styles["TodoList"]}>
      <Link to="/" className={styles["Link"]}> back </Link>
      <TodoList
        initialTodos={initialTodos}
        addTodo={addTodo}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodo={editTodo}
        clearCompletedTodos={clearCompletedTodos}
        getTodos={getTodos}
        styles={styles}
        isGithubPages={isGithubPages}
      />
    </div>
  );
}

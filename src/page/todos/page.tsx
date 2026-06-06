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
  // The Todo UI renders on every build, including the static GitHub Pages one
  // — the static-host freeze (vprs 2.0.6, the headless-.rsc fix) is gone.
  // Server actions (add/toggle/delete) are backed by SQLite and can't run on a
  // static host, so TodoList shows a graceful "needs a database" message on
  // those (it receives `isGithubPages` for exactly that).
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

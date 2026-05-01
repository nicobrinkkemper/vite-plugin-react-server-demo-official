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
  if (isGithubPages) {
    return (
      <div className={styles["TodoList"]}>
        <Link to="/" className={styles["Link"]}> back </Link>
        <h1>Todo List</h1>
        <p>
          The todo demo is disabled on the GitHub Pages build because it relies
          on server actions backed by a SQLite database, which a static host
          can't run.
        </p>
        <p>To try it locally:</p>
        <ol>
          <li>
            Clone{" "}
            <a href="https://github.com/nicobrinkkemper/vite-plugin-react-server-demo-official">
              the demo repo
            </a>
          </li>
          <li><code>npm install</code></li>
          <li>
            <code>npm run dev:rsc</code> (server-first) or{" "}
            <code>npm run dev:ssr</code> (client-first)
          </li>
        </ol>
      </div>
    );
  }
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

"use server";
import { db } from "../db.server.js";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

type SQLiteTodo = {
  id: number;
  title: string;
  completed: number;
  created_at: string;
};
// Server action to fetch todos
export async function getTodos(): Promise<Todo[]> {
  const stmt = db.prepare("SELECT * FROM todos ORDER BY created_at DESC");
  const results = stmt.all() as unknown as SQLiteTodo[];
  return results.map(todo => ({
    ...todo,
    completed: Boolean(todo.completed)
  }));
}

console.log('test')
// Server action to add a todo
export async function addTodo(title: string): Promise<{ success: boolean; id?: number }> {
  try {
    console.log("addTodo", title);
    const stmt = db.prepare("INSERT INTO todos (title) VALUES (?) RETURNING id");
    const result = stmt.get(title) as { id: number } | undefined;
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Error adding todo:", error);
    return { success: false };
  }
}

// Server action to toggle todo completion status
export async function toggleTodo(id: number): Promise<{ success: boolean }> {
  try {
    console.log("toggleTodo", id);
    const stmt = db.prepare("UPDATE todos SET completed = NOT completed WHERE id = ?");
    stmt.run(id);
    return { success: true };
  } catch (error) {
    console.error("Error toggling todo:", error);
    return { success: false };
  }
}

// Server action to delete a todo
export async function deleteTodo(id: number): Promise<{ success: boolean }> {
  try {
    console.log("deleteTodo", id);
    const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
    stmt.run(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return { success: false };
  }
}

// Server action to edit a todo
export async function editTodo(id: number, title: string): Promise<{ success: boolean }> {
  try {
    console.log("editTodo", id, title);
    const stmt = db.prepare("UPDATE todos SET title = ? WHERE id = ?");
    stmt.run(title, id);
    return { success: true };
  } catch (error) {
    console.error("Error editing todo:", error);
    return { success: false };
  }
}

// Server action to clear completed todos
export async function clearCompletedTodos(): Promise<{ success: boolean }> {
  try {
    console.log("clearCompletedTodos");
    const stmt = db.prepare("DELETE FROM todos WHERE completed = 1");
    stmt.run();
    return { success: true };
  } catch (error) {
    console.error("Error clearing completed todos:", error);
    return { success: false };
  }
}

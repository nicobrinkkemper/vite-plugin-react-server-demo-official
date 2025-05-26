"use server";
import { db } from "../db.server.js";

// Server action to add a todo
export async function addTodo(title: string): Promise<{ success: boolean }> {
  console.log("addTodo", title);
  const stmt = db.prepare("INSERT INTO todos (title) VALUES (?)");
  stmt.run(title);
  return { success: true };
}

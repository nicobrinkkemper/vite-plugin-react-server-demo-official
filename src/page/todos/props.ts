import { addTodo, toggleTodo, deleteTodo, editTodo, clearCompletedTodos, getTodos } from '../../server/actions/todoActions.server.js';

export const props = async () => {
  let initialTodos = await getTodos();
  const isGithubPages = process.env.VITE_GITHUB_PAGES === 'true';
  // set some todo if there are no todos
  if (initialTodos.length === 0) {
    await addTodo('Clone the repo');
    await addTodo('npm install');
    await addTodo('npm run dev');
    initialTodos = await getTodos();
  }
  return {
    title: "Todos",
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompletedTodos,
    getTodos,
    initialTodos,
    isGithubPages
  };
};

export type Props = Awaited<ReturnType<typeof props>>;
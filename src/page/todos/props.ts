import { addTodo, toggleTodo, deleteTodo, editTodo, clearCompletedTodos, getTodos } from '../../server/actions/todoActions.server.js';

export const props = async () => {
  const isGithubPages = process.env.GITHUB_PAGES === 'true';
  if (isGithubPages) {
    return {
      title: "Todos",
      addTodo,
      toggleTodo,
      deleteTodo,
      editTodo,
      clearCompletedTodos,
      getTodos,
      initialTodos: [],
      isGithubPages,
    };
  }
  let initialTodos = await getTodos();
  // set some todo if there are no todos
  if (initialTodos.length === 0) {
    await addTodo('Clone the repo');
    await addTodo('npm install');
    await addTodo('run `npm run dev:rsc` for server-first workflow');
    await addTodo('or `npm run dev:ssr` for client-first workflow');
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
    isGithubPages,
  };
};

export type Props = Awaited<ReturnType<typeof props>>;
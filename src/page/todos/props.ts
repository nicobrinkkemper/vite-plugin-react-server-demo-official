import { addTodo, toggleTodo, deleteTodo, editTodo, clearCompletedTodos, getTodos } from '../../server/actions/todoActions.server.js';

export const props = async () => {
  const initialTodos = await getTodos();
  
  return {
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompletedTodos,
    getTodos,
    initialTodos
  };
};

export type Props = Awaited<ReturnType<typeof props>>;
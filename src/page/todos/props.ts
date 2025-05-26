import { addTodo,  } from '../../server/actions/todoActions.server.js';


export const props = async () => {
  return {
    addTodo: addTodo,
  };
};

export type Props = Awaited<ReturnType<typeof props>>;
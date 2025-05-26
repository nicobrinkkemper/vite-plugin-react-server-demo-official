import React from 'react';
import { TodoList } from '../../components/TodoList.client.js';
import type { Props } from './props.js';


export function Page({ addTodo }: Props) {
  return (
    <div>
      <TodoList 
        initialTodos={[]}
        addTodo={addTodo}
      />
    </div>
  );
} 
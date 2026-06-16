"use client";

import React, { useState } from "react";
// Server Functions pattern: a client component imports a "use server" action
// DIRECTLY (not via props) and calls it. vprs rewrites this import into a
// createServerReference proxy that POSTs to the server — so the body never
// ships to the browser and the call round-trips. This is the client-import
// half of Next.js parity (the prop-passing half is the TodoList above).
import { getTodos } from "../server/actions/todoActions.server.js";

export function ServerFnProbe() {
  const [count, setCount] = useState<number | null>(null);
  return (
    <button
      type="button"
      data-testid="server-fn-probe"
      onClick={async () => {
        const todos = await getTodos();
        setCount(todos.length);
      }}
    >
      {count === null ? "Probe server fn" : `server says: ${count} todos`}
    </button>
  );
}

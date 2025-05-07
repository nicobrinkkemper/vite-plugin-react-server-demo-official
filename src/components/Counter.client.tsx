"use client";
import * as React from "react";

export function Counter() {
  const [count, setCount] = React.useState<number>();
  return (
    <div>
      <button onClick={() => setCount((count ?? 0) + 1)}>Click me</button>
      <p>Count: {count ?? 0}</p>
    </div>
  );
}

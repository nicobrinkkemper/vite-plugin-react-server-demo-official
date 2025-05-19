"use client";
import React from "react";

export function Counter() {
  const [count, setCount] = React.useState<number>();
  return (
    <button onClick={() => setCount((count ?? 0) + 1)}>
      Click count: {count ?? 0}
    </button>
  );
}

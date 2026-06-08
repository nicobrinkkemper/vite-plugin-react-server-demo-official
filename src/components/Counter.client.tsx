"use client";
import React from "react";
import styles from "../css/counterStyles.module.css";

export function Counter() {
  const [count, setCount] = React.useState<number>();
  return (
    <button className={styles["Counter"]} onClick={() => setCount((count ?? 0) + 1)}>
      Click count: {count ?? 0}
    </button>
  );
}

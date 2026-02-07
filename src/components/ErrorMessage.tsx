import React from "react";
import styles from "../css/errorBoundary.module.css";
const stackLineLinkPattern = /(https?:\/\/[^\s)]+|file:\/\/[^\s)]+)/g;
function linkifyStack(stack: string) {
  return stack.split("\n").map((line, lineIndex, lines) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = new RegExp(stackLineLinkPattern);
    for (const match of line.matchAll(regex)) {
      const start = match.index ?? 0;
      if (start > lastIndex) {
        parts.push(line.slice(lastIndex, start));
      }
      const url = match[0];
      parts.push(
        <a key={`stack-link-${lineIndex}-${start}`} href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      );
      lastIndex = start + url.length;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
    const lineBreak = lineIndex < lines.length - 1 ? "\n" : "";
    return (
      <span key={`stack-line-${lineIndex}`}>
        {parts}
        {lineBreak}
      </span>
    );
  });
}
export function ErrorMessage({ error }: { error: { message: string, stack?: string } }) {
  return (
    <div className={styles["ErrorMessage"]}>
      <h1>An Error Occurred!</h1>
      <p>If you're at the /error-example page, this is expected.</p>
      <p>Message: "{error.message}"</p>
      {error.stack && <pre className={styles["ErrorStack"]}>{linkifyStack(error.stack)}</pre>}
    </div>
  );
}

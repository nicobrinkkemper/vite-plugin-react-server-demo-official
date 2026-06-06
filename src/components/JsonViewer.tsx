import * as React from "react";
import styles from "../css/jsonViewer.module.css";

interface JsonViewerProps {
  /** HTTP method label shown in the request bar. */
  method?: string;
  /** Request URL shown in the header. */
  endpoint: string;
  /** JSON payload to render. */
  data: unknown;
}

interface JsonNodeProps {
  value: unknown;
  depth: number;
}

/**
 * Renders a single JSON value with syntax highlighting for prerendered output.
 */
function JsonNode({ value, depth }: JsonNodeProps) {
  const pad = "  ".repeat(depth);

  if (value === null) {
    return <span className={styles["Null"]}>null</span>;
  }

  if (typeof value === "boolean") {
    return <span className={styles["Boolean"]}>{String(value)}</span>;
  }

  if (typeof value === "number") {
    return <span className={styles["Number"]}>{String(value)}</span>;
  }

  if (typeof value === "string") {
    return <span className={styles["String"]}>{JSON.stringify(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className={styles["Punctuation"]}>[]</span>;
    }

    return (
      <>
        <span className={styles["Punctuation"]}>[</span>
        {value.map((item, index) => (
          <React.Fragment key={index}>
            {"\n"}
            {"  ".repeat(depth + 1)}
            <JsonNode value={item} depth={depth + 1} />
            {index < value.length - 1 ? (
              <span className={styles["Punctuation"]}>,</span>
            ) : null}
          </React.Fragment>
        ))}
        {"\n"}
        {pad}
        <span className={styles["Punctuation"]}>]</span>
      </>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return <span className={styles["Punctuation"]}>{"{}"}</span>;
    }

    return (
      <>
        <span className={styles["Punctuation"]}>{"{"}</span>
        {entries.map(([key, entryValue], index) => (
          <React.Fragment key={key}>
            {"\n"}
            {"  ".repeat(depth + 1)}
            <span className={styles["Key"]}>{JSON.stringify(key)}</span>
            <span className={styles["Punctuation"]}>: </span>
            <JsonNode value={entryValue} depth={depth + 1} />
            {index < entries.length - 1 ? (
              <span className={styles["Punctuation"]}>,</span>
            ) : null}
          </React.Fragment>
        ))}
        {"\n"}
        {pad}
        <span className={styles["Punctuation"]}>{"}"}</span>
      </>
    );
  }

  return <span className={styles["String"]}>{JSON.stringify(value)}</span>;
}

/**
 * Server-rendered JSON viewer with a request header and syntax-highlighted body.
 */
export function JsonViewer({ method = "GET", endpoint, data }: JsonViewerProps) {
  return (
    <section className={styles["Viewer"]} aria-label="API response">
      <header className={styles["Header"]}>
        <span className={styles["Method"]}>{method}</span>
        <code className={styles["Endpoint"]}>{endpoint}</code>
      </header>
      <pre className={styles["Pre"]}>
        <code className={styles["Code"]}>
          <JsonNode value={data} depth={0} />
        </code>
      </pre>
    </section>
  );
}

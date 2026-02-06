import * as React from "react";
import { ErrorBoundary } from "../../components/ErrorBoundary.client.js";
import { Link } from "../../components/Link.client.js";
import type { Props } from "./props.js";
import styles from "../../css/errorExample.module.css";
function TestError({ throwError }: { throwError: boolean }) {
  if (throwError) {
    throw new Error("test error example");
  }
  return null;
}

export const Page = (props: Props) => {
  return (
    <>
      <title>{props.title}</title>
      <div className={styles["ErrorExample"]}>
        <Link to={props.navigation.back.href} className={styles["Link"]}>
          {props.navigation.back.text}
        </Link>
          <ErrorBoundary>
            <p>This page rendered without errors.</p>
            <TestError throwError={props.throwError} />
          </ErrorBoundary>
      </div>
    </>
  );
};

import * as React from "react";
import { ErrorBoundary } from "../../components/ErrorBoundary.client.js";
import { Link } from "../../components/Link.client.js";
import type { Props } from "./props.js";

function TestError({ throwError }: { throwError: boolean }) {
  if (throwError) {
    throw new Error("test");
  }
  return null;
}

export const Page = (props: Props) => {
  return (
    <>
      <title>{props.title}</title>
      <div>
        <Link to={props.navigation.back.href}>{props.navigation.back.text}</Link>
        <ErrorBoundary>
          <p>This page rendered without errors.</p>
          <TestError throwError={props.throwError} />
        </ErrorBoundary>
      </div>
    </>
  );
};

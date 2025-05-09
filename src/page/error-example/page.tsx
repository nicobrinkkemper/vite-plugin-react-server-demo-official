import * as React from "react";
import { ErrorBoundary } from "../../components/ErrorBoundary.client.js";
import { Link } from "../../components/Link.client.js";
function TestError({ throwError }: { throwError: boolean }) {
  if (throwError) {
    throw new Error("test");
  }
  return null;
}

export const Page = (props: { throwError: boolean, nodeEnv: string }) => {
  return (
    <>
      <title>Error Example for node env: {props.nodeEnv}</title>
      <div>
        <Link to="/">Go back</Link>
        <ErrorBoundary>
         This page rendered without errors.
          <TestError throwError={props.throwError} />
        </ErrorBoundary>
      </div>
    </>
  );
};

import type { ReactNode } from "react";
// @ts-ignore
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
import { callServer } from "./callServer.js";

export function createReactFetcher({
  url = window.location.pathname,
  moduleBaseURL = "",
  headers = { Accept: "text/x-component" },
}: {
  url?: string;
  moduleBaseURL?: string;
  headers?: HeadersInit;
} = {}): Promise<ReactNode> {
  if (url.includes("vite-plugin-react-server-demo-official")) {
    moduleBaseURL = "https://nicobrinkkemper.github.io/vite-plugin-react-server-demo-official/";
  }
  return ReactDOMESM.createFromFetch(
    fetch(url, {
      headers: { Accept: "text/x-component" },
    }),
    {
      callServer: callServer,
      moduleBaseURL: moduleBaseURL,
    }
  ) as Promise<ReactNode>;
}

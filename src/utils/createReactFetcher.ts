import type { ReactNode } from "react";
// @ts-ignore
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
import { callServer } from "./callServer.js";

export function createReactFetcher({
  url = window.location.pathname,
  moduleBaseURL = new URL(import.meta.env.BASE_URL, window.location.host).toString().slice(0, -1),
  headers = { Accept: "text/x-component" },
}: {
  url?: string;
  moduleBaseURL?: string;
  headers?: HeadersInit;
} = {}): Promise<ReactNode> {
  return ReactDOMESM.createFromFetch(
    fetch(url, {
      headers: headers,
    }),
    {
      callServer: callServer,
      moduleBaseURL: moduleBaseURL,
    }
  ) as Promise<ReactNode>;
}

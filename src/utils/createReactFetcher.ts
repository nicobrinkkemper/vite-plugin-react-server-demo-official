import type { ReactNode } from "react";
// @ts-ignore
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
import { callServer } from "./callServer.js";

export function createReactFetcher({
  url = window.location.pathname,
  moduleBaseURL = import.meta.env.BASE_URL,
  headers = { 
    Accept: "text/x-component"
  },
}: {
  url?: string;
  moduleBaseURL?: string;
  headers?: HeadersInit;
} = {}): Promise<ReactNode> {
  if(moduleBaseURL !== '/' && moduleBaseURL.endsWith("/")) {
    moduleBaseURL = moduleBaseURL.slice(0, -1)
  }
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

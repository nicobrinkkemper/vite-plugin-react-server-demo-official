// @ts-nocheck
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
  
  type ServerResponse = { returnValue: unknown };
  

  export const callServer = async (
    id: string,
    args: unknown[]
  ): Promise<unknown> => {
    console.log("Fetching", id);
    const baseURL = new URL(import.meta.env.BASE_URL, window.location.host).toString().slice(0, -1)
    const response = await ReactDOMESM.createFromFetch(
      fetch(baseURL, {
        method: "POST",
        body: await ReactDOMESM.encodeReply(args),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      { callServer, moduleBaseURL: baseURL }
    );
    const returnValue = (response as ServerResponse).returnValue;
    return returnValue;
  };
  
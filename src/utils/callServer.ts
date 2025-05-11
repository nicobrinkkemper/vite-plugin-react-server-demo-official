// @ts-nocheck
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
  
  type ServerResponse = { returnValue: unknown };
  

  export const callServer = async (
    id: string,
    args: unknown[]
  ): Promise<unknown> => {
    console.log("Fetching", id);
    const response = await ReactDOMESM.createFromFetch(
      fetch(import.meta.env.BASE_URL, {
        method: "POST",
        body: await ReactDOMESM.encodeReply(args),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      { callServer, moduleBaseURL: import.meta.env.BASE_URL }
    );
    const returnValue = (response as ServerResponse).returnValue;
    return returnValue;
  };
  
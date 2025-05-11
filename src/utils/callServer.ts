// @ts-nocheck
import * as ReactDOMESM from "react-server-dom-esm/client.browser";
  
  type ServerResponse = { returnValue: unknown };
  

  export const callServer = async (
    id: string,
    args: unknown[]
  ): Promise<unknown> => {
    console.log("Fetching", id);
    let baseURL = import.meta.env.BASE_URL
    if(baseURL !== '/' && baseURL.endsWith("/")) {
      baseURL = baseURL.slice(0, -1)
    }
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
  
export const props = ()=>{
  return {
    // see `npm run debug-build` to trigger the error during build
    throwError: Boolean(import.meta.env.DEV),
    title: "Error Example for node env: " + process.env.NODE_ENV,
    navigation: {
      back: {
        href: `${import.meta.env.BASE_URL === "" ? "/" : import.meta.env.BASE_URL}`,
        text: "Back"
      }
    }
  };
};
export type Props = ReturnType<typeof props>;
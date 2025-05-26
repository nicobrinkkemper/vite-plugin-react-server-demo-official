export const props = ()=>{
  return {
    // see `npm run debug-build` to trigger the error during build
    throwError: false, // process.env['NODE_ENV'] !== 'production',
    title: "Error Example for node env: " + process.env['NODE_ENV'],
    navigation: {
      back: {
        href: `${process.env.VITE_BASE_URL === "" ? "/" : process.env.VITE_BASE_URL}`,
        text: "Back"
      }
    }
  };
};
export type Props = ReturnType<typeof props>;
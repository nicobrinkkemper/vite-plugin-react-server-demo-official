export const props = ()=>{
  return {
    // see `npm run debug-build` to trigger the error during build
    throwError: process.env['NODE_ENV'] !== 'production',
    title: "Error Example for node env: " + process.env['NODE_ENV'],
  };
};

export const props = ()=>{
  return {
    throwError: process.env['NODE_ENV'] !== 'production',
  };
};

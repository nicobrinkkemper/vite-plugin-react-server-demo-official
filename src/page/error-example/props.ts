declare global {
  interface ImportMeta {
    env: {
      VITE_DEV: boolean;
      NODE_ENV: string;
      VITE_BASE_URL: string;
    };
  }
}

export const props = () => {
  return {
    // see `npm run debug-build` to trigger the error during build
    throwError: Boolean(import.meta.env["DEV"]),
    title: "Error Example for node env: " + import.meta.env["NODE_ENV"],
    navigation: {
      back: {
        href: `${import.meta.env.VITE_BASE_URL === "" ? "/" : import.meta.env.VITE_BASE_URL}`,
        text: "Back",
      },
    },
  };
};
export type Props = ReturnType<typeof props>;

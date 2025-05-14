export const props = (url: string) => {
  let pathname = process.env.VITE_BASE_URL?.includes("//")
    ? new URL(process.env.VITE_BASE_URL).pathname
    : process.env.VITE_BASE_URL || "";
  if (!pathname.endsWith("/")) pathname += "/";
  const bidoofURL = pathname + "bidoof/";
  const errorExampleURL = pathname + "error-example/";
  return {
    url,
    title: "Home",
    description: "Home page",
    navigation: {
      toBidoof: {
        href: bidoofURL,
        text: "Bidoof",
      },
      toErrorExample: {
        href: errorExampleURL,
        text: "Error Example",
      },
    },
  };
};
export type Props = ReturnType<typeof props>;

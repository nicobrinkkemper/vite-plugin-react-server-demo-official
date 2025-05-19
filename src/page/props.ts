export const props = (url: string) => {
  let pathname = process.env.VITE_PUBLIC_ORIGIN?.includes("//")
    ? new URL(process.env.VITE_BASE_URL ?? "/", process.env.VITE_PUBLIC_ORIGIN)
        .pathname
    : process.env.VITE_PUBLIC_ORIGIN || "";
  if (!pathname.endsWith("/")) pathname += "/";
  const bidoofURL = pathname + "bidoof/";
  const errorExampleURL = pathname + "error-example/";
  return {
    url,
    title: "vite-plugin-react-server demo",
    description: "Home page",
    baseUrl: import.meta.env.BASE_URL,
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

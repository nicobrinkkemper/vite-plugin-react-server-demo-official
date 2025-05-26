export const props = (url: string) => {
  let pathname = process.env.VITE_PUBLIC_ORIGIN?.includes("//")
    ? new URL(import.meta.env.BASE_URL, import.meta.env.PUBLIC_ORIGIN).pathname
    : import.meta.env.VITE_PUBLIC_ORIGIN + import.meta.env.BASE_URL;
  if (!pathname.endsWith("/")) pathname += "/";
  const bidoofURL = pathname + "bidoof/";
  const errorExampleURL = pathname + "error-example/";
  const todosURL = pathname + "todos/";
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
      toTodos: {
        href: todosURL,
        text: "Todos",
      },
    },
  };
};
export type Props = ReturnType<typeof props>;

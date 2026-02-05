export const props = (url: string) => {
  const origin = import.meta.env.VITE_PUBLIC_ORIGIN ?? "";
  const base = import.meta.env.BASE_URL ?? "/";
  let pathname = origin.includes("//")
    ? new URL(base, origin).pathname
    : origin + base;
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

export const props = (url: string) => {
  // Baked by vprs from the plugin's `publicOrigin` option ("" when unset).
  const origin = import.meta.env.PUBLIC_ORIGIN ?? "";
  const base = import.meta.env.BASE_URL ?? "/";
  let pathname = origin.includes("//")
    ? new URL(base, origin).pathname
    : origin + base;
  if (!pathname.endsWith("/")) pathname += "/";
  const bidoofURL = pathname + "bidoof/";
  const errorExampleURL = pathname + "error-example/";
  const todosURL = pathname + "todos/";
  const isGithubPages = process.env.GITHUB_PAGES === "true";
  return {
    url,
    title: "vite-plugin-react-server demo",
    description: "Home page",
    baseUrl: import.meta.env.BASE_URL,
    isGithubPages,
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

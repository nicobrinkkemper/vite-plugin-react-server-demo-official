import { fallbackData, type FallbackData } from "./fallbackData.js";

export const props = async () => {
  const baseProps = {
    title: "Bidoof",
    description: "It's bidoof.",
    navigation: {
      back: {
        href: `${import.meta.env.BASE_URL === "" ? "/" : import.meta.env.BASE_URL}`,
        text: "Back",
      },
    },
  } as const
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch("https://pokeapi.co/api/v2/pokemon-form/399/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch Bidoof: ${res.status}`);
    }
    const body = await res.json();
    return {
      ...baseProps,
      ...(body as FallbackData),
    };
  } catch (error) {
    // Fallback data
    return {
      ...baseProps,
      ...fallbackData,
    };
  }
};
export type Props = Awaited<ReturnType<typeof props>>;

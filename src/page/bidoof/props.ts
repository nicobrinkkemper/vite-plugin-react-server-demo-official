import { fallbackData, type FallbackData } from "./fallbackData.js";

export const props = async () => {
  const baseProps = {
    title: "Bidoof",
    description: "It's bidoof.",
    favicon: `${import.meta.env.PUBLIC_ORIGIN}${import.meta.env.BASE_URL}bidoof.png`,
    bidoofEndpoint: "https://pokeapi.co/api/v2/pokemon-form/399/",
    pokemonEndpoint: "https://pokeapi.co/api/v2/pokemon/399/",
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

    const [formRes, pokemonRes] = await Promise.all([
      fetch(baseProps.bidoofEndpoint, { signal: controller.signal }),
      fetch(baseProps.pokemonEndpoint, { signal: controller.signal }),
    ]);
    clearTimeout(timeoutId);

    if (!formRes.ok) {
      throw new Error(`Failed to fetch Bidoof: ${formRes.status}`);
    }
    const body = await formRes.json();
    const pokemon = pokemonRes.ok ? await pokemonRes.json() : null;
    const bdspSprite =
      pokemon?.sprites?.versions?.["generation-viii"]?.[
        "brilliant-diamond-shining-pearl"
      ]?.front_default ?? null;

    return {
      ...baseProps,
      ...(body as FallbackData),
      bdspSprite,
    };
  } catch (error) {
    // Fallback data
    return {
      ...baseProps,
      ...fallbackData,
      bdspSprite: fallbackData.bdspSprite,
    };
  }
};
export type Props = Awaited<ReturnType<typeof props>>;

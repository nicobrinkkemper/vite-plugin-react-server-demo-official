// PokéAPI route names: lowercase, punctuation dropped, spaces hyphenated
// ("Mr. Mime" → "mr-mime", "Farfetch'd" → "farfetchd"). Kept apart from
// lib/pokedex.ts so client components can slug without pulling the dataset
// into the browser bundle.
export const toSlug = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/\s+/g, "-");

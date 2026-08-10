// Sprite URLs are addressed by id. Kept apart from lib/pokedex.ts so client
// components can build them without pulling the dataset into the browser
// bundle.
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const sprite = (id: number) => `${SPRITES}/${id}.png`;
export const spriteBack = (id: number) => `${SPRITES}/back/${id}.png`;
export const artwork = (id: number) =>
  `${SPRITES}/other/official-artwork/${id}.png`;

// Sprite URLs are addressed by id. Kept apart from lib/pokedex.ts so client
// components can build them without pulling the dataset into the browser
// bundle.
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const artwork = (id: number) =>
  `${SPRITES}/other/official-artwork/${id}.png`;
// Alternate forms (ids >= 10000) have no default sprite in the PokeAPI
// repo — only official artwork exists for them (default 10158 is a 404,
// official-artwork/10158 is not). Base species keep the small default
// sprite so grids stay light.
export const sprite = (id: number) =>
  id >= 10000 ? artwork(id) : `${SPRITES}/${id}.png`;
export const spriteBack = (id: number) => `${SPRITES}/back/${id}.png`;

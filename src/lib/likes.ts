// The ceiling on stored likes per Pokémon. Likes are anonymous, so nothing
// stops a visitor from manufacturing them; the cap bounds what that can cost
// (rows in the store, and the count is a rough signal past it anyway). The
// store refuses inserts at the cap and the button shows "999+".
export const MAX_LIKES = 999;

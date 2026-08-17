"use client";
// Boundary re-export, not a wrapper: Link's pending state (data-pending /
// aria-busy) comes from the router itself. The directive is load-bearing —
// server pages importing the router/client barrel directly would statically
// bake it (CJS flight client included) into dist/server-edge, whose
// createRequire interop import of node:module fails Workers validation.
export { Link } from "vite-plugin-react-server/router/client";

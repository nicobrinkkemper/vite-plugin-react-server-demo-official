// Production server entry. Side-effect import only: starts the single-isolate
// server. Do NOT re-export the "use server" action modules here — they import
// the react-server transport at load, which would assert the `react-server`
// condition and crash this no-`--conditions` process before the server starts.
// The actions are dispatched at request time through the baked gate in
// dist/server-edge/render.js (see start.tsx), which holds its own server React.
import "./start.js";

import React from "react";

/**
 * A drop-in replacement for `useState` that, when `enabled`, mirrors the value
 * to `localStorage` and rehydrates from it. Think of it as a tiny Apollo-style
 * local cache fallback — no dependency, no backend required.
 *
 * HYDRATION SAFETY: this hook is used inside a "use client" component that is
 * rendered from an SSG'd / streamed RSC tree. The first client render MUST
 * match the server render, which used `initial`. So we deliberately DO NOT read
 * `localStorage` in the `useState` initializer — doing so would make the first
 * client render differ from the server HTML and trigger a React hydration
 * mismatch (#418 / "did not match"). Instead we:
 *   1. Initialize state to `initial` (identical to the server render).
 *   2. After mount, in an effect, read `localStorage` and `setState` if a
 *      stored value exists (this runs only on the client, after hydration).
 *   3. In another effect, write to `localStorage` whenever the value changes.
 *
 * When `enabled` is false this behaves exactly like plain `useState`:
 * `localStorage` is never read or written.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  enabled: boolean
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initial);

  // Track whether we've already rehydrated so the write effect doesn't fire
  // with `initial` before we've had a chance to read the stored value.
  const hydratedRef = React.useRef(false);

  // Step 2: rehydrate from localStorage after mount (client-only, post-hydration).
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Corrupt/unreadable storage — fall back to `initial`, already in state.
    } finally {
      hydratedRef.current = true;
    }
    // Only rehydrate once, keyed by storage key / enabled flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  // Step 3: persist on change.
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    // Wait until the initial rehydration pass has run so we don't clobber a
    // stored value with `initial` on the very first commit.
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full / unavailable — ignore, the UI still works in-memory.
    }
  }, [key, enabled, value]);

  return [value, setValue];
}

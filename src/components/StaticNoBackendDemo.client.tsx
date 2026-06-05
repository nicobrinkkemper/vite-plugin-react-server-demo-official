"use client";
import React, { useActionState, useState } from "react";

type FormAct = (fd: FormData) => Promise<void>;
type StateAct = (
  prev: unknown,
  fd: FormData
) => Promise<{ ok: boolean; value: string }>;

// A local CLIENT action (not a server reference) for the control variant.
async function clientStateAction(_prev: unknown, fd: FormData) {
  return { ok: true, value: String(fd.get("t") ?? "") };
}

// Bisection harness for the static/no-backend wedge. Variant chosen by ?v= :
//   control     - controlled input only, no form/action
//   form-server - <form action={SERVER formAction}> + controlled input
//   hook-client - useActionState(CLIENT action) + <form action={dispatch}>
//   hook-server - useActionState(SERVER stateAction) + <form action={dispatch}>  (default)
//
// Finding so far: in a production STATIC build served with no backend, the page
// hydrates and is responsive, but the FIRST client state update (typing one
// char -> setState) wedges the renderer in a tight, error-free, non-yielding
// loop — across ALL variants, including `control`. So the trigger is the first
// re-render of a statically-built RSC tree, not the server action itself.
export function StaticNoBackendDemo({
  formAction,
  stateAction,
}: {
  formAction: FormAct;
  stateAction: StateAct;
}) {
  const v =
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("v")) ||
    "hook-server";
  return (
    <div>
      <p>
        variant: <strong id="variant">{v}</strong>
      </p>
      {v === "control" ? (
        <ControlOnly />
      ) : v === "form-server" ? (
        <FormServer formAction={formAction} />
      ) : v === "hook-client" ? (
        <Hook action={clientStateAction} />
      ) : (
        <Hook action={stateAction} />
      )}
    </div>
  );
}

function Field() {
  const [text, setText] = useState("");
  return (
    <input
      id="t"
      name="t"
      value={text}
      onChange={(e) => {
        (window as any).__changes = ((window as any).__changes || 0) + 1;
        setText(e.target.value);
      }}
      placeholder="type here"
    />
  );
}

function ControlOnly() {
  return (
    <div>
      <Field />
    </div>
  );
}

function FormServer({ formAction }: { formAction: FormAct }) {
  return (
    <form action={formAction}>
      <Field />
      <button type="submit">go</button>
    </form>
  );
}

function Hook({ action }: { action: StateAct }) {
  const [state, dispatch, pending] = useActionState(action, null);
  return (
    <form action={dispatch}>
      <Field />
      <button type="submit" disabled={pending}>
        go
      </button>
      <pre id="state">{JSON.stringify(state)}</pre>
    </form>
  );
}

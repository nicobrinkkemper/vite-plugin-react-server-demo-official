import { formAction, stateAction } from "../../server/actions/repro.server.js";

export const props = async () => ({
  title: "Freeze repro",
  formAction,
  stateAction,
});

export type Props = Awaited<ReturnType<typeof props>>;

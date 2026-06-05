import React from "react";
import { StaticNoBackendDemo } from "../../components/StaticNoBackendDemo.client.js";
import type { Props } from "./props.js";

export const Page = ({ title, formAction, stateAction }: Props) => (
  <>
    <title>{title}</title>
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{title}</h1>
      <p>Static host, no backend. Type into the field. ?v=control|form-server|hook-client|hook-server</p>
      <StaticNoBackendDemo formAction={formAction} stateAction={stateAction} />
    </div>
  </>
);

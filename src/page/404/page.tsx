import React from "react";
import styles from "../../css/404.module.css";
import type { Props } from "./props.js";
import { Link } from "../../components/Link.client.js";

export const Page = ({ title, navigation }: Props) => {
  return (
    <>
      <title>{title}</title>
    <div className={styles["NotFound"]}>
        <h1>{title}</h1>
        <p>The page you are looking for does not exist. If you were hunting a special form (a Mega, a regional variant), this deploy may be static-only — clone the repo and run <code>npm run demo</code> for the per-request path.</p>
        <Link to={navigation.back.href}>{navigation.back.text}</Link>
      </div>
    </>
  );
};

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
        <p>The page you are looking for does not exist.</p>
        <Link to={navigation.back.href}>{navigation.back.text}</Link>
      </div>
    </>
  );
};

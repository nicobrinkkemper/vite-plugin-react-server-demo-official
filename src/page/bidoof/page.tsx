import { Link } from "../../components/Link.client.js";
// @ts-ignore
import styles from "../../css/bidoof.module.css";
import type { FallbackData } from "./fallbackData.js";
import * as React from "react";

export const Page = (props: FallbackData) => {
 
  return (
    <>
      <link rel="icon" href="/bidoof.png" type="image/png" />
      <title>{props?.title ?? "No title"}</title>
      <div className={styles["Bidoof"]}>
        <Link to="/" className={styles["Link"]}>Go back</Link>
        <h1>{props.name}</h1>
        <div className={styles["Images"]}>
          <img
            src={props.sprites.front_shiny}
            alt={props.name}
            className={styles["Image"]}
          />
          <img
            src={props.sprites.back_shiny}
            alt={props.name}
            className={styles["Image"]}
          />
        </div>
        <div className={styles["Images"]}>
          <img
            src={props.sprites.front_female}
            alt={props.name}
            className={styles["Image"]}
          />
          <img
            src={props.sprites.back_female}
            alt={props.name}
            className={styles["Image"]}
          />
        </div>
        <div className={styles["Images"]}>
          <img
            src={props.sprites.front_shiny}
            alt={props.name}
            className={styles["Image"]}
          />
          <img
            src={props.sprites.back_shiny}
            alt={props.name}
            className={styles["Image"]}
          />
        </div>
        <code className={styles["Code"]}>{JSON.stringify(props)}</code>
      </div>
    </>
  );
};

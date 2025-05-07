import { Link } from "../../components/Link.client.js";
import styles from "../../css/bidoof.module.css";
import type { FallbackData } from "./fallbackData.js";
import * as React from "react";

export const Page = (props: FallbackData) => {
  if (!props?.sprites) {
    return (
      <div className={styles["Bidoof"]}>
        <a href="/" className={styles["Link"]}>Go back</a>
        <h1>{props?.name ?? "No name"}</h1>
        <code className={styles["Code"]}>{JSON.stringify(props)}</code>
      </div>
    );
  }
  return (
    <>
      <link rel="icon" href="/bidoof.png" type="image/png" />
      <div className={styles["Bidoof"]}>
        <Link to="/" className={styles["Link"]}>Go back</Link>
        <h1>{props.name}test</h1>
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

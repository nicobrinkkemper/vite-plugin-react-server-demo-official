import { Link } from "../../components/Link.client.js";
import styles from "../../css/bidoof.module.css";
import * as React from "react";
import type { Props } from "./props.js";

export const Page = (props: Props) => {
  return (
    <>
      <link rel="icon" href={props.favicon} type="image/png" />
      <title>{props?.title ?? "No title"}</title>
      <div className={styles["Bidoof"]}>
        <Link to={props.navigation.back.href} className={styles["Link"]}>
          {props.navigation.back.text}
        </Link>
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

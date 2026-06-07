import { Link } from "../../components/Link.client.js";
import { JsonViewer } from "../../components/JsonViewer.js";
import styles from "../../css/bidoof.module.css";
import * as React from "react";
import type { Props } from "./props.js";
import { WalkingBidoof } from "../../components/WalkingBidoof.client.js";

/** Page metadata keys excluded from the API response viewer. */
const pageMetaKeys = new Set([
  "title",
  "description",
  "favicon",
  "bidoofEndpoint",
  "pokemonEndpoint",
  "bdspSprite",
  "navigation",
]);

function getApiResponse(props: Props) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !pageMetaKeys.has(key)),
  );
}

export const Page = (props: Props) => {
  return (
    <>
      <link rel="icon" href={props.favicon} type="image/png" />
      <title>{props?.title ?? "No title"}</title>
      <div className={styles["Bidoof"]}>
        <Link to={props.navigation.back.href} className={styles["Link"]}>
          {props.navigation.back.text}
        </Link>
        <div className={styles["TitleRow"]}>
          <h1>{props?.title ?? props.name}</h1>

        </div>
        <div className={styles["Images"]}>
          <WalkingBidoof
            srcBack={props.sprites.back_shiny}
            srcFront={props.sprites.front_shiny}
            alt={props.name}
            index={0}
          />
          <WalkingBidoof
            srcBack={props.sprites.back_shiny}
            srcFront={props.sprites.front_shiny}
            alt={props.name}
            index={1}
          />
          <WalkingBidoof
            srcBack={props.sprites.back_female}
            srcFront={props.sprites.front_female}
            alt={props.name}
            index={2}
          />
          <WalkingBidoof
            srcBack={props.sprites.back_female}
            srcFront={props.sprites.front_female}
            alt={props.name}
            index={3}
          />
          <WalkingBidoof
            srcBack={props.sprites.back_shiny}
            srcFront={props.sprites.front_shiny}
            alt={props.name}
            index={4}
          />
          <WalkingBidoof
            srcBack={props.sprites.back_shiny}
            srcFront={props.sprites.front_shiny}
            alt={props.name}
            index={5}
          />
        </div>
        <div className={styles["JsonSection"]}>
          <JsonViewer
            endpoint={props.bidoofEndpoint}
            data={getApiResponse(props)}
          />
        </div>{props.bdspSprite ? (
          <img
            src={props.bdspSprite}
            alt={`${props.name} Brilliant Diamond and Shining Pearl sprite`}
            className={styles["TitleSprite"]}
          />
        ) : null}
      </div>
    </>
  );
};

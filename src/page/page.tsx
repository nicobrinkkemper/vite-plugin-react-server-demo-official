/// <reference types="vite/client" />
import * as React from "react";
import { Link } from "../components/Link.client.js";
import styles from "../css/home.module.css";
import packageJson from "../../package.json" assert { type: "json" };
import { Counter } from "../components/Counter.client.js";
import type { Props } from "./props.js";
import { env } from "vite-plugin-react-server/utils";
export const Page = ({ url, title, navigation }: Props) => {
  return (
    <>
      <title>{title ?? "No title"}</title>
      <div className={styles["Home"]}>
        <link
          rel="icon"
          href={`${env.PUBLIC_ORIGIN ?? ""}${
            env.BASE_URL ?? "/"
          }favicon.ico`}
          type="image/x-icon"
        />
        <div className={styles["Panel"]}>
          <h1>vite-plugin-react-server demo</h1>
          <p>
            This is a test page,{" "}
            <a
              href={packageJson.repository}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["Url"]}
            >
              see the source code here
            </a>
            .
          </p>
          <p>
            You are on <code>{url}</code>.
          </p>
          <ul>
            <li>
              <Link to={navigation.toBidoof.href} className={styles["Url"]}>
                {navigation.toBidoof.text}
              </Link>
            </li>
            <li>
              <Link
                to={navigation.toErrorExample.href}
                className={styles["Url"]}
              >
                {navigation.toErrorExample.text}
              </Link>
            </li>
          </ul>
          <dl>
            <dt>Build using node version</dt>
            <dd>
              <code>{process.versions.node}</code>
            </dd>
            <dt>React version</dt>
            <dd>
              <code>{React.version}</code>
            </dd>
            <dt>BASE_URL</dt>
            <dd>
              <code>{import.meta.env.BASE_URL}</code>
            </dd>
            <dt>PUBLIC_ORIGIN</dt>
            <dd>
              <code>{import.meta.env.PUBLIC_ORIGIN}</code>
            </dd>
            <dt>Mandatory counter example</dt>
            <dd>
              <Counter />
            </dd> 
          </dl>
        </div>
      </div>
    </>
  );
};

import * as React from "react";
import { Link } from "../components/Link.client.js";
// @ts-ignore
import styles from "../css/home.module.css";
import packageJson from "../../package.json" assert { type: "json" };
import { Counter } from "../components/Counter.client.js";
import type { Props } from "./props.js";

export const Page = ({ url, title, navigation }: Props) => {
  return (
    <>
      <title>{title ?? "No title"}</title>
      <div className={styles["Home"]}>
        <link
          rel="icon"
          href={`${process.env.VITE_PUBLIC_ORIGIN ?? ""}${
            process.env.VITE_BASE_URL ?? "/"
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
          <p>
            Build using node version <code>{process.versions.node}</code>. React
            version <code>{React.version}</code>.
          </p>
          <Counter />
        </div>
      </div>
    </>
  );
};

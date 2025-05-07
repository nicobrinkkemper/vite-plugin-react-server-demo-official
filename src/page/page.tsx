import * as React from "react";
import { Link } from "../components/Link.client.js";
import styles from "../css/home.module.css";
import packageJson from "../../package.json" assert { type: "json" };
import { Counter } from "../components/Counter.client.js";
export const Page = ({ url }: { url: string }) => {
  return (
    <div className={styles["Home"]}>
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
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
            <Link to="bidoof" className={styles["Url"]}>bidoof</Link>
          </li>
          <li>
            <Link to="error-example" className={styles["Url"]}>error-example</Link>
          </li>
        </ul>
        <p>
          Build using node version <code>{process.versions.node}</code>. React version <code>{React.version}</code>.
        </p>
        <p>
          <code>{JSON.stringify(import.meta.env)}</code>
        </p>
        <Counter />
      </div>
    </div>
  );
};

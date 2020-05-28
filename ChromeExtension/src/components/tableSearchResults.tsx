import React from "react";
// eslint-disable-next-line no-unused-vars
import SearchProgress, { Progress } from "@/entities/searchProgress";
import progressBar from "@/elements/progressBar";
import styles from "./tableSearchResults.scss";

function sumProgress(items: SearchProgress[]): Progress {
  return {
    loadedPages: items.reduce((acc, v) => acc + v.progress.loadedPages, 0),
    totalPages: items.reduce((acc, v) => acc + v.progress.totalPages, 0)
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function TableSearchResults({ items }: { items: SearchProgress[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Search text</th>
          <th>Items</th>
          <th className={styles.progressColumn}>Pages</th>
          <th>Page load speed</th>
          <th>Time left</th>
        </tr>
      </thead>
      <tbody>
        {items.map(v => {
          return (
            <tr key={v.text}>
              <td>{v.text}</td>
              <td>{v.totalItems}</td>
              <td className={styles.progressColumn}>{progressBar(v.progress)}</td>
              <td>{v.speed}ms</td>
              <td>{v.lostTime}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {items.length > 1 ? (
          <tr>
            <td>Summary</td>
            <td>{items.reduce((acc, v) => acc + v.totalItems, 0)}</td>
            <td className={styles.progressColumn}>{progressBar(sumProgress(items))}</td>
            <td />
            <td />
          </tr>
        ) : null}
      </tfoot>
    </table>
  );
}

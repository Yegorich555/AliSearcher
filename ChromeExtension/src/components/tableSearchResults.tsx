import React from "react";
// eslint-disable-next-line no-unused-vars
import SearchResult, { Progress } from "@/entities/searchResult";
import progressBar from "@/elements/progressBar";
import styles from "./tableSearchResults.scss";

function sumProgress(items: SearchResult[]): Progress {
  return {
    loadedPages: items.reduce((acc, v) => acc + v.progress.loadedPages, 0),
    totalPages: items.reduce((acc, v) => acc + v.progress.totalPages, 0)
  };
}

export default function TableSearchResults({ items }: { items: SearchResult[] }) {
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
            <tr>
              <td>{v.text}</td>
              <td>{v.totalItems}</td>
              <td>{progressBar(v.progress)}</td>
              <td>{v.speed}ms</td>
              <td>{v.lostTime}ms</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {!items.length ? null : (
          <tr>
            <td>Summary</td>
            <td>{items.reduce((acc, v) => acc + v.totalItems, 0)}</td>
            <td>{progressBar(sumProgress(items))}</td>
          </tr>
        )}
      </tfoot>
    </table>
  );
}

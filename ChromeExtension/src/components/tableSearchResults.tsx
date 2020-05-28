import React from "react";
// eslint-disable-next-line no-unused-vars
import SearchProgress from "@/entities/searchProgress";
import progressBar from "@/elements/progressBar";
import Pagination from "@/entities/pagination";
import styles from "./tableSearchResults.scss";

function sumProgress(items: SearchProgress[]): Pagination {
  return {
    pageSize: 0,
    loadedPages: items.reduce((acc, v) => acc + v.pagination.loadedPages, 0),
    totalPages: items.reduce((acc, v) => acc + v.pagination.totalPages, 0)
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
              <td>{v.pagination.totalItems}</td>
              <td className={styles.progressColumn}>{progressBar(v.pagination)}</td>
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
            <td>{items.reduce((acc, v) => acc + v.pagination.totalItems, 0)}</td>
            <td className={styles.progressColumn}>{progressBar(sumProgress(items))}</td>
            <td />
            <td />
          </tr>
        ) : null}
      </tfoot>
    </table>
  );
}

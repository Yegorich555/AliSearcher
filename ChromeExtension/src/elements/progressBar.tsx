import React from "react";
import Pagination from "@/entities/pagination";
import styles from "./progressBar.scss";

export default function progressBar(v: Pagination): JSX.Element {
  const percent = (v.loadedPages * 100) / v.totalPages;
  return (
    <div
      className={styles.progressBar}
      style={{
        background: `linear-gradient(to right, var(--primaryBtnBackColor, gray) ${percent}%, transparent ${percent +
          1}%)`
      }}
    >
      {!v || !v.totalPages
        ? "---" //
        : `${v.loadedPages} / ${v.totalPages}`}
    </div>
  );
}

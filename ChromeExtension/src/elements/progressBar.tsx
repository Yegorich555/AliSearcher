import React from "react";
// eslint-disable-next-line no-unused-vars
import { Progress } from "@/entities/searchProgress";
import styles from "./progressBar.scss";

export default function progressBar(progress: Progress): JSX.Element {
  const percent = (progress.loadedPages * 100) / progress.totalPages;
  return (
    <div
      className={styles.progressBar}
      style={{
        background: `linear-gradient(to right, var(--primaryBtnBackColor, gray) ${percent}%, transparent ${percent +
          1}%)`
      }}
    >
      {!progress || !progress.totalPages
        ? "---" //
        : `${progress.loadedPages} / ${progress.totalPages}`}
    </div>
  );
}

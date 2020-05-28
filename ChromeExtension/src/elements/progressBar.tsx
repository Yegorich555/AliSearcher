import React from "react";
// eslint-disable-next-line no-unused-vars
import { Progress } from "@/entities/searchProgress";
import styles from "./progressBar.scss";

export default function progressBar(progress: Progress) {
  return (
    // todo fill behavior
    <div className={styles.progressBar}>
      {!progress || !progress.totalPages
        ? "---" //
        : `${progress.loadedPages} / ${progress.totalPages}`}
    </div>
  );
}

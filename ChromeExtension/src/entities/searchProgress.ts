export type Progress = {
  loadedPages: number;
  totalPages: number;
};

function twoDigits(v: number): string {
  return (v < 10 ? "0" : "") + v;
}

export default class SearchProgress {
  /** search string */
  text: string;
  totalItems: number;
  progress: Progress = { loadedPages: 0, totalPages: 0 };
  /** average speed of page-loading (ms) */
  speed?: number;
  get lostTime(): string {
    if (!this.speed) {
      return "";
    }
    const sec = ((this.progress.totalPages - this.progress.loadedPages) * this.speed) / 1000;
    const hh = Math.floor(sec / 3600);
    const mm = Math.floor((sec - hh * 60) / 60);
    const ss = Math.floor(sec - hh * 60 - mm * 60);
    return `${twoDigits(hh)}:${twoDigits(mm)}:${twoDigits(ss)}`;
  }

  public constructor(init?: Partial<SearchProgress>) {
    Object.assign(this, init);
  }
}

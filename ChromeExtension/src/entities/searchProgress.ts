import Pagination from "./pagination";

function twoDigits(v: number): string {
  return (v < 10 ? "0" : "") + v;
}

export default class SearchProgress {
  /** search string */
  text: string;
  pagination: Pagination;
  /** average speed of page-loading (ms) */
  speed?: number;
  get lostTime(): string {
    if (!this.speed) {
      return "";
    }
    const sec = ((this.pagination.totalPages - this.pagination.loadedPages) * this.speed) / 1000;
    const hh = Math.floor(sec / 3600);
    const mm = Math.floor((sec - hh * 60) / 60);
    const ss = Math.floor(sec - hh * 60 - mm * 60);
    return `${twoDigits(hh)}:${twoDigits(mm)}:${twoDigits(ss)}`;
  }

  public constructor(init?: Partial<SearchProgress>) {
    Object.assign(this, init);
  }
}

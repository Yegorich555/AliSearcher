export type Progress = {
  loadedPages: number;
  totalPages: number;
};
export default class SearchResult {
  /** search string */
  text: string;
  totalItems: number;
  progress: Progress = { loadedPages: 0, totalPages: 0 };
  /** average speed of loading (ms) */
  speed?: number;
  get lostTime(): string {
    if (!this.speed) {
      return "";
    }
  }
}

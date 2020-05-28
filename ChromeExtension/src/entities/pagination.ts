export default class Pagination {
  totalItems?: number;
  totalPages?: number;
  pageSize = 60;
  loadedPages = 0;

  public constructor(init?: Partial<Pagination>) {
    Object.assign(this, init);
  }
}

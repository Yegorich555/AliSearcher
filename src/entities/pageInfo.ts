export interface PageInfo {
  pageSize?: number;
  items: Record<string, any>[];
  totalItems?: number;
  url: URL;
}

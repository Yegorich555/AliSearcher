/** fix urls that don't have http prefix */
// eslint-disable-next-line import/prefer-default-export
export function fixUrl(url: string): string {
  return url.replace(/^\/\//, "https://");
}

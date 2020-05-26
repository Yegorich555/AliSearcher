export default function replaceUrlParam(url: string, paramName: string, paramValue: string | number): string {
  if (paramValue == null) {
    // eslint-disable-next-line no-param-reassign
    paramValue = "";
  }
  const pattern = new RegExp(`\\b(${paramName}=).*?(&|#|$)`);
  if (url.search(pattern) >= 0) {
    return url.replace(pattern, `$1${paramValue}$2`);
  }
  const nurl = url.replace(/[?#]$/, "");
  return `${nurl + (nurl.indexOf("?") > 0 ? "&" : "?") + paramName}=${paramValue}`;
}

export function ensureNoEndingTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

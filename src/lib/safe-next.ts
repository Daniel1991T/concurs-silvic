/** Unde te duce aplicația după login: doar adrese din aplicație (nu „//alt-site.ro”), altfel lista de module. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/module";
}

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";

/*
 * Paznicul aplicației: rulează pe server înaintea fiecărei pagini.
 * Fără cont poți vedea doar pagina de start („/”) și pagina de intrare („/intra”);
 * orice altă pagină te trimite la „/intra”, iar după login te întorci unde voiai să ajungi.
 */

const PUBLIC = new Set(["/", "/intra"]);

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // sesiunea se verifică din cookie-ul semnat (fără drum la baza de date în majoritatea cazurilor)
  const { headers, response: session } = await auth.api.getSession({ headers: req.headers, returnHeaders: true });

  let res: NextResponse;
  if (session && pathname === "/intra") {
    // ești deja logat: direct în aplicație
    res = NextResponse.redirect(new URL(safeNext(req.nextUrl.searchParams.get("next")), req.url));
  } else if (!session && !PUBLIC.has(pathname)) {
    const url = new URL("/intra", req.url);
    url.searchParams.set("next", pathname + search);
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
  }
  // dacă Better Auth a reîmprospătat cookie-ul sesiunii, îl trimitem mai departe browserului
  for (const c of headers.getSetCookie()) res.headers.append("set-cookie", c);
  return res;
}

export const config = {
  // nu pentru API (are verificarea lui), fișierele Next.js și iconițe
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|webp|ico|txt|xml|json)$).*)"],
};

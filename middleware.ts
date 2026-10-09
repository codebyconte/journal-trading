import { NextRequest, NextResponse } from "next/server";
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const expected =
      process.env.APP_ORIGIN ||
      `${req.nextUrl.protocol}//${req.headers.get("host")}`;
    if (!origin || origin !== expected)
      return NextResponse.json(
        { error: "Origine non autorisée" },
        { status: 403, headers },
      );
  }
  if (
    path === "/login" ||
    path === "/api/session" ||
    path.startsWith("/_next/static/") || path === "/_next/webpack-hmr"
  )
    return NextResponse.next({ headers });
  if (
    process.env.LOCAL_ONLY === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    const host = req.headers.get("host") ?? "";
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host))
      return NextResponse.json(
        { error: "Accès local uniquement" },
        { status: 403 },
      );
    return NextResponse.next({ headers });
  }
  const secret = process.env.JOURNAL_PASSWORD,
    value = req.cookies.get("journal_session")?.value ?? "",
    expiry = Number(value.split(".")[0]);
  let valid = false;
  if (
    secret &&
    secret.length >= 16 &&
    expiry > Date.now() &&
    expiry <= Date.now() + 86400000
  ) {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`journal:${expiry}`),
    );
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    valid = value === `${expiry}.${expected}`;
  }
  if (valid) return NextResponse.next({ headers });
  if (path.startsWith("/api/"))
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401, headers },
    );
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};

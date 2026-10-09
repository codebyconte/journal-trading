import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import { token } from "@/lib/auth";
let attempts = 0,
  reset = Date.now() + 60000;
export async function POST(req: Request) {
  if (Date.now() > reset) {
    attempts = 0;
    reset = Date.now() + 60000;
  }
  if (++attempts > 10)
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans une minute." },
      { status: 429 },
    );
  const secret = process.env.JOURNAL_PASSWORD;
  if (!secret || secret.length < 16)
    return NextResponse.json(
      {
        error:
          "Configure JOURNAL_PASSWORD côté serveur (16 caractères minimum).",
      },
      { status: 503 },
    );
  const body = await req.json().catch(() => ({}));
  const hash = (s: string) => createHash("sha256").update(s).digest();
  if (
    typeof body.password !== "string" ||
    body.password.length > 500 ||
    !timingSafeEqual(hash(body.password), hash(secret))
  )
    return NextResponse.json(
      { error: "Mot de passe incorrect" },
      { status: 401 },
    );
  const res = NextResponse.json({ success: true });
  res.cookies.set("journal_session", token(Date.now() + 12 * 3600000), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 43200,
    path: "/",
  });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("journal_session");
  return res;
}

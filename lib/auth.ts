import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
export function localMode() {
  return (
    process.env.LOCAL_ONLY === "true" && process.env.NODE_ENV !== "production"
  );
}
export function token(expiry: number) {
  const secret = process.env.JOURNAL_PASSWORD;
  if (!secret || secret.length < 16)
    throw new Error("Configure JOURNAL_PASSWORD (16 caractères minimum).");
  return `${expiry}.${createHmac("sha256", secret).update(`journal:${expiry}`).digest("hex")}`;
}
export function verify(value: string) {
  try {
    const expiry = Number(value.split(".")[0]);
    if (
      !Number.isFinite(expiry) ||
      expiry < Date.now() ||
      expiry > Date.now() + 86400000
    )
      return false;
    const expected = token(expiry);
    return (
      value.length === expected.length &&
      timingSafeEqual(Buffer.from(value), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}
export async function requireSession() {
  if (localMode()) return;
  if (!verify((await cookies()).get("journal_session")?.value ?? ""))
    throw new Error("Authentification requise");
}

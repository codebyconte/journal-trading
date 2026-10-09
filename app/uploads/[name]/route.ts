import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireSession } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  await requireSession();
  const { name } = await params;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,160}\.(png|jpe?g)$/i.test(name)) return new NextResponse(null, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": /\.png$/i.test(name) ? "image/png" : "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new NextResponse(null, { status: 404 }); }
}

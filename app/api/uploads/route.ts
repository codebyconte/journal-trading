import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    await requireSession();
    if (Number(req.headers.get("content-length") ?? 0) > 6 * 1024 * 1024)
      return NextResponse.json(
        { error: "Fichier limité à 5 Mo" },
        { status: 413 },
      );
    const data = await req.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024)
      throw new Error("Fichier invalide");
    const buffer = Buffer.from(await file.arrayBuffer());
    const png = buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      jpeg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    if (!png && !jpeg)
      return NextResponse.json(
        { error: "Images PNG ou JPEG uniquement" },
        { status: 400 },
      );
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${png ? "png" : "jpg"}`;
    await writeFile(path.join(dir, name), buffer, { flag: "wx" });
    return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Téléversement impossible" },
      { status: 400 },
    );
  }
}

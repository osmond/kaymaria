import { NextResponse } from "next/server";
import { addPhoto, listPhotos, removePhoto } from "@/lib/data";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const photos = await listPhotos(id);
    return NextResponse.json(photos);
  } catch (e) {
    console.error("GET /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const src = typeof body.src === "string" ? body.src.trim() : "";
    if (!src) return NextResponse.json({ error: "src required" }, { status: 400 });
    const photo = await addPhoto(id, src);
    if (!photo) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    console.error("POST /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const src = typeof body.src === "string" ? body.src.trim() : "";
    if (!src) return NextResponse.json({ error: "src required" }, { status: 400 });
    const ok = await removePhoto(id, src);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

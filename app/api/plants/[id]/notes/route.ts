import { NextResponse } from "next/server";
import { addNote, listNotes } from "@/lib/mockdb";

// Fetch notes for a plant
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const notes = listNotes(id);
    return NextResponse.json(notes);
  } catch (e) {
    console.error("GET /api/plants/[id]/notes failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

// Add a note to a plant
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
    const note = addNote(id, text);
    return NextResponse.json(note, { status: 201 });
  } catch (e) {
    console.error("POST /api/plants/[id]/notes failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

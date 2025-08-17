import { NextRequest, NextResponse } from "next/server";
import { addNote, listNotes } from "@/lib/mockdb";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  return NextResponse.json(listNotes(params.id));
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  const note = addNote(params.id, text);
  return NextResponse.json(note, { status: 201 });
}

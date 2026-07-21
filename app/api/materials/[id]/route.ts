import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { materials } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, grade, subject, type, url } = body;
    await db.update(materials).set({ title, description, grade, subject, type, url }).where(eq(materials.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(materials).where(eq(materials.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

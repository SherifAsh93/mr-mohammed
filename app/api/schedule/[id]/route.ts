import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedule } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { day, startTime, endTime, grade, groupName, location } = body;
    await db.update(schedule).set({ day, startTime, endTime, grade, groupName, location }).where(eq(schedule.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(schedule).where(eq(schedule.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

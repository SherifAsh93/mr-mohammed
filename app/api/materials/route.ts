import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { materials } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(materials).orderBy(desc(materials.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, grade, subject, type, url } = body;
    if (!title || !grade || !subject || !url) {
      return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    }
    const [row] = await db.insert(materials).values({ title, description, grade, subject, type: type || "link", url }).returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}

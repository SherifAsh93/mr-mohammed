import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedule } from "@/db/schema";
import { asc } from "drizzle-orm";

const DAY_ORDER = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export async function GET() {
  try {
    const rows = await db.select().from(schedule).orderBy(asc(schedule.startTime));
    rows.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, startTime, endTime, grade, groupName, location } = body;
    if (!day || !startTime || !endTime || !grade) {
      return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    }
    const [row] = await db.insert(schedule).values({ day, startTime, endTime, grade, groupName, location }).returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}

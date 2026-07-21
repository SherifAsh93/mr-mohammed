import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ ok: false }, { status: 400 });

    const row = await db.select().from(adminSettings).where(eq(adminSettings.key, "admin_password")).limit(1);
    if (!row.length) return NextResponse.json({ ok: false }, { status: 401 });

    const match = await bcrypt.compare(password, row[0].value);
    if (!match) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ ok: true, token: randomUUID() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ ok: false, error: "البيانات غير مكتملة" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)" }, { status: 400 });
    }

    const row = await db.select().from(adminSettings).where(eq(adminSettings.key, "admin_password")).limit(1);
    if (!row.length) return NextResponse.json({ ok: false, error: "خطأ في الإعداد" }, { status: 500 });

    const match = await bcrypt.compare(currentPassword, row[0].value);
    if (!match) return NextResponse.json({ ok: false, error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(adminSettings).set({ value: newHash, updatedAt: new Date() }).where(eq(adminSettings.key, "admin_password"));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}

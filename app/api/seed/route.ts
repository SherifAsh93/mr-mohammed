import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSettings } from "@/db/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_admin_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_materials (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        grade VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'link',
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_results (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_code VARCHAR(50),
        grade VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_schedule (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        grade VARCHAR(100) NOT NULL,
        group_name VARCHAR(100),
        location VARCHAR(150),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const existing = await db.select().from(adminSettings).limit(1);
    if (!existing.length) {
      const hash = await bcrypt.hash("123456", 12);
      await db.insert(adminSettings).values({ key: "admin_password", value: hash });
    }

    return NextResponse.json({ ok: true, message: "Database initialized successfully" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

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
        subject VARCHAR(100) NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        schedule_text VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        max_students INTEGER DEFAULT 0,
        meeting_link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_enrollments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_phone VARCHAR(30) NOT NULL,
        student_email VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Migrate: drop grade column from materials/results if it exists
    await db.execute(sql`ALTER TABLE mrm_materials DROP COLUMN IF EXISTS grade`);
    await db.execute(sql`ALTER TABLE mrm_results DROP COLUMN IF EXISTS grade`);
    // Drop old schedule table
    await db.execute(sql`DROP TABLE IF EXISTS mrm_schedule`);
    // Add payment_ref column to enrollments if it doesn't exist
    await db.execute(sql`ALTER TABLE mrm_enrollments ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(100)`);
    // Add price column to courses if it doesn't exist
    await db.execute(sql`ALTER TABLE mrm_courses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2)`);
    // Drop old meeting_link column from courses (replaced by sessions)
    await db.execute(sql`ALTER TABLE mrm_courses DROP COLUMN IF EXISTS meeting_link`);
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mrm_sessions (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        meeting_link TEXT NOT NULL,
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

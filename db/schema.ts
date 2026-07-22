import { pgTable, serial, text, varchar, timestamp, integer, decimal, unique } from "drizzle-orm/pg-core";

export const adminSettings = pgTable("mrm_admin_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("mrm_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("mrm_materials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("link"),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const results = pgTable("mrm_results", {
  id: serial("id").primaryKey(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  studentCode: varchar("student_code", { length: 50 }),
  subject: varchar("subject", { length: 100 }).notNull(),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).notNull().default("100"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("mrm_courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }).notNull(),
  scheduleText: varchar("schedule_text", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  maxStudents: integer("max_students").default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("mrm_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  meetingLink: text("meeting_link").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  recordedUrl: text("recorded_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("mrm_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  userId: integer("user_id"),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  studentPhone: varchar("student_phone", { length: 30 }).notNull(),
  paymentRef: varchar("payment_ref", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("mrm_attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  enrollmentId: integer("enrollment_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("absent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [unique().on(t.sessionId, t.enrollmentId)]);

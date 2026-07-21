import { pgTable, serial, text, varchar, timestamp, integer, decimal } from "drizzle-orm/pg-core";

export const adminSettings = pgTable("mrm_admin_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const materials = pgTable("mrm_materials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  grade: varchar("grade", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("link"),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const results = pgTable("mrm_results", {
  id: serial("id").primaryKey(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  studentCode: varchar("student_code", { length: 50 }),
  grade: varchar("grade", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).notNull().default("100"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const schedule = pgTable("mrm_schedule", {
  id: serial("id").primaryKey(),
  day: varchar("day", { length: 20 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  grade: varchar("grade", { length: 100 }).notNull(),
  groupName: varchar("group_name", { length: 100 }),
  location: varchar("location", { length: 150 }),
  createdAt: timestamp("created_at").defaultNow(),
});

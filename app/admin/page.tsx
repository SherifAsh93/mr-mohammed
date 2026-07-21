"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { materials: number; results: number; schedule: number };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ materials: 0, results: 0, schedule: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/materials").then((r) => r.json()),
      fetch("/api/results").then((r) => r.json()),
      fetch("/api/schedule").then((r) => r.json()),
    ]).then(([m, r, s]) => {
      setStats({
        materials: Array.isArray(m) ? m.length : 0,
        results: Array.isArray(r) ? r.length : 0,
        schedule: Array.isArray(s) ? s.length : 0,
      });
    });
  }, []);

  const cards = [
    { label: "المواد التعليمية", value: stats.materials, icon: "📚", href: "/admin/materials", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "نتائج الطلاب", value: stats.results, icon: "📊", href: "/admin/results", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "حصص الجدول", value: stats.schedule, icon: "🗓️", href: "/admin/schedule", color: "bg-teal-50 text-teal-700 border-teal-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#1a3a6b]">مرحباً، أستاذ محمد 👋</h1>
        <p className="text-gray-500 mt-1">إليك ملخص سريع للموقع</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`bg-white rounded-2xl border p-6 flex flex-col gap-2 hover:shadow-md transition-shadow ${c.color}`}
          >
            <span className="text-3xl">{c.icon}</span>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-sm font-semibold">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-[#1a3a6b] mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/materials" className="bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#122a52] transition-colors">
            + إضافة مادة
          </Link>
          <Link href="/admin/results" className="bg-[#d4a017] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b8860f] transition-colors">
            + إضافة نتيجة
          </Link>
          <Link href="/admin/schedule" className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
            + إضافة حصة
          </Link>
          <Link href="/" target="_blank" className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            🌐 عرض الموقع
          </Link>
        </div>
      </div>
    </div>
  );
}

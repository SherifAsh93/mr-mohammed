"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, materials: 0, results: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then(r => r.json()),
      fetch("/api/enrollments").then(r => r.json()),
      fetch("/api/materials").then(r => r.json()),
      fetch("/api/results").then(r => r.json()),
    ]).then(([c, e, m, r]) => setStats({
      courses: Array.isArray(c) ? c.length : 0,
      enrollments: Array.isArray(e) ? e.length : 0,
      materials: Array.isArray(m) ? m.length : 0,
      results: Array.isArray(r) ? r.length : 0,
    }));
  }, []);

  const cards = [
    { label: "الدورات", value: stats.courses, icon: "🎓", href: "/admin/courses", color: "border-blue-100 text-blue-700 bg-blue-50" },
    { label: "المسجّلون", value: stats.enrollments, icon: "👥", href: "/admin/enrollments", color: "border-green-100 text-green-700 bg-green-50" },
    { label: "المواد", value: stats.materials, icon: "📚", href: "/admin/materials", color: "border-amber-100 text-amber-700 bg-amber-50" },
    { label: "النتائج", value: stats.results, icon: "📊", href: "/admin/results", color: "border-teal-100 text-teal-700 bg-teal-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1a3a6b]">مرحباً، أستاذ محمد 👋</h1>
        <p className="text-gray-400 text-sm mt-1">إليك ملخص سريع</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className={`bg-white rounded-2xl border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow ${c.color}`}>
            <span className="text-2xl">{c.icon}</span>
            <span className="text-3xl font-black">{c.value}</span>
            <span className="text-sm font-semibold">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#1a3a6b] mb-4 text-sm">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/courses" className="bg-[#1a3a6b] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors">+ دورة جديدة</Link>
          <Link href="/admin/enrollments" className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">عرض التسجيلات</Link>
          <Link href="/admin/materials" className="bg-[#c9860a] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b8760a] transition-colors">+ مادة جديدة</Link>
          <Link href="/" target="_blank" className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">🌐 الموقع</Link>
        </div>
      </div>
    </div>
  );
}

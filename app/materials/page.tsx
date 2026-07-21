"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Material = {
  id: number;
  title: string;
  description: string | null;
  grade: string;
  subject: string;
  type: string;
  url: string;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  pdf: "📄",
  video: "▶️",
  note: "📝",
  link: "🔗",
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  video: "فيديو",
  note: "ملاحظات",
  link: "رابط",
};

export default function MaterialsPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("الكل");
  const [type, setType] = useState("الكل");

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const grades = ["الكل", ...Array.from(new Set(items.map((i) => i.grade)))];
  const types = ["الكل", ...Array.from(new Set(items.map((i) => i.type)))];

  const filtered = items.filter(
    (i) => (grade === "الكل" || i.grade === grade) && (type === "الكل" || i.type === type)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2347] text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black mb-2">📚 المواد التعليمية</h1>
          <p className="text-white/70">مذكرات ومقاطع فيديو وملفات PDF منظمة لك</p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-semibold">الصف:</span>
            <div className="flex flex-wrap gap-2">
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    grade === g ? "bg-[#1a3a6b] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3a6b]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-semibold">النوع:</span>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    type === t ? "bg-[#d4a017] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#d4a017]"
                  }`}
                >
                  {t === "الكل" ? t : (TYPE_LABELS[t] || t)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">📭</div>
            <p className="text-gray-400">لا توجد مواد بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-5 flex flex-col gap-3 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{TYPE_ICONS[item.type] || "🔗"}</span>
                  <span className="text-xs bg-[#f0f4ff] text-[#1a3a6b] font-semibold px-2.5 py-1 rounded-full">
                    {item.grade}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3a6b] group-hover:text-[#d4a017] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.subject}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

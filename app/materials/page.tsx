"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Material = {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  type: string;
  url: string;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = { pdf: "📄", video: "▶️", note: "📝", link: "🔗" };
const TYPE_LABELS: Record<string, string> = { pdf: "PDF", video: "فيديو", note: "ملاحظات", link: "رابط" };

export default function MaterialsPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("الكل");

  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const subjects = ["الكل", ...Array.from(new Set(items.map(i => i.subject)))];
  const filtered = subject === "الكل" ? items : items.filter(i => i.subject === subject);

  return (
    <div className="flex flex-col min-h-screen page-bottom">
      <Header title="المواد" />

      <div className="bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] text-white px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black">📚 المواد التعليمية</h1>
          <p className="text-white/60 text-sm mt-1">ملفات ومقاطع ومحاضرات</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {/* Subject filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-4" dir="ltr">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                subject === s ? "bg-[#1a3a6b] text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">📭</div>
            <p className="text-gray-400 text-sm">لا توجد مواد بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] flex items-center justify-center text-2xl shrink-0">
                  {TYPE_ICONS[item.type] || "🔗"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1a3a6b] text-sm leading-tight line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs text-[#1a3a6b] font-semibold">{item.subject}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{TYPE_LABELS[item.type] || item.type}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

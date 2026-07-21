"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Result = {
  id: number;
  studentName: string;
  studentCode: string | null;
  grade: string;
  subject: string;
  examName: string;
  score: string;
  maxScore: string;
  createdAt: string;
};

function ScoreBadge({ score, max }: { score: string; max: string }) {
  const pct = (parseFloat(score) / parseFloat(max)) * 100;
  const color =
    pct >= 85 ? "bg-green-100 text-green-700" :
    pct >= 60 ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";
  return (
    <span className={`font-black px-3 py-1 rounded-full text-lg ${color}`}>
      {score} / {max}
    </span>
  );
}

export default function ResultsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/results?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2347] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black mb-2">📊 نتائج الطلاب</h1>
          <p className="text-white/70">ابحث عن نتيجتك باسمك أو كودك</p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسمك أو كودك هنا..."
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/20 text-right"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#d4a017] hover:bg-[#b8860f] text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "..." : "ابحث"}
            </button>
          </form>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {!searched ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="text-gray-400">ابحث عن اسمك أو كودك لعرض نتائجك</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-gray-400">جاري البحث...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">😕</div>
            <p className="text-gray-500 font-semibold">لم يتم العثور على نتائج</p>
            <p className="text-gray-400 text-sm">تأكد من كتابة اسمك بشكل صحيح أو تواصل مع الأستاذ</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <p className="text-gray-500 text-sm">تم العثور على {results.length} نتيجة</p>
            {results.map((r) => {
              const pct = (parseFloat(r.score) / parseFloat(r.maxScore)) * 100;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-black text-[#1a3a6b] text-lg">{r.studentName}</h3>
                      {r.studentCode && <p className="text-gray-400 text-sm">كود: {r.studentCode}</p>}
                    </div>
                    <ScoreBadge score={r.score} max={r.maxScore} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="bg-[#f0f4ff] text-[#1a3a6b] px-3 py-1 rounded-full font-semibold">{r.grade}</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{r.subject}</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{r.examName}</span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          pct >= 85 ? "bg-green-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

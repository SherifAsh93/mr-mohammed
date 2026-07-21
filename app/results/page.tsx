"use client";
import { useState } from "react";
import Header from "@/components/Header";

type Result = {
  id: number;
  studentName: string;
  studentCode: string | null;
  subject: string;
  examName: string;
  score: string;
  maxScore: string;
  createdAt: string;
};

export default function ResultsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/results?q=${encodeURIComponent(query.trim())}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen page-bottom">
      <Header title="النتائج" />

      <div className="bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] text-white px-4 py-8">
        <div className="max-w-lg mx-auto space-y-4">
          <h1 className="text-2xl font-black">📊 نتائجك</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسمك أو كودك..."
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:bg-white/20 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c9860a] text-white font-bold px-5 py-3 rounded-2xl disabled:opacity-60 whitespace-nowrap text-sm"
            >
              بحث
            </button>
          </form>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {!searched ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="text-gray-400 text-sm">ابحث باسمك لعرض نتائجك</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">جاري البحث...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">😕</div>
            <p className="text-gray-600 font-bold text-sm">لا توجد نتائج</p>
            <p className="text-gray-400 text-xs">تأكد من كتابة اسمك بشكل صحيح</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <p className="text-gray-400 text-xs">{results.length} نتيجة</p>
            {results.map((r) => {
              const pct = (parseFloat(r.score) / parseFloat(r.maxScore)) * 100;
              const color = pct >= 85 ? "bg-green-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
              const textColor = pct >= 85 ? "text-green-700 bg-green-50" : pct >= 60 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-[#1a3a6b] text-base">{r.studentName}</p>
                      {r.studentCode && <p className="text-gray-400 text-xs">كود: {r.studentCode}</p>}
                    </div>
                    <span className={`font-black text-lg px-3 py-1 rounded-xl ${textColor}`}>
                      {r.score}/{r.maxScore}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-[#eef1fb] text-[#1a3a6b] font-semibold px-2.5 py-1 rounded-full">{r.subject}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{r.examName}</span>
                  </div>
                  <div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

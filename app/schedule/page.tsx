"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ScheduleEntry = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  grade: string;
  groupName: string | null;
  location: string | null;
};

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const DAY_COLORS: Record<string, string> = {
  السبت: "bg-violet-100 text-violet-700",
  الأحد: "bg-blue-100 text-blue-700",
  الاثنين: "bg-teal-100 text-teal-700",
  الثلاثاء: "bg-amber-100 text-amber-700",
  الأربعاء: "bg-rose-100 text-rose-700",
  الخميس: "bg-green-100 text-green-700",
  الجمعة: "bg-gray-100 text-gray-700",
};

export default function SchedulePage() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const byDay = DAYS.reduce<Record<string, ScheduleEntry[]>>((acc, d) => {
    acc[d] = entries.filter((e) => e.day === d);
    return acc;
  }, {});

  const activeDays = DAYS.filter((d) => byDay[d].length > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2347] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black mb-2">🗓️ جدول الحصص</h1>
          <p className="text-white/70">مواعيد الحصص حسب الصف والمجموعة</p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
        ) : activeDays.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">📭</div>
            <p className="text-gray-400">لا يوجد جدول بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeDays.map((day) => (
              <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-5 py-3 font-black text-lg ${DAY_COLORS[day] || "bg-gray-100 text-gray-700"}`}>
                  {day}
                </div>
                <div className="divide-y divide-gray-50">
                  {byDay[day].map((e) => (
                    <div key={e.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-[#1a3a6b] font-bold min-w-[120px]">
                        <span>⏰</span>
                        <span>{e.startTime} – {e.endTime}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">{e.grade}</span>
                        {e.groupName && (
                          <span className="text-gray-500 text-sm"> — {e.groupName}</span>
                        )}
                      </div>
                      {e.location && (
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <span>📍</span>{e.location}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Course = {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  scheduleText: string | null;
  status: string;
  maxStudents: number | null;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:     { label: "مفتوح للتسجيل", color: "bg-green-100 text-green-700" },
  upcoming: { label: "قادم قريبًا",   color: "bg-blue-100 text-blue-700"  },
  closed:   { label: "مكتمل",          color: "bg-gray-100 text-gray-500"  },
};

const SUBJECT_COLORS: Record<string, string> = {
  "اللغة العربية": "bg-[#eef1fb] text-[#1a3a6b]",
  "التربية الإسلامية": "bg-amber-50 text-amber-700",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ studentName: "", studentPhone: "", studentEmail: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(setCourses).finally(() => setLoading(false));
  }, []);

  function openEnroll(c: Course) {
    if (c.status !== "open") return;
    setEnrollCourse(c);
    setForm({ studentName: "", studentPhone: "", studentEmail: "" });
    setDone(false);
    setError("");
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollCourse) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: enrollCourse.id, ...form }),
      });
      const data = await res.json();
      if (data.ok) setDone(true);
      else setError(data.error || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen page-bottom">
      <Header title="الدورات" />

      {/* Banner */}
      <div className="bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] text-white px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black">🎓 الدورات المتاحة</h1>
          <p className="text-white/60 text-sm mt-1">اختر الدورة واضغط سجّل الآن</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">📭</div>
            <p className="text-gray-400 text-sm">لا توجد دورات بعد، تابع معنا</p>
          </div>
        ) : (
          courses.map((c) => {
            const status = STATUS_MAP[c.status] || STATUS_MAP.closed;
            const subjectColor = SUBJECT_COLORS[c.subject] || "bg-gray-100 text-gray-600";
            return (
              <div key={c.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-black text-[#1a3a6b] text-lg leading-tight flex-1">{c.title}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {c.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{c.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${subjectColor}`}>
                      {c.subject}
                    </span>
                    {c.scheduleText && (
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        🗓 {c.scheduleText}
                      </span>
                    )}
                    {c.maxStudents ? (
                      <span className="text-xs font-medium text-gray-400">
                        👥 حتى {c.maxStudents} طالب
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => openEnroll(c)}
                    disabled={c.status !== "open"}
                    className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                      c.status === "open"
                        ? "bg-[#1a3a6b] text-white shadow-md shadow-blue-900/20"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {c.status === "open" ? "سجّل الآن" : c.status === "upcoming" ? "قريبًا" : "الدورة مكتملة"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Enrollment bottom sheet */}
      {enrollCourse && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && setEnrollCourse(null)}
        >
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
            {done ? (
              <div className="text-center space-y-4 py-6">
                <div className="text-6xl">✅</div>
                <h2 className="text-xl font-black text-[#1a3a6b]">تم التسجيل!</h2>
                <p className="text-gray-500 text-sm">
                  تم تسجيل طلبك في دورة <strong>{enrollCourse.title}</strong>.<br />
                  سيتواصل معك الأستاذ قريبًا بتفاصيل الحصة.
                </p>
                <button
                  onClick={() => setEnrollCourse(null)}
                  className="w-full bg-[#1a3a6b] text-white font-bold py-3.5 rounded-2xl mt-2"
                >
                  حسنًا
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-black text-[#1a3a6b] text-lg">تسجيل في الدورة</h2>
                    <p className="text-gray-400 text-sm">{enrollCourse.title}</p>
                  </div>
                  <button onClick={() => setEnrollCourse(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg">×</button>
                </div>

                <form onSubmit={handleEnroll} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1.5">الاسم الكامل *</label>
                    <input
                      required
                      value={form.studentName}
                      onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      placeholder="اسمك هنا"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1.5">رقم الهاتف / واتساب *</label>
                    <input
                      required
                      type="tel"
                      value={form.studentPhone}
                      onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1.5">البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span></label>
                    <input
                      type="email"
                      value={form.studentEmail}
                      onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
                      dir="ltr"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1a3a6b] text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-blue-900/20 mt-2"
                  >
                    {submitting ? "جاري الإرسال..." : "تأكيد التسجيل"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

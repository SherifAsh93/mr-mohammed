"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type Course = {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  scheduleText: string | null;
  status: string;
  maxStudents: number | null;
  price: string | null;
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
  const [form, setForm] = useState({ studentName: "", studentPhone: "", paymentRef: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(setCourses).finally(() => setLoading(false));
    fetch("/api/student/me").then(r => r.json()).then(d => {
      if (d.user) setStudent(d.user);
    });
  }, []);

  function openEnroll(c: Course) {
    if (c.status !== "open") return;
    setEnrollCourse(c);
    setForm({ studentName: student?.name || "", studentPhone: student?.phone || "", paymentRef: "" });
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
        body: JSON.stringify({ courseId: enrollCourse.id, studentName: form.studentName, studentPhone: form.studentPhone, paymentRef: form.paymentRef || undefined }),
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
        {/* Student Enrollment Guide */}
        <details className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden">
          <summary className="px-4 py-3.5 cursor-pointer font-bold text-[#1a3a6b] text-sm flex items-center justify-between select-none list-none">
            <span>📋 كيف أسجّل في دورة؟</span>
            <span className="text-blue-400 text-xs font-normal">اضغط للعرض</span>
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-2 text-xs text-blue-800">
            {[
              { step: "١", text: 'اختر الدورة المناسبة واضغط "سجّل الآن" (الزر الأزرق).' },
              { step: "٢", text: 'أدخل اسمك ورقم هاتفك / واتساب.' },
              { step: "٣", text: 'حوّل رسوم الاشتراك عبر فودافون كاش على الرقم المذكور في النموذج.' },
              { step: "٤", text: 'أدخل رقم الإيصال بعد التحويل (اختياري — يمكنك إرساله لاحقاً عبر واتساب).' },
              { step: "٥", text: 'بعد قبول الأستاذ، ستجد رابط الحصة ومواعيدها في لوحة التحكم الخاصة بك.' },
            ].map(s => (
              <div key={s.step} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#1a3a6b] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                <p className="leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </details>

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
                    {c.price && (
                      <span className="text-xs font-bold text-[#c9860a] bg-amber-50 px-2.5 py-1 rounded-full">
                        💰 {Number(c.price).toLocaleString("ar-EG")} جنيه
                      </span>
                    )}
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
                  تم تسجيل طلبك في دورة <strong>{enrollCourse.title}</strong>.
                </p>
                {!form.paymentRef && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-700">
                    💳 لا تنس تحويل رسوم الاشتراك عبر فودافون كاش على الرقم <span className="font-black" dir="ltr">01007050667</span>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-right space-y-1.5">
                  <p className="font-black text-blue-700 text-sm">📹 الحصص بتتعمل على Jitsi Meet</p>
                  <ul className="text-blue-600 text-xs space-y-1">
                    <li>• مش محتاج تحمّل أي تطبيق أو تعمل حساب</li>
                    <li>• افتح الرابط من متصفح موبايلك أو لابتوبك</li>
                    <li>• الكاميرا اختيارية — تقدر تفتحها أو تسكّرها</li>
                    <li>• لو فاتتك الحصة، التسجيل بيبقى على يوتيوب</li>
                  </ul>
                </div>
                <p className="text-gray-400 text-xs">سيتواصل معك الأستاذ قريبًا بتفاصيل الحصة.</p>
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
                  {!student && (
                    <div className="bg-[#eef1fb] border border-[#1a3a6b]/20 rounded-2xl p-3 text-sm flex items-center justify-between gap-2">
                      <p className="text-[#1a3a6b] text-xs">لديك حساب؟ سجّل دخولك لمتابعة دروسك</p>
                      <Link href="/login" className="text-[#1a3a6b] font-black text-xs hover:underline shrink-0">دخول ←</Link>
                    </div>
                  )}

                  {/* Vodafone Cash payment box */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💳</span>
                      <p className="font-black text-red-700 text-sm">الدفع عبر فودافون كاش</p>
                    </div>
                    {enrollCourse?.price && (
                      <p className="text-center font-black text-red-800 text-2xl">
                        {Number(enrollCourse.price).toLocaleString("ar-EG")} جنيه
                      </p>
                    )}
                    <p className="text-red-600 text-sm">
                      {enrollCourse?.price ? "حوّل المبلغ على رقم فودافون كاش:" : "حوّل رسوم الاشتراك على رقم فودافون كاش:"}
                    </p>
                    <p className="font-black text-red-800 text-lg tracking-widest text-center py-1" dir="ltr">
                      01007050667
                    </p>
                    <p className="text-red-500 text-xs">ثم أدخل رقم الإيصال في الحقل أدناه</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1.5">رقم إيصال الدفع <span className="text-gray-400 font-normal">(اختياري — أدخله بعد التحويل)</span></label>
                    <input
                      value={form.paymentRef}
                      onChange={(e) => setForm({ ...form, paymentRef: e.target.value })}
                      placeholder="مثال: 123456789"
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

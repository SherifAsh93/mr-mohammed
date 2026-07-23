"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JitsiSession from "@/components/JitsiSession";

type Session = { id: number; title: string; meetingLink: string; scheduledAt: string | null; };
type CourseEntry = {
  enrollment: { id: number; courseId: number; paymentRef: string | null; status: string };
  course: { id: number; title: string; subject: string; scheduleText: string | null };
  sessions: Session[];
};
type Material = { id: number; title: string; description: string | null; subject: string; type: string; url: string; };

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<{ id: number; name: string; phone: string } | null>(null);
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "materials">("courses");
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeSession, setActiveSession] = useState<{ roomName: string; title: string } | null>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push("/login"); return; }
        setStudent(data.student);
        setCourses(data.courses || []);
        setMaterials(data.materials || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/student/logout", { method: "POST" });
    router.push("/");
  }

  function formatDate(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleString("ar-EG", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]" dir="rtl">
      {/* Fullscreen Jitsi session overlay */}
      {activeSession && (
        <div className="fixed inset-0 z-[200] bg-[#0d2347] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a3a6b] shrink-0">
            <div>
              <p className="text-white font-black text-sm">🎥 {activeSession.title}</p>
              <p className="text-white/50 text-xs">أنت متصل كـ: {student?.name}</p>
            </div>
            <button
              onClick={() => setActiveSession(null)}
              className="text-white/70 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <JitsiSession
              roomName={activeSession.roomName}
              displayName={student?.name || "طالب"}
              onClose={() => setActiveSession(null)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs mb-0.5">مرحباً</p>
            <h1 className="text-white font-black text-xl">{student?.name} 👋</h1>
            <p className="text-white/50 text-xs mt-0.5" dir="ltr">{student?.phone}</p>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="text-white/60 text-xs hover:text-white transition-colors mt-1 bg-white/10 px-3 py-1.5 rounded-full"
          >
            {loggingOut ? "..." : "خروج"}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto flex gap-1 mt-5 bg-white/10 rounded-2xl p-1">
          {([
            { key: "courses", label: "دروسي" },
            { key: "materials", label: "المواد" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key ? "bg-white text-[#1a3a6b]" : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* MY COURSES TAB */}
        {activeTab === "courses" && (
          <>
            {/* Student guide */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
              <p className="font-black text-[#1a3a6b] text-sm">📖 كيف تدخل حصتك؟</p>
              <div className="space-y-1.5 text-xs text-blue-800">
                <p>• عند موعد الحصة، اضغط <span className="font-bold">🎥 دخول الحصة</span> — يفتح الفيديو، اضغط <span className="font-bold">Join meeting</span> للدخول.</p>
                <p>• تأكد أن الأستاذ قد بدأ الجلسة أولاً — ستدخل تلقائياً بعده.</p>
                <p>• الكاميرا والميكروفون اختياريان — يمكنك إيقافهما من داخل الحصة.</p>
                <p>• للخروج من الحصة اضغط ✕ في أعلى الشاشة.</p>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center space-y-4">
                <div className="text-5xl">📭</div>
                <p className="text-gray-500 font-bold">لا توجد دورات مؤكدة بعد</p>
                <p className="text-gray-400 text-sm">سجّل في دورة وانتظر تأكيد الأستاذ</p>
                <Link
                  href="/courses"
                  className="inline-block bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-2xl text-sm"
                >
                  تصفّح الدورات
                </Link>
              </div>
            ) : (
              courses.map(({ enrollment, course, sessions }) => (
                <div key={enrollment.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Course header */}
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-black text-[#1a3a6b] text-base">{course.title}</h2>
                        <p className="text-gray-400 text-xs mt-0.5">{course.subject}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        مؤكد ✓
                      </span>
                    </div>
                    {enrollment.paymentRef && (
                      <p className="text-green-600 text-xs mt-2 font-semibold">
                        💳 إيصال الدفع: <span dir="ltr">{enrollment.paymentRef}</span>
                      </p>
                    )}
                  </div>

                  {/* Sessions */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">الحصص</p>
                    {sessions.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-2">لا توجد حصص بعد</p>
                    ) : (
                      sessions.map(s => (
                        <div key={s.id} className="rounded-2xl border border-[#1a3a6b]/20 bg-[#f0f4ff] p-4 space-y-3">
                          <div>
                            <p className="font-bold text-[#1a3a6b] text-sm">{s.title}</p>
                            {s.scheduledAt && (
                              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                                🗓 {formatDate(s.scheduledAt)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setActiveSession({ roomName: s.meetingLink, title: s.title })}
                            className="w-full bg-[#1a3a6b] text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#122a52] transition-colors active:scale-95"
                          >
                            <span>🎥</span>
                            <span>دخول الحصة</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* MATERIALS TAB */}
        {activeTab === "materials" && (
          <>
            {/* Student guide */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="font-black text-amber-900 text-sm mb-1">📚 المواد الدراسية</p>
              <p className="text-xs text-amber-800">اضغط على أي ملف لفتحه أو تحميله. يضيف الأستاذ مواد جديدة بانتظام.</p>
            </div>

            {materials.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center space-y-3">
                <div className="text-5xl">📂</div>
                <p className="text-gray-500 font-bold">لا توجد مواد بعد</p>
                <p className="text-gray-400 text-sm">ستظهر المواد الدراسية هنا</p>
              </div>
            ) : (
              materials.map(m => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-[#1a3a6b]/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#eef1fb] rounded-xl flex items-center justify-center text-xl shrink-0">
                    {m.type === "pdf" ? "📄" : m.type === "video" ? "🎬" : "🔗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a3a6b] text-sm">{m.title}</p>
                    {m.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{m.description}</p>}
                    <p className="text-gray-300 text-xs mt-0.5">{m.subject}</p>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">←</span>
                </a>
              ))
            )}
          </>
        )}

        {/* Enroll CTA */}
        <div className="bg-[#1a3a6b] rounded-3xl p-5 text-white mt-2">
          <p className="font-black text-base mb-1">هل تريد الانضمام لدورة أخرى؟</p>
          <p className="text-white/60 text-sm mb-4">تصفّح الدورات المتاحة وسجّل الآن</p>
          <Link
            href="/courses"
            className="bg-white text-[#1a3a6b] font-bold text-sm px-5 py-2.5 rounded-2xl inline-block hover:bg-gray-50 transition-colors"
          >
            تصفّح الدورات →
          </Link>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

type Course = { id: number; title: string; subject: string };
type Session = { id: number; title: string; scheduledAt: string | null; courseId: number };
type AttendanceRecord = { enrollmentId: number; studentName: string; studentPhone: string; attendanceStatus: string };

export default function AdminAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : []));
  }, []);

  async function loadSessions(courseId: string) {
    setSelectedCourse(courseId);
    setSelectedSession("");
    setRecords([]);
    if (!courseId) return;
    const data = await fetch(`/api/sessions?courseId=${courseId}`).then(r => r.json());
    setSessions(Array.isArray(data) ? data : []);
  }

  async function loadAttendance(sessionId: string) {
    setSelectedSession(sessionId);
    setRecords([]);
    if (!sessionId) return;
    setLoading(true);
    try {
      const data = await fetch(`/api/attendance?sessionId=${sessionId}`).then(r => r.json());
      setRecords(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function toggle(enrollmentId: number) {
    setRecords(prev => prev.map(r =>
      r.enrollmentId === enrollmentId
        ? { ...r, attendanceStatus: r.attendanceStatus === "present" ? "absent" : "present" }
        : r
    ));
  }

  async function save() {
    if (!selectedSession) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: Number(selectedSession),
          records: records.map(r => ({ enrollmentId: r.enrollmentId, status: r.attendanceStatus })),
        }),
      });
      const data = await res.json();
      if (data.ok) setMsg("تم حفظ الحضور ✓");
      else setMsg("حدث خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("ar-EG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  const presentCount = records.filter(r => r.attendanceStatus === "present").length;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-[#1a3a6b]">📋 الحضور والغياب</h1>

      {/* Step 1: Choose course */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-black text-gray-400 uppercase tracking-wide">1 — اختر الدورة</p>
        <select
          value={selectedCourse}
          onChange={e => loadSessions(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
        >
          <option value="">-- اختر دورة --</option>
          {courses.map(c => (
            <option key={c.id} value={String(c.id)}>{c.title} — {c.subject}</option>
          ))}
        </select>
      </div>

      {/* Step 2: Choose session */}
      {selectedCourse && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wide">2 — اختر الحصة</p>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">لا توجد حصص لهذه الدورة</p>
          ) : (
            <select
              value={selectedSession}
              onChange={e => loadAttendance(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
            >
              <option value="">-- اختر حصة --</option>
              {sessions.map(s => (
                <option key={s.id} value={String(s.id)}>
                  {s.title}{s.scheduledAt ? ` — ${formatDate(s.scheduledAt)}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Step 3: Mark attendance */}
      {selectedSession && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wide">3 — تسجيل الحضور</p>
            {records.length > 0 && (
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                {presentCount} / {records.length} حاضر
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              لا يوجد طلاب مقبولون في هذه الدورة بعد
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {records.map(r => (
                  <div key={r.enrollmentId} className="px-4 py-3.5 flex items-center gap-3">
                    <button
                      onClick={() => toggle(r.enrollmentId)}
                      className={`w-10 h-10 rounded-full font-bold text-lg transition-all shrink-0 ${
                        r.attendanceStatus === "present"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {r.attendanceStatus === "present" ? "✓" : "✗"}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a3a6b] text-sm">{r.studentName}</p>
                      <p className="text-gray-400 text-xs" dir="ltr">{r.studentPhone}</p>
                    </div>
                    <span className={`text-xs font-bold ${r.attendanceStatus === "present" ? "text-green-600" : "text-gray-400"}`}>
                      {r.attendanceStatus === "present" ? "حاضر" : "غائب"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-50">
                {msg && <p className={`text-sm font-semibold mb-3 ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full bg-[#1a3a6b] text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-60 hover:bg-[#122a52] transition-colors"
                >
                  {saving ? "جاري الحفظ..." : "حفظ الحضور"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

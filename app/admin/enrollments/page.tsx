"use client";
import { useEffect, useState } from "react";

type Enrollment = { id: number; courseId: number; studentName: string; studentPhone: string; studentEmail: string | null; paymentRef: string | null; status: string; createdAt: string; };
type Course = { id: number; title: string; };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: "جديد", color: "bg-amber-100 text-amber-700" },
  approved: { label: "مقبول", color: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-600" },
};

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      fetch("/api/enrollments").then(r => r.json()),
      fetch("/api/courses").then(r => r.json()),
    ]).then(([e, c]) => { setEnrollments(Array.isArray(e) ? e : []); setCourses(Array.isArray(c) ? c : []); }).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: number, status: string) {
    await fetch(`/api/enrollments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذا التسجيل؟")) return;
    await fetch(`/api/enrollments/${id}`, { method: "DELETE" }); load();
  }

  const filtered = enrollments.filter(e =>
    (filterCourse === "all" || String(e.courseId) === filterCourse) &&
    (filterStatus === "all" || e.status === filterStatus)
  );

  const courseTitle = (id: number) => courses.find(c => c.id === id)?.title || `دورة #${id}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1a3a6b]">👥 التسجيلات</h1>
        <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1.5 rounded-full">{filtered.length}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
          <option value="all">كل الدورات</option>
          {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
          <option value="all">كل الحالات</option>
          <option value="pending">جديد</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">لا توجد تسجيلات بعد.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const st = STATUS_LABELS[e.status] || STATUS_LABELS.pending;
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a3a6b] text-sm">{e.studentName}</p>
                    <a href={`tel:${e.studentPhone}`} className="text-gray-400 text-xs" dir="ltr">{e.studentPhone}</a>
                    {e.studentEmail && <p className="text-gray-400 text-xs" dir="ltr">{e.studentEmail}</p>}
                    <p className="text-gray-400 text-xs mt-1">📚 {courseTitle(e.courseId)}</p>
                    {e.paymentRef
                      ? <p className="text-green-600 text-xs mt-0.5 font-semibold">💳 إيصال: <span dir="ltr">{e.paymentRef}</span></p>
                      : <p className="text-amber-500 text-xs mt-0.5">💳 لم يُرسل إيصال بعد</p>
                    }
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                  {e.status !== "approved" && (
                    <button onClick={() => setStatus(e.id, "approved")}
                      className="text-green-600 text-xs font-bold hover:underline">قبول</button>
                  )}
                  {e.status !== "rejected" && (
                    <button onClick={() => setStatus(e.id, "rejected")}
                      className="text-red-500 text-xs font-bold hover:underline">رفض</button>
                  )}
                  <a href={`https://wa.me/${e.studentPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="text-green-600 text-xs font-bold hover:underline mr-auto">💬 واتساب</a>
                  <button onClick={() => handleDelete(e.id)} className="text-gray-400 text-xs hover:text-red-500 hover:underline">حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

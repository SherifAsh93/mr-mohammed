"use client";
import { useEffect, useState } from "react";

type Enrollment = { id: number; courseId: number; paymentRef: string | null; status: string; createdAt: string; course: { title: string; price: string | null } | null; };
type Student = { id: number; name: string; phone: string; status: string; createdAt: string; enrollments: Enrollment[]; };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: "جديد", color: "bg-amber-100 text-amber-700" },
  approved: { label: "مقبول", color: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-600" },
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    fetch("/api/users").then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function setEnrollmentStatus(enrollmentId: number, status: string) {
    await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = students.filter(s =>
    !search || s.name.includes(search) || s.phone.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1a3a6b]">👤 الطلاب المسجّلون</h1>
        <span className="bg-blue-100 text-blue-700 font-bold text-sm px-3 py-1.5 rounded-full">{filtered.length}</span>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="بحث بالاسم أو الهاتف..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          {search ? "لا توجد نتائج" : "لا يوجد طلاب مسجّلون بعد."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Student info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#1a3a6b]">{s.name}</p>
                    <a href={`tel:${s.phone}`} className="text-gray-400 text-xs" dir="ltr">{s.phone}</a>
                  </div>
                  <a
                    href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                  >
                    💬 واتساب
                  </a>
                </div>
              </div>

              {/* Enrollments */}
              {s.enrollments.length === 0 ? (
                <div className="px-4 pb-4">
                  <p className="text-gray-400 text-xs">لا توجد تسجيلات</p>
                </div>
              ) : (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {s.enrollments.map(e => {
                    const st = STATUS_MAP[e.status] || STATUS_MAP.pending;
                    return (
                      <div key={e.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">
                              📚 {e.course?.title || `دورة #${e.courseId}`}
                            </p>
                            {e.course?.price && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                السعر: {Number(e.course.price).toLocaleString("ar-EG")} جنيه
                              </p>
                            )}
                            {e.paymentRef ? (
                              <p className="text-green-600 text-xs mt-1 font-semibold">
                                💳 إيصال: <span dir="ltr">{e.paymentRef}</span>
                              </p>
                            ) : (
                              <p className="text-amber-500 text-xs mt-1">⚠️ لم يُرسل إيصال بعد</p>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2">
                          {e.status !== "approved" && (
                            <button
                              onClick={() => setEnrollmentStatus(e.id, "approved")}
                              className="text-green-600 text-xs font-bold hover:underline"
                            >
                              ✓ قبول
                            </button>
                          )}
                          {e.status !== "rejected" && (
                            <button
                              onClick={() => setEnrollmentStatus(e.id, "rejected")}
                              className="text-red-500 text-xs font-bold hover:underline"
                            >
                              ✗ رفض
                            </button>
                          )}
                          {e.status === "approved" && (
                            <button
                              onClick={() => setEnrollmentStatus(e.id, "pending")}
                              className="text-gray-400 text-xs font-bold hover:underline"
                            >
                              إلغاء التأكيد
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

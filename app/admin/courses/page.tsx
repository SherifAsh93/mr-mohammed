"use client";
import { useEffect, useState } from "react";

type Course = { id: number; title: string; description: string | null; subject: string; scheduleText: string | null; status: string; maxStudents: number | null; price: string | null; };
type Session = { id: number; courseId: number; title: string; meetingLink: string; createdAt: string; };

const SUBJECTS = ["اللغة العربية", "التربية الإسلامية", "التجويد وعلوم القرآن", "النحو والصرف", "أخرى"];
const STATUSES = [{ value: "open", label: "مفتوح للتسجيل" }, { value: "upcoming", label: "قادم قريبًا" }, { value: "closed", label: "مكتمل / مغلق" }];
const EMPTY = { title: "", description: "", subject: "اللغة العربية", scheduleText: "", status: "open", maxStudents: "", price: "" };

export default function AdminCourses() {
  const [items, setItems] = useState<Course[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Sessions state
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Record<number, Session[]>>({});
  const [sessForm, setSessForm] = useState({ title: "", meetingLink: "" });
  const [sessLoading, setSessLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  function load() { fetch("/api/courses").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])); }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(""); }
  function openEdit(c: Course) {
    setForm({ title: c.title, description: c.description || "", subject: c.subject, scheduleText: c.scheduleText || "", status: c.status, maxStudents: String(c.maxStudents || ""), price: c.price || "" });
    setEditId(c.id); setShowForm(true); setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/courses/${editId}` : "/api/courses";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, maxStudents: form.maxStudents ? Number(form.maxStudents) : 0, price: form.price ? form.price : null }) });
      const data = await res.json();
      if (data.ok) { setMsg(editId ? "تم التعديل ✓" : "تمت الإضافة ✓"); setShowForm(false); load(); }
      else setMsg(data.error || "حدث خطأ");
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف الدورة؟ سيتم حذف كل التسجيلات والحصص المرتبطة بها.")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" }); load();
    if (expandedCourse === id) setExpandedCourse(null);
  }

  async function toggleSessions(courseId: number) {
    if (expandedCourse === courseId) { setExpandedCourse(null); return; }
    setExpandedCourse(courseId);
    setSessForm({ title: "", meetingLink: "" });
    if (!sessions[courseId]) {
      const data = await fetch(`/api/sessions?courseId=${courseId}`).then(r => r.json());
      setSessions(prev => ({ ...prev, [courseId]: Array.isArray(data) ? data : [] }));
    }
  }

  async function addSession(courseId: number) {
    if (!sessForm.title || !sessForm.meetingLink) return;
    setSessLoading(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, ...sessForm }) });
      const data = await res.json();
      if (data.ok) {
        setSessions(prev => ({ ...prev, [courseId]: [data.data, ...(prev[courseId] || [])] }));
        setSessForm({ title: "", meetingLink: "" });
      }
    } finally { setSessLoading(false); }
  }

  async function deleteSession(sessionId: number, courseId: number) {
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    setSessions(prev => ({ ...prev, [courseId]: prev[courseId].filter(s => s.id !== sessionId) }));
  }

  function copyLink(sessionId: number, link: string) {
    navigator.clipboard.writeText(link);
    setCopied(sessionId);
    setTimeout(() => setCopied(null), 2000);
  }

  const statusLabel = (s: string) => STATUSES.find(x => x.value === s)?.label || s;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1a3a6b]">🎓 الدورات</h1>
        <button onClick={openAdd} className="bg-[#1a3a6b] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors">+ دورة جديدة</button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل الدورة" : "دورة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">عنوان الدورة *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="مثال: دورة النحو الأساسية" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">وصف الدورة</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none"
                placeholder="اشرح ما سيتعلمه الطالب..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المادة *</label>
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الحالة</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الموعد</label>
                <input value={form.scheduleText} onChange={e => setForm({ ...form, scheduleText: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  placeholder="السبت 8 مساءً" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">السعر (جنيه)</label>
                <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  placeholder="150" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">عدد الطلاب (0 = غير محدد)</label>
              <input type="number" min="0" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="20" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="bg-[#1a3a6b] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors disabled:opacity-60">
                {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "إضافة الدورة"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">لا توجد دورات بعد.</div>
      ) : (
        <div className="space-y-3">
          {items.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Course header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1a3a6b] text-sm">{c.title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {c.subject}
                      {c.scheduleText ? ` · ${c.scheduleText}` : ""}
                      {c.price ? ` · ${Number(c.price).toLocaleString("ar-EG")} جنيه` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                    c.status === "open" ? "bg-green-100 text-green-700" :
                    c.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>{statusLabel(c.status)}</span>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => openEdit(c)} className="text-[#1a3a6b] text-xs font-bold hover:underline">تعديل</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 text-xs font-bold hover:underline">حذف</button>
                  <button onClick={() => toggleSessions(c.id)}
                    className="text-[#c9860a] text-xs font-bold hover:underline mr-auto flex items-center gap-1">
                    📎 الحصص {sessions[c.id] ? `(${sessions[c.id].length})` : ""}
                    <span className={`transition-transform ${expandedCourse === c.id ? "rotate-180" : ""}`}>▾</span>
                  </button>
                </div>
              </div>

              {/* Sessions panel */}
              {expandedCourse === c.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wide">روابط الحصص</p>

                  {/* Google Meet instructions */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-black text-blue-700">📹 إزاي تعمل رابط حصة على Google Meet</p>
                    <ol className="space-y-1.5 text-xs text-blue-600">
                      <li><span className="font-bold">1.</span> افتح تطبيق <span className="font-bold">Google Meet</span> على موبايلك (أو من <span dir="ltr" className="font-medium">meet.google.com</span>)</li>
                      <li><span className="font-bold">2.</span> اضغط <span className="font-bold">"اجتماع جديد"</span> ثم اختار <span className="font-bold">"إنشاء اجتماع لوقت لاحق"</span></li>
                      <li><span className="font-bold">3.</span> اضغط <span className="font-bold">"نسخ رابط الاجتماع"</span> ثم الصقه في الحقل أدناه</li>
                    </ol>
                    <p className="text-xs text-blue-500">✅ مجاني بلا حدود زمنية — حتى 100 طالب في نفس الوقت</p>
                  </div>

                  {/* Add session form */}
                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                    <input value={sessForm.title} onChange={e => setSessForm({ ...sessForm, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                      placeholder="اسم الحصة — اكتب أي شيء (مثال: الحصة الأولى، يوم السبت...)" />
                    <input value={sessForm.meetingLink} onChange={e => setSessForm({ ...sessForm, meetingLink: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                      placeholder="رابط الاجتماع (Teams / Meet / Zoom)" dir="ltr" />
                    <button onClick={() => addSession(c.id)} disabled={sessLoading || !sessForm.title || !sessForm.meetingLink}
                      className="w-full bg-[#1a3a6b] text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-[#122a52] transition-colors">
                      {sessLoading ? "جاري الإضافة..." : "+ إضافة حصة"}
                    </button>
                  </div>

                  {/* Sessions list */}
                  {!sessions[c.id] ? (
                    <p className="text-center text-gray-400 text-xs py-2">جاري التحميل...</p>
                  ) : sessions[c.id].length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-2">لا توجد حصص بعد — أضف أول رابط</p>
                  ) : (
                    <div className="space-y-2">
                      {sessions[c.id].map(s => (
                        <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1a3a6b] text-xs">{s.title}</p>
                            <p className="text-gray-400 text-xs truncate" dir="ltr">{s.meetingLink}</p>
                          </div>
                          <button onClick={() => copyLink(s.id, s.meetingLink)}
                            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                              copied === s.id ? "bg-green-100 text-green-700" : "bg-[#eef1fb] text-[#1a3a6b] hover:bg-[#1a3a6b] hover:text-white"
                            }`}>
                            {copied === s.id ? "تم النسخ ✓" : "نسخ"}
                          </button>
                          <button onClick={() => deleteSession(s.id, c.id)} className="shrink-0 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

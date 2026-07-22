"use client";
import { useEffect, useState } from "react";

type Course = { id: number; title: string; description: string | null; subject: string; scheduleText: string | null; status: string; maxStudents: number | null; price: string | null; };
type Session = { id: number; courseId: number; title: string; meetingLink: string; scheduledAt: string | null; recordedUrl: string | null; createdAt: string; };

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

  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Record<number, Session[]>>({});
  const [sessForm, setSessForm] = useState({ title: "", meetingLink: "", scheduledAt: "" });
  const [sessLoading, setSessLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [youtubeInput, setYoutubeInput] = useState<Record<number, string>>({});
  const [youtubeSaving, setYoutubeSaving] = useState<number | null>(null);
  const [editingRecording, setEditingRecording] = useState<Set<number>>(new Set());

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
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, maxStudents: form.maxStudents ? Number(form.maxStudents) : 0, price: form.price || null }) });
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
    setSessForm({ title: "", meetingLink: "", scheduledAt: "" });
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
        setSessions(prev => ({ ...prev, [courseId]: [...(prev[courseId] || []), data.data] }));
        setSessForm({ title: "", meetingLink: "", scheduledAt: "" });
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

  async function saveYoutubeUrl(sessionId: number, courseId: number, url: string) {
    if (!url.trim()) return;
    setYoutubeSaving(sessionId);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordedUrl: url.trim() }),
      });
      setSessions(prev => ({
        ...prev,
        [courseId]: prev[courseId].map(s => s.id === sessionId ? { ...s, recordedUrl: url.trim() } : s),
      }));
      setYoutubeInput(prev => ({ ...prev, [sessionId]: "" }));
      setEditingRecording(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
    } finally {
      setYoutubeSaving(null);
    }
  }

  function startEditRecording(sessionId: number, currentUrl: string | null) {
    setYoutubeInput(prev => ({ ...prev, [sessionId]: currentUrl || "" }));
    setEditingRecording(prev => new Set(prev).add(sessionId));
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("ar-EG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
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
                <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظة الموعد</label>
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

              {expandedCourse === c.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wide">الحصص</p>

                  {/* Google Meet instructions */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-black text-blue-700">📹 إزاي تعمل رابط حصة على Google Meet</p>
                    <ol className="space-y-1 text-xs text-blue-600">
                      <li><span className="font-bold">1.</span> افتح <span className="font-bold">Google Meet</span> أو <span dir="ltr" className="font-medium">meet.google.com</span></li>
                      <li><span className="font-bold">2.</span> اضغط <span className="font-bold">"اجتماع جديد"</span> ← <span className="font-bold">"إنشاء لوقت لاحق"</span></li>
                      <li><span className="font-bold">3.</span> انسخ الرابط والصقه أدناه</li>
                    </ol>
                    <p className="text-xs text-blue-500">✅ مجاني — حتى 100 طالب</p>
                  </div>

                  {/* Add session form */}
                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                    <input value={sessForm.title} onChange={e => setSessForm({ ...sessForm, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                      placeholder="اسم الحصة (مثال: الحصة الأولى، النحو — الفاعل)" />
                    <input value={sessForm.meetingLink} onChange={e => setSessForm({ ...sessForm, meetingLink: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                      placeholder="رابط الاجتماع" dir="ltr" />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ ووقت الحصة</label>
                      <input
                        type="datetime-local"
                        value={sessForm.scheduledAt}
                        onChange={e => setSessForm({ ...sessForm, scheduledAt: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                      />
                    </div>
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
                      {sessions[c.id].map(s => {
                        return (
                          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1a3a6b] text-xs">{s.title}</p>
                                {s.scheduledAt && (
                                  <p className="text-gray-400 text-xs mt-0.5">🗓 {formatDate(s.scheduledAt)}</p>
                                )}
                                <p className="text-gray-300 text-xs truncate mt-0.5" dir="ltr">{s.meetingLink}</p>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => copyLink(s.id, s.meetingLink)}
                                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                                    copied === s.id ? "bg-green-100 text-green-700" : "bg-[#eef1fb] text-[#1a3a6b]"
                                  }`}>
                                  {copied === s.id ? "✓" : "نسخ"}
                                </button>
                                <button onClick={() => deleteSession(s.id, c.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none px-1">×</button>
                              </div>
                            </div>

                            {/* YouTube recording */}
                            <div className="border-t border-gray-50 pt-2">
                              {s.recordedUrl && !editingRecording.has(s.id) ? (
                                <div className="flex items-center gap-2">
                                  <a href={s.recordedUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                    ▶ يوتيوب — مشاهدة التسجيل
                                  </a>
                                  <button
                                    onClick={() => startEditRecording(s.id, s.recordedUrl)}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                  >
                                    تغيير
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={youtubeInput[s.id] || ""}
                                    onChange={e => setYoutubeInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                                    placeholder="رابط يوتيوب — https://youtube.com/watch?v=..."
                                    dir="ltr"
                                    className="flex-1 border border-dashed border-red-200 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-red-400 placeholder:text-gray-300"
                                  />
                                  <button
                                    disabled={!youtubeInput[s.id]?.trim() || youtubeSaving === s.id}
                                    onClick={() => saveYoutubeUrl(s.id, c.id, youtubeInput[s.id] || "")}
                                    className="text-xs font-bold px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors whitespace-nowrap"
                                  >
                                    {youtubeSaving === s.id ? "..." : "💾 حفظ"}
                                  </button>
                                  {editingRecording.has(s.id) && (
                                    <button
                                      onClick={() => { setEditingRecording(prev => { const n = new Set(prev); n.delete(s.id); return n; }); }}
                                      className="text-xs text-gray-400 hover:text-gray-600 px-2"
                                    >
                                      إلغاء
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

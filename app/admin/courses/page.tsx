"use client";
import { useEffect, useRef, useState } from "react";

type Course = { id: number; title: string; description: string | null; subject: string; scheduleText: string | null; status: string; maxStudents: number | null; price: string | null; };
type Session = { id: number; courseId: number; title: string; meetingLink: string; scheduledAt: string | null; recordedUrl: string | null; createdAt: string; };

const SUBJECTS = ["اللغة العربية", "التربية الإسلامية", "التجويد وعلوم القرآن", "النحو والصرف", "أخرى"];
const STATUSES = [{ value: "open", label: "مفتوح للتسجيل" }, { value: "upcoming", label: "قادم قريبًا" }, { value: "closed", label: "مكتمل / مغلق" }];
const EMPTY = { title: "", description: "", subject: "اللغة العربية", scheduleText: "", status: "open", maxStudents: "", price: "" };
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
  const [uploadingSession, setUploadingSession] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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

  async function uploadRecording(sessionId: number, courseId: number, file: File) {
    if (!CLOUD || !PRESET) { alert("إعدادات التخزين غير مكتملة"); return; }
    setUploadingSession(sessionId);
    setUploadProgress(prev => ({ ...prev, [sessionId]: 0 }));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", PRESET);
    fd.append("resource_type", "video");

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(prev => ({ ...prev, [sessionId]: Math.round((e.loaded / e.total) * 100) }));
        }
      };
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/video/upload`);
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(xhr.responseText));
        };
        xhr.onerror = reject;
        xhr.send(fd);
      });

      // Save URL to DB
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordedUrl: result.secure_url }),
      });

      setSessions(prev => ({
        ...prev,
        [courseId]: prev[courseId].map(s => s.id === sessionId ? { ...s, recordedUrl: result.secure_url } : s),
      }));
    } catch (err) {
      alert("فشل رفع الملف، حاول مرة أخرى");
      console.error(err);
    } finally {
      setUploadingSession(null);
      setUploadProgress(prev => { const n = { ...prev }; delete n[sessionId]; return n; });
    }
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
                        const isUploading = uploadingSession === s.id;
                        const progress = uploadProgress[s.id];
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

                            {/* Upload recording */}
                            <div className="border-t border-gray-50 pt-2">
                              {s.recordedUrl ? (
                                <div className="flex items-center gap-2">
                                  <a href={s.recordedUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                    ▶ تسجيل الحصة
                                  </a>
                                  <button
                                    onClick={() => fileInputRefs.current[s.id]?.click()}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                  >
                                    استبدال
                                  </button>
                                </div>
                              ) : isUploading ? (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>جاري الرفع...</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="bg-gray-100 rounded-full h-2">
                                    <div className="bg-[#1a3a6b] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => fileInputRefs.current[s.id]?.click()}
                                  className="w-full border border-dashed border-gray-300 text-gray-400 hover:border-[#1a3a6b] hover:text-[#1a3a6b] text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  📤 رفع تسجيل الحصة
                                </button>
                              )}
                              <input
                                ref={el => { fileInputRefs.current[s.id] = el; }}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadRecording(s.id, c.id, file);
                                  e.target.value = "";
                                }}
                              />
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

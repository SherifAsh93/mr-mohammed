"use client";
import { useEffect, useState } from "react";

type Result = { id: number; studentName: string; studentCode: string | null; subject: string; examName: string; score: string; maxScore: string; };

const SUBJECTS = ["اللغة العربية", "التربية الإسلامية", "التجويد وعلوم القرآن", "النحو والصرف", "أخرى"];
const EMPTY = { studentName: "", studentCode: "", subject: "اللغة العربية", examName: "", score: "", maxScore: "100" };

export default function AdminResults() {
  const [items, setItems] = useState<Result[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  function load() { fetch("/api/results").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])); }
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => !search || i.studentName.includes(search) || (i.studentCode || "").includes(search));

  function openAdd() { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(""); }
  function openEdit(item: Result) {
    setForm({ studentName: item.studentName, studentCode: item.studentCode || "", subject: item.subject, examName: item.examName, score: item.score, maxScore: item.maxScore });
    setEditId(item.id); setShowForm(true); setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/results/${editId}` : "/api/results";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, score: parseFloat(form.score), maxScore: parseFloat(form.maxScore) }) });
      const data = await res.json();
      if (data.ok) { setMsg(editId ? "تم التعديل ✓" : "تمت الإضافة ✓"); setShowForm(false); load(); }
      else setMsg(data.error || "حدث خطأ");
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه النتيجة؟")) return;
    await fetch(`/api/results/${id}`, { method: "DELETE" }); load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1a3a6b]">📊 نتائج الطلاب</h1>
        <button onClick={openAdd} className="bg-[#c9860a] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b8760a] transition-colors">+ إضافة نتيجة</button>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="بحث باسم الطالب أو الكود..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل النتيجة" : "نتيجة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">اسم الطالب *</label>
                <input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الكود (اختياري)</label>
                <input value={form.studentCode} onChange={e => setForm({ ...form, studentCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="2025001" />
              </div>
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
                <label className="block text-xs font-bold text-gray-500 mb-1">الامتحان *</label>
                <input required value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="امتحان الشهر الأول" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الدرجة *</label>
                <input required type="number" min="0" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="85" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">من *</label>
                <input required type="number" min="1" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="100" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-[#c9860a] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#b8760a] transition-colors disabled:opacity-60">
                {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "إضافة"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          {items.length === 0 ? "لا توجد نتائج بعد." : "لا نتائج مطابقة."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const pct = (parseFloat(item.score) / parseFloat(item.maxScore)) * 100;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a3a6b] text-sm">{item.studentName}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.subject} · {item.examName}</p>
                  {item.studentCode && <p className="text-gray-400 text-xs">{item.studentCode}</p>}
                </div>
                <span className={`text-sm font-black px-3 py-1.5 rounded-xl shrink-0 ${
                  pct >= 85 ? "bg-green-100 text-green-700" :
                  pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                }`}>{item.score}/{item.maxScore}</span>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="text-[#1a3a6b] text-xs font-bold hover:underline">تعديل</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 text-xs font-bold hover:underline">حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

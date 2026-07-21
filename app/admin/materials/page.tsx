"use client";
import { useEffect, useState } from "react";

type Material = { id: number; title: string; description: string | null; subject: string; type: string; url: string; };

const SUBJECTS = ["اللغة العربية", "التربية الإسلامية", "التجويد وعلوم القرآن", "النحو والصرف", "أخرى"];
const TYPES = [{ value: "pdf", label: "PDF" }, { value: "video", label: "فيديو" }, { value: "note", label: "ملاحظات" }, { value: "link", label: "رابط" }];
const EMPTY = { title: "", description: "", subject: "اللغة العربية", type: "link", url: "" };

export default function AdminMaterials() {
  const [items, setItems] = useState<Material[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function load() { fetch("/api/materials").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])); }
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(""); }
  function openEdit(item: Material) {
    setForm({ title: item.title, description: item.description || "", subject: item.subject, type: item.type, url: item.url });
    setEditId(item.id); setShowForm(true); setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/materials/${editId}` : "/api/materials";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) { setMsg(editId ? "تم التعديل ✓" : "تمت الإضافة ✓"); setShowForm(false); load(); }
      else setMsg(data.error || "حدث خطأ");
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه المادة؟")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" }); load();
  }

  const typeLabel = (t: string) => TYPES.find(x => x.value === t)?.label || t;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1a3a6b]">📚 المواد التعليمية</h1>
        <button onClick={openAdd} className="bg-[#1a3a6b] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors">+ إضافة مادة</button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل المادة" : "مادة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">العنوان *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="مثال: شرح باب الفاعل" />
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
                <label className="block text-xs font-bold text-gray-500 mb-1">النوع</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الرابط *</label>
              <input required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="https://drive.google.com/..." dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">وصف (اختياري)</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none"
                placeholder="وصف مختصر" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-[#1a3a6b] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors disabled:opacity-60">
                {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "إضافة"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">لا توجد مواد بعد.</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="font-bold text-[#1a3a6b] text-sm hover:underline">{item.title}</a>
                <p className="text-gray-400 text-xs mt-0.5">{item.subject} · {typeLabel(item.type)}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => openEdit(item)} className="text-[#1a3a6b] text-xs font-bold hover:underline">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 text-xs font-bold hover:underline">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

type Material = {
  id: number;
  title: string;
  description: string | null;
  grade: string;
  subject: string;
  type: string;
  url: string;
};

const EMPTY: Omit<Material, "id"> = {
  title: "",
  description: "",
  grade: "",
  subject: "رياضيات",
  type: "link",
  url: "",
};

const GRADES = ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];
const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "فيديو" },
  { value: "note", label: "ملاحظات" },
  { value: "link", label: "رابط" },
];

export default function AdminMaterials() {
  const [items, setItems] = useState<Material[]>([]);
  const [form, setForm] = useState<Omit<Material, "id">>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/materials").then((r) => r.json()).then(setItems);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(item: Material) {
    setForm({ title: item.title, description: item.description || "", grade: item.grade, subject: item.subject, type: item.type, url: item.url });
    setEditId(item.id);
    setShowForm(true);
    setMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/materials/${editId}` : "/api/materials";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) {
        setMsg(editId ? "تم التعديل ✓" : "تمت الإضافة ✓");
        setShowForm(false);
        load();
      } else {
        setMsg(data.error || "حدث خطأ");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1a3a6b]">📚 المواد التعليمية</h1>
        <button onClick={openAdd} className="bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors">
          + إضافة مادة
        </button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل المادة" : "إضافة مادة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">العنوان *</label>
              <input
                required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="مثال: مذكرة الفصل الأول — الدوال"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الصف *</label>
              <select
                required value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
              >
                <option value="">اختر الصف</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الموضوع *</label>
              <input
                required value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="مثال: رياضيات"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">النوع</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الرابط *</label>
              <input
                required value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">وصف (اختياري)</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none"
                placeholder="وصف مختصر للمادة"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-[#1a3a6b] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#122a52] transition-colors disabled:opacity-60">
                {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "إضافة"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">لا توجد مواد بعد. أضف أول مادة!</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-gray-600">العنوان</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 hidden sm:table-cell">الصف</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 hidden md:table-cell">النوع</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a3a6b] hover:underline">
                      {item.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.grade}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-[#1a3a6b] hover:underline text-xs font-semibold">تعديل</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs font-semibold">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

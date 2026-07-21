"use client";
import { useEffect, useState } from "react";

type Result = {
  id: number;
  studentName: string;
  studentCode: string | null;
  grade: string;
  subject: string;
  examName: string;
  score: string;
  maxScore: string;
};

const EMPTY = {
  studentName: "",
  studentCode: "",
  grade: "",
  subject: "رياضيات",
  examName: "",
  score: "",
  maxScore: "100",
};

const GRADES = ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];

export default function AdminResults() {
  const [items, setItems] = useState<Result[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  function load() {
    fetch("/api/results").then((r) => r.json()).then(setItems);
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter(
    (i) => !search || i.studentName.includes(search) || (i.studentCode || "").includes(search)
  );

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(item: Result) {
    setForm({
      studentName: item.studentName,
      studentCode: item.studentCode || "",
      grade: item.grade,
      subject: item.subject,
      examName: item.examName,
      score: item.score,
      maxScore: item.maxScore,
    });
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
      const url = editId ? `/api/results/${editId}` : "/api/results";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score: parseFloat(form.score), maxScore: parseFloat(form.maxScore) }),
      });
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
    await fetch(`/api/results/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-[#1a3a6b]">📊 نتائج الطلاب</h1>
        <button onClick={openAdd} className="bg-[#d4a017] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b8860f] transition-colors">
          + إضافة نتيجة
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="بحث باسم الطالب أو الكود..."
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
      />

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل النتيجة" : "إضافة نتيجة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">اسم الطالب *</label>
              <input required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="الاسم الكامل" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الكود (اختياري)</label>
              <input value={form.studentCode} onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="مثال: 2025001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الصف *</label>
              <select required value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white">
                <option value="">اختر الصف</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الموضوع *</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="رياضيات" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الامتحان *</label>
              <input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="مثال: امتحان شهر أكتوبر" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">الدرجة *</label>
                <input required type="number" min="0" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="85" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">من *</label>
                <input required type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="100" />
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-[#d4a017] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b8860f] transition-colors disabled:opacity-60">
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
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">{items.length === 0 ? "لا توجد نتائج بعد." : "لا توجد نتائج مطابقة للبحث."}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-gray-600">الطالب</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 hidden sm:table-cell">الصف</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 hidden md:table-cell">الامتحان</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">الدرجة</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const pct = (parseFloat(item.score) / parseFloat(item.maxScore)) * 100;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{item.studentName}</div>
                      {item.studentCode && <div className="text-gray-400 text-xs">{item.studentCode}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.grade}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.examName}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                        pct >= 85 ? "bg-green-100 text-green-700" :
                        pct >= 60 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {item.score}/{item.maxScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="text-[#1a3a6b] hover:underline text-xs font-semibold">تعديل</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs font-semibold">حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

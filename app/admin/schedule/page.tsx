"use client";
import { useEffect, useState } from "react";

type Entry = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  grade: string;
  groupName: string | null;
  location: string | null;
};

const EMPTY = {
  day: "السبت",
  startTime: "",
  endTime: "",
  grade: "",
  groupName: "",
  location: "",
};

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const GRADES = ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];

export default function AdminSchedule() {
  const [items, setItems] = useState<Entry[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/schedule").then((r) => r.json()).then(setItems);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    setMsg("");
  }

  function openEdit(item: Entry) {
    setForm({
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      grade: item.grade,
      groupName: item.groupName || "",
      location: item.location || "",
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
      const url = editId ? `/api/schedule/${editId}` : "/api/schedule";
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
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-[#1a3a6b]">🗓️ جدول الحصص</h1>
        <button onClick={openAdd} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors">
          + إضافة حصة
        </button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1a3a6b] mb-4">{editId ? "تعديل الحصة" : "إضافة حصة جديدة"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">اليوم *</label>
              <select required value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">الصف *</label>
              <select required value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">اختر الصف</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">من (الوقت) *</label>
              <input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">إلى (الوقت) *</label>
              <input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">المجموعة (اختياري)</label>
              <input value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: المجموعة أ" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">المكان (اختياري)</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: المنزل / قاعة الإبداع" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-60">
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
          <div className="text-center py-16 text-gray-400">لا توجد حصص بعد. أضف أول حصة!</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-gray-600">اليوم</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">الوقت</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">الصف</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 hidden md:table-cell">المجموعة</th>
                <th className="px-4 py-3 text-right font-bold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-[#1a3a6b]">{item.day}</td>
                  <td className="px-4 py-3 text-gray-600">{item.startTime} – {item.endTime}</td>
                  <td className="px-4 py-3 text-gray-600">{item.grade}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{item.groupName || "—"}</td>
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

"use client";
import { useState } from "react";

export default function AdminSettings() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (form.newPassword !== form.confirmPassword) {
      setMsg("كلمة المرور الجديدة وتأكيدها غير متطابقتين");
      setIsError(true);
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg("كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)");
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("تم تغيير كلمة المرور بنجاح ✓");
        setIsError(false);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMsg(data.error || "حدث خطأ");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-black text-[#1a3a6b]">⚙️ الإعدادات</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-[#1a3a6b] mb-1">تغيير كلمة المرور</h2>
        <p className="text-gray-400 text-sm mb-6">بعد الحفظ، كلمة المرور القديمة لن تعمل</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">كلمة المرور الحالية *</label>
            <input
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">كلمة المرور الجديدة *</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">تأكيد كلمة المرور الجديدة *</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
              placeholder="••••••"
            />
          </div>

          {msg && (
            <p className={`text-sm font-semibold ${isError ? "text-red-500" : "text-green-600"}`}>{msg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a3a6b] hover:bg-[#122a52] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>تنبيه:</strong> احتفظ بكلمة المرور الجديدة في مكان آمن. إذا نسيتها، ستحتاج لتدخل تقني لإعادة تعيينها.
      </div>
    </div>
  );
}

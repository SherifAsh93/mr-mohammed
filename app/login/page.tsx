"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) window.location.href = "/dashboard";
      else setError(data.error || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-14 pb-10 text-center text-white">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-2xl font-black">دروس الأستاذ محمد</h1>
        <p className="text-white/60 text-sm mt-1">سجّل دخولك للوصول إلى دروسك</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
        <h2 className="text-xl font-black text-[#1a3a6b] mb-6">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">رقم الهاتف</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">كلمة المرور</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a3a6b] text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-blue-900/20 mt-2"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-[#1a3a6b] font-bold hover:underline">
            سجّل الآن
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

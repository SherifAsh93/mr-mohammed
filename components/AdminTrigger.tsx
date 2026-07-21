"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminTrigger() {
  const router = useRouter();
  const clickCountRef = useRef(0);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    clickCountRef.current += 1;
    const next = clickCountRef.current;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 1500);

    if (next >= 3) {
      clickCountRef.current = 0;
      setShowModal(true);
      setPassword("");
      setError("");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("admin_token", data.token);
        setShowModal(false);
        router.push("/admin");
      } else {
        setError("كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Logo — click 3 times to open admin */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 select-none cursor-pointer"
        aria-label="الشعار"
      >
        <div className="w-9 h-9 rounded-full bg-[#d4a017] flex items-center justify-center font-black text-white text-base">
          م
        </div>
        <span className="text-white font-bold text-lg hidden sm:block">أ. محمد</span>
      </button>

      {/* Admin login modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1a3a6b] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1a3a6b]">دخول المدرس</h2>
              <p className="text-sm text-gray-500 mt-1">أدخل كلمة المرور للدخول للوحة التحكم</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                autoFocus
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a6b] hover:bg-[#122a52] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

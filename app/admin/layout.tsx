"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: "🏠" },
  { href: "/admin/materials", label: "المواد", icon: "📚" },
  { href: "/admin/results", label: "النتائج", icon: "📊" },
  { href: "/admin/schedule", label: "الجدول", icon: "🗓️" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/");
    } else {
      setAuthed(true);
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    router.push("/");
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1a3a6b] text-white min-h-screen fixed top-0 right-0 z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center font-black text-lg">م</div>
            <div>
              <p className="font-bold text-sm">أ. محمد</p>
              <p className="text-white/50 text-xs">لوحة التحكم</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === item.href ? "bg-[#d4a017] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-2 transition-colors">
            <span>🌐</span> الموقع العام
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-right text-white/60 hover:text-red-400 text-sm transition-colors flex items-center gap-2"
          >
            <span>🚪</span> خروج
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSideOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute top-0 right-0 h-full w-64 bg-[#1a3a6b] text-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#d4a017] flex items-center justify-center font-black">م</div>
                <p className="font-bold text-sm">أ. محمد</p>
              </div>
              <button onClick={() => setSideOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSideOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === item.href ? "bg-[#d4a017] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={handleLogout} className="text-white/60 hover:text-red-400 text-sm flex items-center gap-2">
                <span>🚪</span> خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:mr-60">
        {/* Top bar mobile */}
        <div className="md:hidden flex items-center justify-between bg-[#1a3a6b] text-white px-4 h-14 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center font-black text-sm">م</div>
            <span className="font-bold text-sm">لوحة التحكم</span>
          </div>
          <button onClick={() => setSideOpen(true)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

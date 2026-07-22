"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "الرئيسية", icon: "🏠" },
  { href: "/admin/courses", label: "الدورات", icon: "🎓" },
  { href: "/admin/students", label: "الطلاب", icon: "👤" },
  { href: "/admin/enrollments", label: "التسجيلات", icon: "👥" },
  { href: "/admin/attendance", label: "الحضور", icon: "📋" },
  { href: "/admin/materials", label: "المواد", icon: "📚" },
  { href: "/admin/results", label: "النتائج", icon: "📊" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("admin_token")) router.replace("/");
    else setAuthed(true);
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    router.push("/");
  }

  if (!authed) return null;

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#c9860a] flex items-center justify-center font-black text-white text-lg shrink-0">م</div>
        <div>
          <p className="font-bold text-sm text-white">أ. محمد</p>
          <p className="text-white/40 text-xs">لوحة التحكم</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSideOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              pathname === item.href ? "bg-[#c9860a] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <span>🌐</span> الموقع العام
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/50 hover:text-red-400 text-sm transition-colors w-full">
          <span>🚪</span> تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1a3a6b] fixed top-0 right-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSideOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute top-0 right-0 h-full w-64 bg-[#1a3a6b] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span className="text-white font-bold">القائمة</span>
              <button onClick={() => setSideOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:mr-60 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-[#1a3a6b] text-white px-4 h-14 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c9860a] flex items-center justify-center font-black text-sm">م</div>
            <span className="font-bold text-sm">لوحة التحكم</span>
          </div>
          <button onClick={() => setSideOpen(true)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">{children}</div>
      </div>
    </div>
  );
}

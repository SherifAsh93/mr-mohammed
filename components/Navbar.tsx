"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminTrigger from "./AdminTrigger";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/materials", label: "المواد التعليمية" },
  { href: "/schedule", label: "الجدول" },
  { href: "/results", label: "النتائج" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1a3a6b] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <AdminTrigger />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === l.href
                  ? "bg-[#d4a017] text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-[#122a52] px-4 pb-4 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                pathname === l.href
                  ? "bg-[#d4a017] text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

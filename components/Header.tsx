"use client";
import AdminTrigger from "./AdminTrigger";

export default function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-[#1a3a6b] shadow-md">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <AdminTrigger />
        {title && (
          <span className="text-white/80 text-sm font-semibold">{title}</span>
        )}
      </div>
    </header>
  );
}

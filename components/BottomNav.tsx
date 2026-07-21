"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: HomeIcon, label: "الرئيسية" },
  { href: "/courses", icon: CoursesIcon, label: "الدورات" },
  { href: "/materials", icon: MaterialsIcon, label: "المواد" },
  { href: "/results", icon: ResultsIcon, label: "النتائج" },
  { href: "/contact", icon: ContactIcon, label: "تواصل" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="bottom-nav fixed bottom-0 inset-x-0 z-50 border-t border-gray-200/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ height: "var(--bottom-nav-h)" }}
    >
      <div className="h-full max-w-lg mx-auto flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${
                active ? "text-[#1a3a6b]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`transition-all ${active ? "scale-110" : ""}`}>
                <tab.icon active={active} />
              </div>
              <span className={`text-[10px] font-bold transition-all ${active ? "text-[#1a3a6b]" : "text-gray-400"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1a3a6b]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "fill-[#1a3a6b]" : "fill-none stroke-gray-400"}`} viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      }
    </svg>
  );
}
function CoursesIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "fill-[#1a3a6b]" : "fill-none stroke-gray-400"}`} viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      }
    </svg>
  );
}
function MaterialsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "fill-[#1a3a6b]" : "fill-none stroke-gray-400"}`} viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      }
    </svg>
  );
}
function ResultsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "fill-[#1a3a6b]" : "fill-none stroke-gray-400"}`} viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      }
    </svg>
  );
}
function ContactIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "fill-[#1a3a6b]" : "fill-none stroke-gray-400"}`} viewBox="0 0 24 24" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      }
    </svg>
  );
}

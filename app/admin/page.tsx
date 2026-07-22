"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, materials: 0, results: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then(r => r.json()),
      fetch("/api/enrollments").then(r => r.json()),
      fetch("/api/materials").then(r => r.json()),
      fetch("/api/results").then(r => r.json()),
    ]).then(([c, e, m, r]) => setStats({
      courses: Array.isArray(c) ? c.length : 0,
      enrollments: Array.isArray(e) ? e.length : 0,
      materials: Array.isArray(m) ? m.length : 0,
      results: Array.isArray(r) ? r.length : 0,
    }));
  }, []);

  const cards = [
    { label: "الدورات", value: stats.courses, icon: "🎓", href: "/admin/courses", color: "border-blue-100 text-blue-700 bg-blue-50" },
    { label: "المسجّلون", value: stats.enrollments, icon: "👥", href: "/admin/enrollments", color: "border-green-100 text-green-700 bg-green-50" },
    { label: "المواد", value: stats.materials, icon: "📚", href: "/admin/materials", color: "border-amber-100 text-amber-700 bg-amber-50" },
    { label: "النتائج", value: stats.results, icon: "📊", href: "/admin/results", color: "border-teal-100 text-teal-700 bg-teal-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1a3a6b]">مرحباً، أستاذ محمد 👋</h1>
        <p className="text-gray-400 text-sm mt-1">إليك ملخص سريع</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className={`bg-white rounded-2xl border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow ${c.color}`}>
            <span className="text-2xl">{c.icon}</span>
            <span className="text-3xl font-black">{c.value}</span>
            <span className="text-sm font-semibold">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-[#1a3a6b] mb-4 text-sm">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/courses" className="bg-[#1a3a6b] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#122a52] transition-colors">+ دورة جديدة</Link>
          <Link href="/admin/enrollments" className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">عرض التسجيلات</Link>
          <Link href="/admin/materials" className="bg-[#c9860a] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b8760a] transition-colors">+ مادة جديدة</Link>
          <Link href="/" target="_blank" className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">🌐 الموقع</Link>
        </div>
      </div>

      {/* Teacher Guide */}
      <details className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden">
        <summary className="px-5 py-4 cursor-pointer font-bold text-amber-800 text-sm flex items-center justify-between select-none list-none">
          <span>📖 دليل الأستاذ — كيف تبدأ</span>
          <span className="text-amber-400 text-xs font-normal">اضغط للعرض</span>
        </summary>
        <div className="px-5 pb-5 pt-1 space-y-3">
          {[
            { num: "١", title: "أضف دورة", body: 'من قسم "الدورات"، أنشئ دورة جديدة بعنوانها وموعدها وسعرها وحالتها.' },
            { num: "٢", title: "الطلاب يسجّلون", body: 'الطلاب يزورون الموقع، يختارون الدورة، ويضغطون "سجّل الآن" مع إرسال رقم إيصال الدفع.' },
            { num: "٣", title: "وافق على التسجيلات", body: 'من قسم "الطلاب"، راجع كل تسجيل، تحقق من إيصال الدفع، ثم اضغط قبول لتفعيل الطالب.' },
            { num: "٤", title: "أضف الحصص", body: 'من قسم "الدورات"، افتح الدورة واضغط "الحصص"، ثم أضف كل حصة برابطها وموعدها.' },
            { num: "٥", title: "أدر الحضور", body: 'بعد كل حصة، اذهب لقسم "الحضور"، اختر الدورة والحصة، وسجّل من حضر ومن غاب.' },
            { num: "٦", title: "أضف رابط التسجيل", body: 'بعد انتهاء الحصة ورفعها على يوتيوب، الصق رابط الفيديو في حقل "رابط التسجيل" بجانب الحصة.' },
          ].map(s => (
            <div key={s.num} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">{s.num}</span>
              <div>
                <p className="font-bold text-amber-900 text-sm">{s.title}</p>
                <p className="text-amber-700 text-xs leading-relaxed mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}
          <div className="bg-amber-100 rounded-xl p-3 mt-1">
            <p className="text-amber-800 text-xs font-semibold">💡 نصيحة: استخدم Jitsi Meet لعمل حصص فيديو مجانية بدون حساب Google — اضغط "الدورات" وشوف الإرشادات.</p>
          </div>
        </div>
      </details>
    </div>
  );
}

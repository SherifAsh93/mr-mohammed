import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const stats = [
  { value: "+500", label: "طالب" },
  { value: "+10", label: "سنوات خبرة" },
  { value: "3", label: "صفوف دراسية" },
  { value: "100%", label: "التزام بالنجاح" },
];

const features = [
  {
    icon: "📚",
    title: "مواد تعليمية",
    desc: "مذكرات ومقاطع فيديو وملفات PDF منظمة حسب الصف والموضوع.",
    href: "/materials",
  },
  {
    icon: "🗓️",
    title: "جدول الحصص",
    desc: "تعرف على مواعيد حصصك بسهولة — حسب الصف والمجموعة.",
    href: "/schedule",
  },
  {
    icon: "📊",
    title: "نتائج الطلاب",
    desc: "ابحث عن نتيجتك في الامتحانات الشهرية والتجريبية.",
    href: "/results",
  },
  {
    icon: "📞",
    title: "تواصل معنا",
    desc: "للاستفسارات والتسجيل — تواصل عبر واتساب أو اتصل مباشرة.",
    href: "/contact",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2347] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-[#d4a017] flex items-center justify-center text-5xl font-black mx-auto shadow-xl">
            م
          </div>
          <h1 className="text-4xl md:text-5xl font-black">أستاذ محمد</h1>
          <p className="text-xl text-white/80 font-medium">مدرس رياضيات — التعليم الثانوي</p>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
            أكثر من 10 سنوات في تدريس الرياضيات للمرحلة الثانوية. هنا تلاقي كل اللي تحتاجه — المواد والجدول والنتايج — في مكان واحد.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/materials"
              className="bg-[#d4a017] hover:bg-[#b8860f] text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg"
            >
              المواد التعليمية
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg border border-white/20"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4a017] py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center text-white">
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-sm font-semibold opacity-90">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-[#1a3a6b] text-center mb-10">كل اللي تحتاجه هنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 group"
              >
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-bold text-[#1a3a6b] text-lg group-hover:text-[#d4a017] transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f0f4ff] py-14 px-4 mt-auto">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-black text-[#1a3a6b]">مهتم بالانضمام؟</h2>
          <p className="text-gray-500">تواصل معنا الآن لمعرفة المجموعات المتاحة والمواعيد</p>
          <Link
            href="/contact"
            className="inline-block bg-[#1a3a6b] hover:bg-[#122a52] text-white font-bold px-10 py-3 rounded-xl transition-colors"
          >
            تواصل الآن
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

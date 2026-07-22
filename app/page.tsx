import Header from "@/components/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen page-bottom">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1a3a6b] via-[#1e4080] to-[#0d2347] text-white px-4 pt-10 pb-14">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#c9860a] flex items-center justify-center text-4xl font-black mx-auto shadow-lg ring-4 ring-white/20">
            م
          </div>
          <div>
            <h1 className="text-3xl font-black">أستاذ محمد</h1>
            <p className="text-white/70 mt-1 text-sm font-medium">معلم لغة عربية وتربية إسلامية</p>
            <p className="text-white/50 text-xs mt-0.5">خطيب مسجد</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
            دورات متخصصة في اللغة العربية والتربية الإسلامية — أونلاين، بأسلوب مبسط وميسّر.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#c9860a] hover:bg-[#b8760a] text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-900/30 active:scale-95 text-base"
          >
            استعرض الدورات
          </Link>
        </div>
      </section>

      {/* Quick tabs */}
      <section className="max-w-lg mx-auto w-full px-4 -mt-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/courses", emoji: "🎓", label: "الدورات", sub: "سجّل الآن", color: "bg-blue-50 border-blue-100" },
            { href: "/materials", emoji: "📚", label: "المواد", sub: "ملفات ومحاضرات", color: "bg-amber-50 border-amber-100" },
            { href: "/results", emoji: "📊", label: "النتائج", sub: "نتيجتك هنا", color: "bg-teal-50 border-teal-100" },
            { href: "/contact", emoji: "💬", label: "تواصل", sub: "واتساب ومزيد", color: "bg-green-50 border-green-100" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`${c.color} border rounded-2xl p-4 flex flex-col gap-1 active:scale-95 transition-all shadow-sm`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="font-bold text-[#1a3a6b] text-base">{c.label}</span>
              <span className="text-gray-400 text-xs">{c.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Student Getting Started Guide */}
      <section className="max-w-lg mx-auto w-full px-4 mt-5">
        <details className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden">
          <summary className="px-5 py-4 cursor-pointer font-bold text-[#1a3a6b] text-sm flex items-center justify-between select-none list-none">
            <span>🎓 كيف تبدأ؟ — خطوات التسجيل</span>
            <span className="text-blue-400 text-xs font-normal">اضغط للعرض</span>
          </summary>
          <div className="px-5 pb-5 pt-2 space-y-3">
            {[
              { step: "١", title: "اختر الدورة", body: 'اضغط "الدورات" أعلاه، اختر الدورة المناسبة واضغط "سجّل الآن".' },
              { step: "٢", title: "ادفع الرسوم", body: 'حوّل رسوم الاشتراك عبر فودافون كاش على الرقم المكتوب في نموذج التسجيل.' },
              { step: "٣", title: "أدخل رقم الإيصال", body: 'بعد التحويل، أدخل رقم الإيصال في الحقل المخصص لتسريع تأكيد التسجيل.' },
              { step: "٤", title: "انتظر تأكيد الأستاذ", body: 'سيتواصل معك الأستاذ خلال 24 ساعة لتأكيد تسجيلك.' },
              { step: "٥", title: "ادخل لوحة التحكم", body: 'بعد التأكيد، سجّل دخولك وستجد مواعيد الحصص وروابط الدخول في قسم "دروسي".' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                <div>
                  <p className="font-bold text-[#1a3a6b] text-sm">{s.title}</p>
                  <p className="text-blue-700 text-xs leading-relaxed mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* About strip */}
      <section className="max-w-lg mx-auto w-full px-4 mt-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-black text-[#1a3a6b] text-lg">نبذة عن الأستاذ</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            متخصص في تدريس اللغة العربية والتربية الإسلامية. يقدّم دروسًا أونلاين عبر الفيديو المباشر لمن يريد التعلم باحترافية من مكانه.
          </p>
          <div className="flex gap-3 text-sm">
            <span className="bg-[#f0f4ff] text-[#1a3a6b] font-semibold px-3 py-1.5 rounded-full">اللغة العربية</span>
            <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-full">التربية الإسلامية</span>
          </div>
        </div>
      </section>
    </div>
  );
}

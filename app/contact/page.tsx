import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contacts = [
  {
    icon: "💬",
    label: "واتساب",
    value: "تواصل عبر واتساب",
    href: "https://wa.me/201000000000",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    icon: "📞",
    label: "اتصال مباشر",
    value: "01000000000",
    href: "tel:+201000000000",
    color: "bg-[#1a3a6b] hover:bg-[#122a52]",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2347] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black mb-2">📞 تواصل معنا</h1>
          <p className="text-white/70">نرد في أسرع وقت ممكن</p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-8">
          <div>
            <div className="w-20 h-20 rounded-full bg-[#d4a017] flex items-center justify-center text-4xl font-black text-white mx-auto mb-4">
              م
            </div>
            <h2 className="text-2xl font-black text-[#1a3a6b]">أستاذ محمد</h2>
            <p className="text-gray-500 mt-1">مدرس رياضيات — التعليم الثانوي</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`${c.color} text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-400 text-sm">
              للتسجيل والاستفسار عن المجموعات والمواعيد — لا تتردد في التواصل
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

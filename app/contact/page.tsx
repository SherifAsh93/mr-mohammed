import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen page-bottom">
      <Header title="تواصل" />

      <div className="bg-gradient-to-b from-[#1a3a6b] to-[#1e4080] text-white px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black">📞 تواصل معنا</h1>
          <p className="text-white/60 text-sm mt-1">نرد في أقرب وقت ممكن</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#c9860a] flex items-center justify-center text-3xl font-black text-white">م</div>
          <div>
            <p className="font-black text-[#1a3a6b] text-lg">أستاذ محمد</p>
            <p className="text-gray-400 text-sm">معلم لغة عربية وتربية إسلامية</p>
          </div>
        </div>

        {/* WhatsApp */}
        <a
          href="https://wa.me/201007050667"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-green-500 active:bg-green-600 text-white rounded-2xl px-5 py-4 transition-all active:scale-95 shadow-md shadow-green-500/30"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.849L.057 23.886l6.198-1.626A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.785 9.785 0 01-4.992-1.37l-.358-.213-3.68.965.982-3.587-.234-.37A9.792 9.792 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
            </svg>
          </div>
          <div className="flex-1 text-right">
            <p className="font-bold text-base">واتساب</p>
            <p className="text-white/70 text-sm">راسلنا مباشرة</p>
          </div>
          <svg className="w-5 h-5 text-white/50 rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Phone */}
        <a
          href="tel:+201007050667"
          className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 transition-all active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#eef1fb] flex items-center justify-center shrink-0 text-[#1a3a6b]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex-1 text-right">
            <p className="font-bold text-[#1a3a6b] text-base">اتصال مباشر</p>
            <p className="text-gray-400 text-sm" dir="ltr">+20 100 705 0667</p>
          </div>
        </a>

        <p className="text-center text-gray-400 text-xs pt-2">
          للتسجيل في الدورات أو أي استفسار — لا تتردد في التواصل
        </p>
      </main>
    </div>
  );
}

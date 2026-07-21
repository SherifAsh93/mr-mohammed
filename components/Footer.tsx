export default function Footer() {
  return (
    <footer className="bg-[#1a3a6b] text-white/70 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
        <p className="text-white font-bold text-lg">أ. محمد</p>
        <p className="text-sm">مدرس رياضيات — التعليم الثانوي</p>
        <p className="text-xs mt-4">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}

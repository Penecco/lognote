import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 font-sans text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00b4d8]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-8 bg-white/50 backdrop-blur-md p-10 md:p-16 rounded-[40px] border border-white/50 shadow-xl max-w-lg w-full">
        <div className="flex justify-center">
          <div className="relative">
            <span className="text-8xl md:text-9xl font-black text-brand-pink drop-shadow-sm">404</span>
            <Sparkles className="absolute -top-4 -right-8 w-12 h-12 text-[#00b4d8] animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-brand-text">
            ページが見つからないにゃ！😿
          </h2>
          <p className="text-brand-text/70 font-bold leading-relaxed">
            アクセスしようとしたプロフィールは<br/>存在しないか、URLが間違っているみたいです。
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-pink text-white px-8 py-4 rounded-full font-black text-lg shadow-sm hover:bg-brand-pink/90 hover:-translate-y-1 transition-all active:scale-95 w-full md:w-auto"
          >
            <Home className="w-5 h-5" />
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

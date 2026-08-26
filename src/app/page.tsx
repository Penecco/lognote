"use client";

import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const handleLogin = async (provider: 'twitter' | 'discord' | 'google') => {
    // APIキーが設定されていない場合はアラートを出して進ませる（モック動作用）
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      alert(`【テスト動作】${provider}でログインしました！（※APIキー設定前のため、そのまま進みます）`);
      window.location.href = "/tutorial";
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/tutorial`,
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 font-sans relative">
      {/* うっすらとした装飾 */}
      <div className="absolute top-10 left-10 text-brand-sub/20">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 right-10 text-brand-sub/20">
        <Sparkles className="w-32 h-32" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-8 bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-[40px] shadow-sm border border-brand-sub/20 relative z-10">
        <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-2 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/lognote-logo.png" 
            alt="ろぐのーとロゴ" 
            className="w-full h-full object-contain drop-shadow-md scale-125"
          />
        </div>
        <h1 className="sr-only">
          ろぐのーと
        </h1>
        <p className="text-brand-text/70 font-bold text-lg leading-relaxed">
          テンプレートで簡単にプロフィールを作れます！<br />
          作成したページのリンクをVRCに貼って話のタネにしよう🌱<br />
          自由記述もできるので自分なりのプロフを作ってね！
        </p>
        
        <div className="pt-8 space-y-4 flex flex-col items-center">
          <button 
            onClick={() => handleLogin('twitter')}
            className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-black text-lg transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 shadow-md w-full sm:w-80"
          >
            𝕏 (Twitter) でログイン
          </button>
          
          <button 
            onClick={() => handleLogin('discord')}
            className="flex items-center justify-center gap-2 bg-[#5865F2] text-white px-8 py-4 rounded-full font-black text-lg transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 shadow-md w-full sm:w-80"
          >
            Discord でログイン
          </button>

        </div>
        
        <p className="text-xs text-brand-text/50 font-bold mt-8">
          ※不必要なデータや個人情報を取得することはありません。
        </p>
      </div>

      {/* 開発者紹介セクション */}
      <div className="max-w-2xl w-full mt-8 bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[40px] shadow-sm border border-brand-sub/20 relative z-10 text-center">
        <h2 className="text-sm md:text-base font-bold text-brand-text/50 mb-6 tracking-wider">Developed by</h2>
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/penecco.png" 
              alt="ペネッコ・ドカ・イーティング" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-brand-text">
            ペネッコ・ドカ・イーティング
          </h3>
          
          <p className="text-brand-text/80 font-bold text-sm md:text-base leading-relaxed">
            社会を生きる猫のVTuber🐱<br/>
            3Dアセットなどの制作も行っています！
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a href="https://x.com/pde_vtuber" target="_blank" rel="noopener noreferrer" className="text-brand-text/50 font-bold hover:text-black transition-colors">
              𝕏 (Twitter)
            </a>
            <a href="https://www.youtube.com/@penecco-doca-eating" target="_blank" rel="noopener noreferrer" className="text-brand-text/50 font-bold hover:text-red-500 transition-colors">
              YouTube
            </a>
            <a href="https://pde-vtuber.booth.pm" target="_blank" rel="noopener noreferrer" className="text-brand-text/50 font-bold hover:text-brand-pink transition-colors">
              BOOTH
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

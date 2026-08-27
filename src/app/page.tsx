"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // URLハッシュにエラーが含まれているかチェック
    if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = hashParams.get('error_description');
      if (errorDesc) {
        alert('ログインエラーが発生しました: ' + decodeURIComponent(errorDesc));
      }
    }

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', user.id)
            .single();
          
          if (data && data.user_id && isMounted) {
            router.replace('/mypage');
            return;
          } else if (isMounted) {
            router.replace('/tutorial');
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        checkUser();
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  const handleLogin = async (provider: 'twitter' | 'discord' | 'google') => {
    try {
      // APIキーが設定されていない場合はアラートを出して進ませる（モック動作用）
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        alert(`【テスト動作】${provider}でログインしました！（※APIキー設定前のため、そのまま進みます）`);
        window.location.href = "/tutorial";
        return;
      }

      // 確実に別のアカウントでログインできるように、既存のセッションを破棄する
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            prompt: 'consent', // アカウント選択画面を毎回強制表示させる
          },
        }
      });

      if (error) {
        alert("signInWithOAuthでエラー発生: " + error.message);
      }
    } catch (e: any) {
      alert("ログイン関数内で例外が発生しました: " + e.message);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
        <div className="text-brand-text/50 font-bold animate-pulse">ログイン状態を確認中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-lg w-full text-center space-y-5 bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[40px] shadow-sm border border-brand-sub/20 relative z-10">
        <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-2 flex items-center justify-center overflow-hidden">
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
        <p className="text-brand-text/70 font-bold text-sm md:text-base leading-relaxed">
          テンプレートで簡単にプロフィールを作れます！<br />
          作成したページのリンクをVRCに貼って話のタネにしよう🌱<br />
          自由記述もできるので自分なりのプロフを作ってね！
        </p>
        
        <div className="pt-4 space-y-3 flex flex-col items-center">
          <button 
            onClick={() => handleLogin('twitter')}
            className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-black text-sm md:text-base transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 shadow-md w-full sm:w-64"
          >
            𝕏 (Twitter) でログイン
          </button>
          
          <button 
            onClick={() => handleLogin('discord')}
            className="flex items-center justify-center gap-2 bg-[#5865F2] text-white px-5 py-2.5 rounded-full font-black text-sm md:text-base transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 shadow-md w-full sm:w-64"
          >
            Discord でログイン
          </button>

        </div>
        
        <p className="text-xs text-brand-text/50 font-bold mt-6">
          ※メールアドレスを登録しているアカウントでログインしてください。<br />
          ※不必要なデータや個人情報を取得することはありません。
        </p>
      </div>

      {/* 開発者紹介セクション */}
      <div className="max-w-lg w-full mt-6 bg-white/80 backdrop-blur-md p-5 md:p-8 rounded-[40px] shadow-sm border border-brand-sub/20 relative z-10 text-center">
        <h2 className="text-sm font-bold text-brand-text/50 mb-4 tracking-wider">Developed by</h2>
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-bg">
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

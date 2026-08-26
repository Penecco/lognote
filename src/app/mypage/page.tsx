"use client";

import Link from "next/link";
import { Share2, Edit3, AtSign, Copy, Check, ExternalLink, X, Home } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

function MyPageContent() {
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showTutorialPopup, setShowTutorialPopup] = useState(false);

  useEffect(() => {
    if (searchParams.get('tutorial') === 'done') {
      setShowTutorialPopup(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('user_id').eq('id', user.id).single();
        if (data && data.user_id) setUserId(data.user_id);
      }
    };
    fetchUser();
  }, []);

  const handleCopyLink = () => {
    const url = `${origin}/${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const closePopup = () => {
    setShowTutorialPopup(false);
    router.replace('/mypage');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-start pt-8 p-4 font-sans relative pb-12">
      <div className="max-w-sm md:max-w-md w-full text-center space-y-5 bg-white p-5 md:p-8 rounded-[28px] shadow-sm border border-brand-sub/20 mb-6">
        <h1 className="text-xl font-black text-brand-text mb-3">マイページ</h1>
        
        <div className="flex flex-col gap-3">
          <Link 
            href={`/${userId}`}
            className={`flex items-center justify-center gap-2 bg-brand-pink text-white border-2 border-brand-pink px-4 py-3 rounded-full font-black text-sm md:text-base transition-all hover:bg-brand-pink/90 hover:-translate-y-1 active:scale-95 shadow-sm w-full ${!userId ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Home className="w-5 h-5" /> 自分のページ
          </Link>

          <Link 
            href="/edit"
            className="flex items-center justify-center gap-2 bg-white text-brand-text border-2 border-brand-sub/50 px-4 py-3 rounded-full font-black text-sm md:text-base transition-all hover:bg-brand-hover hover:-translate-y-1 active:scale-95 shadow-sm w-full"
          >
            <Edit3 className="w-5 h-5" /> 編集
          </Link>
          
          <button 
            onClick={handleCopyLink}
            disabled={!userId}
            className="flex items-center justify-center gap-2 bg-white text-brand-text border-2 border-brand-sub/50 px-4 py-3 rounded-full font-black text-sm md:text-base transition-all hover:bg-brand-hover hover:-translate-y-1 active:scale-95 shadow-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-5 h-5 text-brand-pink" /> : <Copy className="w-5 h-5" />}
            {copied ? "コピーしたよ！" : "リンクをコピー"}
          </button>

          <a 
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`VRCのプロフィールを作りました⭐\n\nリンク先でぜひ見てみてね🐱\n\nみんなも作ってシェアしよう🐾\n\n#VRChatプロフみてみて #ろぐのーと\n`)}&url=${encodeURIComponent(origin + '/' + userId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-full font-black text-sm md:text-base transition-all hover:bg-black/80 hover:-translate-y-1 active:scale-95 shadow-sm w-full ${!userId ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <AtSign className="w-5 h-5" /> Xでシェア
          </a>
        </div>
      </div>

      {/* 姉妹サイト紹介 */}
      <div className="max-w-sm md:max-w-md w-full bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-brand-sub/20 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef]" />
        <h3 className="text-sm font-bold text-brand-text/50 mb-3">姉妹サイトもよろしければどうぞ！</h3>
        
        <div className="flex justify-center mt-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logdrop-logo.png" alt="ろぐどろっぷ" className="h-24 md:h-32 object-contain hover:scale-105 transition-transform duration-300" />
        </div>

        <p className="text-brand-text/80 font-bold text-xs md:text-sm leading-relaxed mb-5">
          VRChatのフレンドと今日の思い出をサクッと共有！<br/>
          ルームを作成して写真をシェアしましょう✨<br/>
          Vlog風動画の作成もできます！
        </p>
        <a 
          href="https://logdrop-penecco.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-[#00b4d8] text-white px-5 py-3 rounded-full font-black text-sm md:text-base shadow-md hover:bg-[#0096c7] hover:-translate-y-1 transition-all active:scale-95 w-full"
        >
          ろぐどろっぷを見てみる
        </a>
      </div>

      {/* チュートリアル完了ポップアップ */}
      {showTutorialPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-[40px] p-10 md:p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={closePopup} className="absolute top-6 right-6 text-brand-text/30 hover:text-brand-text/70 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="text-center space-y-6">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-text">プロフ作成完了！</h2>
              <p className="text-brand-text/80 font-bold text-lg md:text-xl leading-relaxed">
                基本のプロフィールが完成したよ！<br />
                もっと自分らしくカスタマイズしてみよう。
              </p>
              
              <div className="pt-8 space-y-4 flex flex-col">
                <Link 
                  href="/edit"
                  onClick={() => setShowTutorialPopup(false)}
                  className="bg-brand-pink text-white py-4 md:py-5 rounded-full font-black text-lg md:text-xl shadow-sm hover:bg-brand-pink/90 hover:-translate-y-1 transition-all border-2 border-brand-pink"
                >
                  もっとカスタマイズする
                </Link>
                <button 
                  onClick={closePopup}
                  className="bg-brand-card text-brand-text py-4 md:py-5 rounded-full font-black text-lg md:text-xl border-2 border-brand-sub/10 shadow-sm hover:bg-brand-sub/10 hover:-translate-y-1 transition-all"
                >
                  マイページへ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center font-bold text-brand-text/50 animate-pulse">読み込み中...</div>}>
      <MyPageContent />
    </Suspense>
  );
}

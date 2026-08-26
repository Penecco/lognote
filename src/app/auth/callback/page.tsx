"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // SupabaseがURLハッシュ（#access_token=...）を処理するのを待つ
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        // ログイン完了したら tutorial へ遷移
        router.push('/tutorial');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center font-bold text-brand-text/50 animate-pulse">
        ログイン処理中...
      </div>
    </div>
  );
}

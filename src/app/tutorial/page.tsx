"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/profile-form";
import ProfilePreview from "@/components/profile-preview";
import { defaultProfile, ProfileData } from "@/types/profile";
import { supabase } from "@/lib/supabase";

export default function Tutorial() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkExistingProfile = async () => {
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
          }
        }
      } catch (error) {
        console.error("Profile check error:", error);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    // 初期チェック
    checkExistingProfile();

    // OAuth直後などセッションが遅れて確立する場合に備える
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        checkExistingProfile();
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleComplete = async () => {
    if (isChecking) return;
    if (!profile.username || profile.username.trim() === "") {
      alert("ユーザー名は必須です！");
      return;
    }
    if (!profile.userId || profile.userId.trim() === "" || profile.userId.length < 3) {
      alert("ユーザーID（半角英数3文字以上）は必須です！");
      return;
    }

    try {
      setIsSaving(true);
      // 現在ログインしているユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("ログイン情報が見つかりません。もう一度ログインしてね！");
        return;
      }

      // Supabaseに保存する前にIDの重複チェック
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', profile.userId)
        .neq('id', user.id) // 自分のID以外で同じuser_idがないか
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingUser) {
        alert("そのユーザーIDは既に他の人に使われています！別のID（3文字以上）を入力してね🐾");
        setIsSaving(false);
        return;
      }

      // Supabaseに保存
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: profile.userId,
          username: profile.username,
          avatar_url: profile.avatarUrls && profile.avatarUrls.length > 0 ? profile.avatarUrls[0] : profile.avatarUrl,
          avatar_urls: profile.avatarUrls,
          cover_image: profile.coverImage,
          bg_image: profile.backgroundImage,
          gallery_images: profile.galleryImages,
          play_style: profile.playStyles,
          play_environments: profile.playEnvironments,
          join_policy: profile.joinPolicy,
          vrc_history: profile.vrcHistory,
          creatives: profile.creatives,
          active_time: profile.activeTimes,
          partner_status: profile.partnerStatus,
          bio: profile.bio,
          free_sections: profile.freeSections,
          custom_tags: profile.customTags,
          hobbies: profile.hobbies,
          groups: profile.groups,
          favorite_worlds: profile.favoriteWorlds,
          favorite_games: profile.favoriteGames,
          favorite_mangas: profile.favoriteMangas,
          favorite_animes: profile.favoriteAnimes,
          favorite_streamers: profile.favoriteStreamers,
          favorite_musics: profile.favoriteMusics,
          mbti: profile.mbti,
          real_life: profile.realLife,
          links: profile.links,
          is_searchable: profile.isSearchable,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      router.push("/mypage?tutorial=done");
    } catch (error) {
      console.error('Error saving profile:', error);
      alert("プロフィールの保存に失敗しました。もう一度試してね。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-brand-card">
        <div className="text-brand-text/50 font-bold animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-brand-card overflow-hidden font-sans relative">
      {/* タブナビゲーション (PC・モバイル共通) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-white border-t border-brand-sub/30 flex z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 flex flex-col items-center justify-center font-black text-base md:text-xl transition-all active:scale-95 ${activeTab === "form" ? "text-brand-text bg-brand-accent" : "text-brand-text/50"}`}
        >
          編集
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex flex-col items-center justify-center font-black text-base md:text-xl transition-all active:scale-95 ${activeTab === "preview" ? "text-brand-text bg-brand-accent" : "text-brand-text/50"}`}
        >
          プレビュー
        </button>
      </div>

      <div className={`flex-1 w-full overflow-y-auto pb-24 relative ${activeTab === 'form' ? 'bg-brand-card' : 'bg-brand-bg'}`}>
        {/* フォーム画面 */}
        <div className={`${activeTab === "form" ? "block" : "hidden"} w-full min-h-full`}>
          <ProfileForm profile={profile} setProfile={setProfile} isTutorial={true} />
          
          {/* 完了ボタン */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-brand-sub/20 flex justify-center z-40">
            <button 
              onClick={handleComplete}
              disabled={isSaving}
              className="w-full max-w-sm bg-brand-pink text-white border-2 border-brand-pink py-3 rounded-full font-black text-lg transition-all hover:bg-brand-pink/90 hover:-translate-y-1 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "保存中..." : "完成して次へ！"}
            </button>
          </div>
        </div>

        {/* プレビュー画面 */}
        <div className={`${activeTab === "preview" ? "block" : "hidden"} w-full min-h-full p-0 md:p-8`}>
          <ProfilePreview profile={profile} />
        </div>
      </div>
    </div>
  );
}

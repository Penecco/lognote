"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Save, Home } from "lucide-react";
import ProfileForm from "@/components/profile-form";
import ProfilePreview from "@/components/profile-preview";
import { defaultProfile, ProfileData } from "@/types/profile";
import { supabase } from "@/lib/supabase";

export default function EditProfile() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
          }
          return;
        }

        if (data) {
          setProfile({
            userId: data.user_id || "",
            username: data.username || "",
            avatarUrl: data.avatar_url || null,
            avatarUrls: data.avatar_urls || (data.avatar_url ? [data.avatar_url] : []),
            coverImage: data.cover_image || null,
            backgroundImage: data.bg_image || null,
            themeColor: data.theme_color || "pink",
            galleryImages: data.gallery_images || [],
            playStyles: data.play_style || [],
            playEnvironments: data.play_environments || [],
            joinPolicy: Array.isArray(data.join_policy) ? data.join_policy : (data.join_policy ? [data.join_policy] : []),
            vrcHistory: Array.isArray(data.vrc_history) ? data.vrc_history : (data.vrc_history ? [data.vrc_history] : []),
            creatives: data.creatives || [],
            activeTimes: data.active_time || [],
            partnerStatus: Array.isArray(data.partner_status) ? data.partner_status : (data.partner_status ? [data.partner_status] : []),
            bio: data.bio || "",
            freeSections: data.free_sections || [],
            customTags: data.custom_tags || [],
            hobbies: data.hobbies || "",
            groups: data.groups || [],
            favoriteWorlds: data.favorite_worlds || [],
            favoriteGames: data.favorite_games || [],
            favoriteMangas: data.favorite_mangas || [],
            favoriteAnimes: data.favorite_animes || [],
            favoriteStreamers: data.favorite_streamers || [],
            favoriteMusics: data.favorite_musics || [],
            mbti: data.mbti || [],
            realLife: data.real_life || [],
            links: (() => {
              const defaultLinks = { twitter: "", discord: "", youtube: "", booth: "", others: [] };
              if (!data.links) return defaultLinks;
              const parsedLinks = { ...defaultLinks, ...data.links };
              // if others is an array of strings (old format), reset it to empty array to avoid crash
              if (Array.isArray(parsedLinks.others) && parsedLinks.others.length > 0 && typeof parsedLinks.others[0] === 'string') {
                parsedLinks.others = [];
              }
              return parsedLinks;
            })(),
            isSearchable: data.is_searchable || false,
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async (returnToDashboard = false) => {
    // 入力途中のデータがないかチェック
    const pendingInputs = document.querySelectorAll<HTMLInputElement>('input[data-pending-input="true"]');
    for (const input of Array.from(pendingInputs)) {
      if (input.value.trim() !== '') {
        alert(`入力途中の項目（「${input.value}」）が残っています！\n\n・追加したい場合：Enterキーを押して確定してね\n・不要な場合：文字を消してから保存してね🐾`);
        return;
      }
    }

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
          theme_color: profile.themeColor,
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

      if (returnToDashboard) {
        router.push("/mypage");
      } else {
        alert("保存しました！");
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert("プロフィールの保存に失敗しました。もう一度試してね。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-brand-bg">
        <div className="text-brand-text/50 font-bold animate-pulse">よみこみ中…</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-brand-bg theme-${profile.themeColor} overflow-hidden font-sans relative`}>
      {/* タブナビゲーション (PC・モバイル共通) */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] md:h-[88px] bg-brand-card/95 backdrop-blur-md border-t border-brand-sub/30 flex z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 flex flex-col items-center justify-center font-black text-sm md:text-xl transition-all active:scale-95 border-r border-brand-sub/10 ${activeTab === "form" ? "text-brand-text bg-brand-accent/50" : "text-brand-text/50 hover:bg-brand-sub/5"}`}
        >
          <Edit3 className="w-6 h-6 md:w-7 md:h-7 mb-1" />
          編集
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex flex-col items-center justify-center font-black text-sm md:text-xl transition-all active:scale-95 border-r border-brand-sub/10 ${activeTab === "preview" ? "text-brand-text bg-brand-accent/50" : "text-brand-text/50 hover:bg-brand-sub/5"}`}
        >
          <Eye className="w-6 h-6 md:w-7 md:h-7 mb-1" />
          プレビュー
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="flex-1 flex flex-col items-center justify-center font-black text-sm md:text-xl text-brand-pink transition-all active:scale-95 hover:bg-brand-pink/10 disabled:opacity-50 border-r border-brand-sub/10"
        >
          <Save className="w-6 h-6 md:w-7 md:h-7 mb-1" />
          {isSaving ? "保存中" : "保存"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="flex-1 flex flex-col items-center justify-center font-black text-sm md:text-xl text-white bg-brand-pink transition-all active:scale-95 hover:bg-brand-pink/90 disabled:opacity-50"
        >
          <Home className="w-6 h-6 md:w-7 md:h-7 mb-1" />
          マイページ
        </button>
      </div>

      <div className={`flex-1 w-full overflow-y-auto pb-24 relative ${activeTab === 'form' ? 'bg-brand-card' : 'bg-brand-bg'}`}>
        {/* フォーム画面 */}
        <div className={`${activeTab === "form" ? "block" : "hidden"} w-full min-h-full`}>
          <ProfileForm profile={profile} setProfile={setProfile} isTutorial={false} />
        </div>

        {/* プレビュー画面 */}
        <div className={`${activeTab === "preview" ? "block" : "hidden"} w-full min-h-full p-0 md:p-8`}>
          <ProfilePreview profile={profile} />
        </div>
      </div>
    </div>
  );
}

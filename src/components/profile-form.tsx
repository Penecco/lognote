import React, { useState } from "react";
import { ProfileData } from "@/types/profile";
import { Camera, Image as ImageIcon, Plus, Trash2, X, Link, AtSign, PlaySquare, MessageSquare, ShoppingBag, Loader2, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";

interface ProfileFormProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  isTutorial?: boolean;
}

const PLAY_STYLES = ["マイクON", "無言勢", "イベント好き", "改変好き", "少人数", "大人数", "ワールド巡り", "ながらブイチャ"];
const PLAY_ENVIRONMENTS = ["デスクトップ", "Quest単騎", "PCVR", "スマホ"];
const JOIN_POLICIES = ["誰でも歓迎", "仲良くなってから"];
const VRC_HISTORIES = ["始めたばかり", "1年未満", "1年以上"];
const CREATIVES = ["アバター改変", "アバター制作", "ワールド制作", "イラスト", "動画編集", "写真", "作曲", "イベント運営", "配信"];
const ACTIVE_TIMES = ["不定期", "平日昼", "平日夜", "平日深夜", "休日昼", "休日夜", "休日深夜"];
const PARTNER_STATUSES = ["いる", "いない", "不要", "募集中", "出会いがあれば"];

const PRESET_THEMES = [
  { id: "pink", name: "ピンク", color: "#F29EB3" },
  { id: "blue", name: "ブルー", color: "#60a5fa" },
  { id: "green", name: "グリーン", color: "#34d399" },
  { id: "mono", name: "モノクロ", color: "#64748b" },
  { id: "dark", name: "ダーク", color: "#1e293b" },
];

const MultiTagGroup = ({ 
  title, 
  field, 
  options, 
  profile, 
  setProfile, 
  isTutorial 
}: { 
  title: string, 
  field: keyof ProfileData, 
  options: string[], 
  profile: ProfileData, 
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>,
  isTutorial: boolean 
}) => {
  const [customVal, setCustomVal] = useState("");
  const currentValues = (profile[field] as string[]) || [];
  const customSelected = currentValues.filter(val => !options.includes(val));

  const toggleMultiSelect = (value: string) => {
    if (currentValues.includes(value)) {
      setProfile({ ...profile, [field]: currentValues.filter(item => item !== value) });
    } else {
      setProfile({ ...profile, [field]: [...currentValues, value] });
    }
  };

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customVal.trim() !== '') {
      e.preventDefault();
      const newVal = customVal.trim();
      if (!currentValues.includes(newVal)) {
        setProfile({ ...profile, [field]: [...currentValues, newVal] });
      }
      setCustomVal('');
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-base md:text-xl font-bold text-slate-600 mb-2">{title} <span className="text-sm md:text-lg font-normal text-slate-400 ml-1">(複数選択可)</span></label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={(e) => { e.preventDefault(); toggleMultiSelect(opt); }}
            className={`px-4 py-2 rounded-full text-base md:text-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
              currentValues.includes(opt) 
                ? "bg-brand-pink text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] border-2 border-brand-pink shadow-sm" 
                : "bg-brand-card text-brand-text border-2 border-brand-sub/50 hover:border-brand-sub hover:shadow-sm"
            }`}
          >
            {opt}
          </button>
        ))}
        {!isTutorial && customSelected.map(opt => (
           <button
             key={opt}
             type="button"
             onClick={(e) => { e.preventDefault(); toggleMultiSelect(opt); }}
             className={`px-4 py-2 rounded-full text-base md:text-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 bg-brand-pink text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] border-2 border-brand-pink shadow-sm flex items-center gap-1`}
           >
             {opt} <X className="w-3 h-3" />
           </button>
        ))}
      </div>
      {!isTutorial && (
        <input
          type="text"
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          onKeyDown={handleAdd}
          placeholder={`＋ ${title}を入力`}
          className="mt-3 w-full p-2.5 rounded-xl border-2 border-brand-sub/30 bg-brand-card/50 focus:outline-none focus:border-brand-sub focus:ring-2 focus:ring-brand-sub/20 transition-all text-base md:text-xl font-bold text-brand-text"
          data-pending-input="true"
        />
      )}
    </div>
  );
};

const SingleTagGroup = ({ 
  title, 
  field, 
  options, 
  profile, 
  setProfile, 
  isTutorial 
}: { 
  title: string, 
  field: keyof ProfileData, 
  options: string[], 
  profile: ProfileData, 
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>,
  isTutorial: boolean 
}) => {
  const currentVal = (profile[field] as string) || "";
  const isCustom = currentVal !== "" && !options.includes(currentVal);

  const toggleSingle = (value: string) => {
    if (currentVal === value) {
      setProfile({ ...profile, [field]: "" });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleCustomInput = (value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <div className="mb-6">
      <label className="block text-base md:text-xl font-bold text-slate-600 mb-2">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={(e) => { e.preventDefault(); toggleSingle(opt); }}
            className={`px-4 py-2 rounded-full text-base md:text-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
              currentVal === opt 
                ? "bg-brand-pink text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] border-2 border-brand-pink shadow-sm" 
                : "bg-brand-card text-brand-text border-2 border-brand-sub/50 hover:border-brand-sub hover:shadow-sm"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!isTutorial && (
        <input
          type="text"
          value={isCustom ? currentVal : ""}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder={`＋ ${title} (自由入力)`}
          className={`mt-3 w-full p-2.5 rounded-xl border-2 transition-all text-base md:text-xl font-bold focus:outline-none focus:ring-2 ${
            isCustom
              ? "border-brand-pink bg-brand-pink/5 text-brand-pink focus:ring-brand-pink/20"
              : "border-brand-sub/30 bg-brand-card/50 text-brand-text focus:border-brand-sub focus:ring-brand-sub/20"
          }`}
        />
      )}
    </div>
  );
};

export default function ProfileForm({ profile, setProfile, isTutorial = false }: ProfileFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [userIdError, setUserIdError] = useState("");
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<number | null>(null);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val !== "" && !/^[a-zA-Z0-9_]+$/.test(val)) return;
    
    setProfile({ ...profile, userId: val });
    setUserIdError("");

    if (checkTimeout) window.clearTimeout(checkTimeout);

    if (val.length < 3) {
      if (val.length > 0) setUserIdError("ユーザーIDは3文字以上必要です");
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsCheckingId(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", val)
          .single();
        
        if (data && data.id !== user?.id) {
          setUserIdError("このユーザーIDは既に使われています");
        }
      } catch (err) {
        // Not found error is expected when ID is available
      } finally {
        setIsCheckingId(false);
      }
    }, 500);
    setCheckTimeout(timeout);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "avatar" | "cover" | "bg") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous_user";

      const url = await uploadImage(file, userId, field + "s");
      if (url) {
        if (field === "avatar") {
          setProfile({ ...profile, avatarUrl: url });
        } else if (field === "cover") {
          setProfile({ ...profile, coverImage: url });
        } else if (field === "bg") {
          setProfile({ ...profile, backgroundImage: url });
        }
      }
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに失敗しました。");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading("avatar");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous_user";

      const currentImages = profile.avatarUrls || (profile.avatarUrl ? [profile.avatarUrl] : []);
      const remainingSlots = 5 - currentImages.length;
      const filesToUpload = files.slice(0, remainingSlots);

      const uploadPromises = filesToUpload.map(file => uploadImage(file, userId, "avatars"));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);

      const newUrls = [...currentImages, ...validUrls];
      setProfile({ ...profile, avatarUrls: newUrls, avatarUrl: newUrls.length > 0 ? newUrls[0] : null });
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに一部失敗しました。");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleRemoveAvatarImage = (index: number) => {
    const newAvatars = [...(profile.avatarUrls || (profile.avatarUrl ? [profile.avatarUrl] : []))];
    newAvatars.splice(index, 1);
    setProfile({ ...profile, avatarUrls: newAvatars, avatarUrl: newAvatars.length > 0 ? newAvatars[0] : null });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading("gallery");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous_user";

      const currentImages = profile.galleryImages || [];
      const remainingSlots = 10 - currentImages.length;
      const filesToUpload = files.slice(0, remainingSlots);

      const uploadPromises = filesToUpload.map(file => uploadImage(file, userId, "gallerys"));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);

      setProfile({ ...profile, galleryImages: [...currentImages, ...validUrls] });
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに一部失敗しました。");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = [...(profile.galleryImages || [])];
    newGallery.splice(index, 1);
    setProfile({ ...profile, galleryImages: newGallery });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if ((profile.customTags || []).length >= 10) return;
      let newTag = tagInput.trim();
      if (!newTag.startsWith('#')) {
        newTag = '#' + newTag;
      }
      if (!profile.customTags?.includes(newTag)) {
        setProfile({ ...profile, customTags: [...(profile.customTags || []), newTag] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProfile({ ...profile, customTags: profile.customTags?.filter(tag => tag !== tagToRemove) || [] });
  };


  return (
    <div className="p-4 md:p-6 w-full max-w-md mx-auto font-sans text-brand-text">
      <h2 className="text-2xl font-black mb-2">プロフィール編集</h2>
      <p className="text-brand-text/70 mb-8 text-base md:text-xl font-bold">
        自分らしくカスタマイズしてみよう！<br />
        <span className="text-sm md:text-base text-brand-pink mt-1 block">※自由入力欄は、文字を入力した後に「Enterキー」を押して追加してね！</span>
      </p>
      
      <div className="space-y-6">
        {/* カバー画像アップロード */}
        {!isTutorial && (
          <div className="mb-8">
            <label className="block text-base md:text-xl font-bold mb-2">カバー画像（ヘッダー） <span className="text-brand-text/50 text-sm md:text-lg font-normal ml-1">(任意)</span></label>
            <label className="w-full aspect-[3/1] bg-brand-pink/5 border-2 border-dashed border-brand-pink/30 rounded-2xl flex flex-col items-center justify-center text-brand-pink cursor-pointer hover:bg-brand-pink/10 transition-colors relative overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} disabled={uploading === "cover"} />
              {uploading === "cover" ? (
                <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
              ) : profile.coverImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mb-2 opacity-70" />
                  <span className="text-base md:text-xl font-bold">ヘッダー画像を選択</span>
                </>
              )}
            </label>
          </div>
        )}

        {/* 画像アップロード */}
        <div className="mb-8">
          <label className="block text-base md:text-xl font-bold mb-2">アバター画像 <span className="text-brand-text/50 text-sm md:text-lg font-normal ml-1">(最大5枚・任意)</span></label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(profile.avatarUrls || (profile.avatarUrl ? [profile.avatarUrl] : [])).map((url, i) => (
              <div key={i} className="aspect-square bg-brand-pink/5 border-2 border-brand-pink/30 rounded-2xl relative overflow-hidden group">
                <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleRemoveAvatarImage(i); }}
                  className="absolute inset-0 bg-black/50 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
          {(profile.avatarUrls || (profile.avatarUrl ? [profile.avatarUrl] : [])).length < 5 && (
            <label className="w-full py-6 bg-brand-pink/5 border-2 border-dashed border-brand-pink/50 rounded-2xl flex flex-col items-center justify-center text-brand-pink cursor-pointer hover:bg-brand-pink/10 transition-colors relative overflow-hidden">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleAvatarUpload} disabled={uploading === "avatar"} />
              {uploading === "avatar" ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-brand-pink mb-2" />
                  <span className="text-base md:text-xl font-bold">アップロード中...</span>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-2 opacity-70" />
                  <span className="text-base md:text-xl font-bold">画像を追加する</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* ユーザーID */}
        <div className="mb-8">
          <label className="block text-base md:text-xl font-bold mb-2">ユーザーID (URLに使用) <span className="text-brand-sub">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/50 font-bold">@</span>
            <input 
              type="text" 
              value={profile.userId || ""}
              onChange={handleUserIdChange}
              className={`w-full p-4 pl-10 rounded-2xl border-2 bg-brand-card focus:outline-none focus:ring-4 transition-all font-bold text-brand-text ${userIdError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-brand-sub/50 focus:border-brand-pink/50 focus:ring-brand-pink/20'}`}
              placeholder="pde_vtuber"
            />
            {isCheckingId && (
              <Loader2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-brand-pink animate-spin" />
            )}
          </div>
          {userIdError && (
            <p className="text-red-500 font-bold text-sm mt-2">{userIdError}</p>
          )}
          <p className="text-brand-text/50 text-sm mt-2 font-bold">半角英数とアンダースコア（_）のみ使用できます</p>
        </div>

        {/* ユーザー名 */}
        <div className="mb-8">
          <label className="block text-base md:text-xl font-bold mb-2">ユーザー名 (表示名) <span className="text-brand-sub">*</span></label>
          <input 
            type="text" 
            value={profile.username}
            onChange={(e) => setProfile({...profile, username: e.target.value})}
            className="w-full p-4 rounded-2xl border-2 border-brand-sub/50 bg-brand-card focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/20 transition-all font-bold text-brand-text"
            placeholder="ペネッコ・ドカ・イーティング"
          />
        </div>

        {!isTutorial && (
          <>
            <div className="h-px bg-brand-sub/30 w-full my-8"></div>

            {/* SNS・リンク集 */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-4">SNS・リンク集</label>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00b4d8]/10 text-[#00b4d8] flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.links?.vrc || ""}
                    onChange={(e) => setProfile({ ...profile, links: { ...profile.links, vrc: e.target.value } })}
                    placeholder="VRChatのURL"
                    className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center flex-shrink-0">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.links?.twitter || ""}
                    onChange={(e) => setProfile({ ...profile, links: { ...profile.links, twitter: e.target.value } })}
                    placeholder="X (Twitter) のURLまたはID"
                    className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center flex-shrink-0">
                    <PlaySquare className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.links?.youtube || ""}
                    onChange={(e) => setProfile({ ...profile, links: { ...profile.links, youtube: e.target.value } })}
                    placeholder="YouTubeチャンネルのURL"
                    className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.links?.discord || ""}
                    onChange={(e) => setProfile({ ...profile, links: { ...profile.links, discord: e.target.value } })}
                    placeholder="Discordのユーザー名またはサーバーURL"
                    className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.links?.booth || ""}
                    onChange={(e) => setProfile({ ...profile, links: { ...profile.links, booth: e.target.value } })}
                    placeholder="BOOTHショップのURL"
                    className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl transition-all"
                  />
                </div>
              </div>

              {/* カスタムリンク */}
              <div className="mt-6 space-y-4">
                {profile.links?.others?.map((customLink, index) => (
                  <div key={index} className="p-4 rounded-2xl border-2 border-brand-sub/30 bg-brand-card/50 relative group">
                    <button
                      onClick={() => {
                        const newOthers = [...(profile.links?.others || [])];
                        newOthers.splice(index, 1);
                        setProfile({ ...profile, links: { ...profile.links, others: newOthers } });
                      }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center border-2 border-red-200 hover:bg-red-500 hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-brand-sub" />
                        <input
                          type="text"
                          value={customLink.title}
                          onChange={(e) => {
                            const newOthers = [...(profile.links?.others || [])];
                            newOthers[index].title = e.target.value;
                            setProfile({ ...profile, links: { ...profile.links, others: newOthers } });
                          }}
                          placeholder="リンク名 (例: マシュマロ)"
                          className="w-full p-2 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl"
                        />
                      </div>
                      <input
                        type="text"
                        value={customLink.url}
                        onChange={(e) => {
                          const newOthers = [...(profile.links?.others || [])];
                          newOthers[index].url = e.target.value;
                          setProfile({ ...profile, links: { ...profile.links, others: newOthers } });
                        }}
                        placeholder="URL (https://...)"
                        className="w-full p-2 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setProfile({
                    ...profile,
                    links: {
                      ...profile.links,
                      others: [...(profile.links?.others || []), { title: "", url: "" }]
                    }
                  });
                }}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-brand-sub/50 text-brand-sub font-bold flex items-center justify-center gap-2 hover:bg-brand-sub/10 transition-colors"
              >
                <Plus className="w-5 h-5" /> リンクを追加する
              </button>
            </div>

            <div className="h-px bg-brand-sub/30 w-full my-8"></div>

            {/* カスタムタグ（BOOTH風） */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-2">
                カスタムタグ <span className="text-brand-text/50 text-sm md:text-lg font-normal ml-1">(最大10個)</span>
              </label>
              {profile.customTags && profile.customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.customTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-brand-sub text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] px-3 py-1.5 rounded-lg text-base md:text-xl font-bold">
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={(profile.customTags || []).length >= 10}
                data-pending-input="true"
                className="w-full p-4 rounded-xl border-2 border-brand-sub/30 bg-brand-card/50 focus:outline-none focus:border-brand-sub focus:ring-4 focus:ring-brand-sub/20 transition-all font-bold text-brand-text"
                placeholder="例: 改変好き / 無言勢 etc."
              />
            </div>
            
            <div className="h-px bg-brand-sub/30 w-full my-8"></div>
          </>
        )}

        <MultiTagGroup title="ブイチャ歴" field="vrcHistory" options={VRC_HISTORIES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        <MultiTagGroup title="フレンド申請" field="joinPolicy" options={JOIN_POLICIES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        <MultiTagGroup title="プレイスタイル" field="playStyles" options={PLAY_STYLES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        <MultiTagGroup title="プレイ環境" field="playEnvironments" options={PLAY_ENVIRONMENTS} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        <MultiTagGroup title="クリエイティブ" field="creatives" options={CREATIVES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        <MultiTagGroup title="出没時間" field="activeTimes" options={ACTIVE_TIMES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
        
        {!isTutorial && (
          <>
            <MultiTagGroup title="お砂糖" field="partnerStatus" options={PARTNER_STATUSES} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />

            <MultiTagGroup title="所属グループ" field="groups" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="好きなワールド" field="favoriteWorlds" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />

            <div className="h-px bg-brand-sub/30 w-full my-8"></div>

            <MultiTagGroup title="好きなゲーム" field="favoriteGames" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="好きな漫画" field="favoriteMangas" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="好きなアニメ" field="favoriteAnimes" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="好きな配信者" field="favoriteStreamers" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="好きな音楽" field="favoriteMusics" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="MBTI" field="mbti" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />
            <MultiTagGroup title="リアル属性" field="realLife" options={[]} profile={profile} setProfile={setProfile} isTutorial={isTutorial} />

            <div className="h-px bg-brand-sub/30 w-full my-8"></div>

            {/* 自由記述セクション */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-4">自由記述欄</label>
              
              <div className="space-y-4">
                {profile.freeSections?.map((section, index) => (
                  <div key={index} className="p-4 rounded-2xl border-2 border-brand-sub/30 bg-brand-card/50 relative group">
                    <button
                      onClick={() => {
                        const newSections = [...profile.freeSections];
                        newSections.splice(index, 1);
                        setProfile({ ...profile, freeSections: newSections });
                      }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center border-2 border-red-200 hover:bg-red-500 hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...profile.freeSections];
                        newSections[index].title = e.target.value;
                        setProfile({ ...profile, freeSections: newSections });
                      }}
                      placeholder="タイトル (例: 好きな食べ物)"
                      className="w-full p-2 mb-2 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...profile.freeSections];
                        newSections[index].content = e.target.value;
                        setProfile({ ...profile, freeSections: newSections });
                      }}
                      placeholder="内容 (例: お寿司！)"
                      className="w-full p-3 rounded-xl border-2 border-brand-sub/30 bg-brand-card focus:outline-none focus:border-brand-pink/50 font-bold text-brand-text text-base md:text-xl min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setProfile({
                    ...profile,
                    freeSections: [...(profile.freeSections || []), { title: "", content: "" }]
                  });
                }}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-brand-pink/50 text-brand-pink font-bold flex items-center justify-center gap-2 hover:bg-brand-pink/10 transition-colors"
              >
                <Plus className="w-5 h-5" /> 項目を追加する
              </button>
            </div>

            {/* ギャラリー画像アップロード */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-2">ギャラリー画像 <span className="text-brand-text/50 text-sm md:text-lg font-normal ml-1">(最大10枚)</span></label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(profile.galleryImages || []).map((url, i) => (
                  <div key={i} className="aspect-[16/9] bg-brand-pink/5 border-2 border-brand-pink/30 rounded-xl relative overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveGalleryImage(i);
                      }}
                      className="absolute inset-0 bg-black/50 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
              {(profile.galleryImages || []).length < 10 && (
                <label className="w-full py-3 rounded-xl border-2 border-dashed border-brand-pink/50 text-brand-pink font-bold flex items-center justify-center gap-2 hover:bg-brand-pink/10 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading === "gallery"} />
                  {uploading === "gallery" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-brand-pink" /> アップロード中...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" /> 画像を追加する
                    </>
                  )}
                </label>
              )}
            </div>

            {/* テーマカラー選択 */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-2">テーマカラー</label>
              <div className="flex flex-wrap gap-4">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setProfile({ ...profile, themeColor: theme.id })}
                    className={`w-14 h-14 rounded-full border-4 transition-all flex items-center justify-center ${profile.themeColor === theme.id ? "border-brand-text shadow-md scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: theme.color }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* 背景画像アップロード */}
            <div className="mb-8">
              <label className="block text-base md:text-xl font-bold mb-2">背景画像 <span className="text-brand-text/50 text-sm md:text-lg font-normal ml-1">(任意)</span></label>
              <div className="flex gap-4">
                <label className="w-32 h-24 rounded-xl border-4 border-dashed border-brand-sub/50 flex flex-col items-center justify-center text-brand-sub hover:bg-brand-accent/30 transition-colors cursor-pointer relative overflow-hidden flex-shrink-0">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "bg")} disabled={uploading === "bg"} />
                  {uploading === "bg" ? (
                    <Loader2 className="w-6 h-6 animate-spin text-brand-sub" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-sm md:text-lg font-bold">画像を選ぶ</span>
                    </>
                  )}
                </label>

            {profile.backgroundImage && profile.backgroundImage.startsWith('http') && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-brand-sub/30 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.backgroundImage} alt="BG" className="w-full h-full object-cover" />
                <button
                  onClick={() => setProfile({ ...profile, backgroundImage: null })}
                  className="absolute inset-0 bg-black/50 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  );
}

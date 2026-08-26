"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check, Copy } from "lucide-react";
import Link from "next/link";
import { ProfileData } from "@/types/profile";

const themeColors = {
  pink: { main: '#ff99c2', sub: '#fff0f5', name: 'ピンク' },
  blue: { main: '#80c6ff', sub: '#f0f8ff', name: 'ブルー' },
  green: { main: '#8fe5a5', sub: '#f0fff0', name: 'グリーン' },
  purple: { main: '#d0a3ff', sub: '#faf5ff', name: 'パープル' },
  orange: { main: '#ffb380', sub: '#fff7f0', name: 'オレンジ' },
  dark: { main: '#666666', sub: '#f5f5f5', name: 'ダーク' },
};

const ITEM_LABELS: Record<string, { label: string, key: string }> = {
  customTags: { label: 'カスタムタグ', key: 'custom_tags' },
  vrcHistory: { label: 'ブイチャ歴', key: 'vrc_history' },
  playStyles: { label: 'プレイスタイル', key: 'play_style' },
  playEnvironments: { label: 'プレイ環境', key: 'play_environments' },
  joinPolicy: { label: 'フレンド申請', key: 'join_policy' },
  activeTimes: { label: '出没時間', key: 'active_time' },
  creatives: { label: 'クリエイティブ', key: 'creatives' },
  partnerStatus: { label: 'お砂糖', key: 'partner_status' },
  mbti: { label: 'MBTI', key: 'mbti' },
  realLife: { label: 'リアル属性', key: 'real_life' },
  groups: { label: '所属グループ', key: 'groups' },
  favoriteWorlds: { label: '好きなワールド', key: 'favorite_worlds' },
  favoriteGames: { label: '好きなゲーム', key: 'favorite_games' },
  favoriteMangas: { label: '好きな漫画', key: 'favorite_mangas' },
  favoriteAnimes: { label: '好きなアニメ', key: 'favorite_animes' },
  favoriteStreamers: { label: '好きな配信者', key: 'favorite_streamers' },
  favoriteMusics: { label: '好きな音楽', key: 'favorite_musics' },
};

export default function VrcCardCustomizer() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const [themeColor, setThemeColor] = useState("pink");
  const [selectedItems, setSelectedItems] = useState<string[]>(['playStyles', 'activeTimes', 'mbti']);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error || !data) {
        alert("プロフィールの取得に失敗しました");
        router.push("/mypage");
        return;
      }
      
      setUserId(data.user_id);
      
      // DBの設定を読み込む
      const settings = data.vrc_card_settings || {
        themeColor: data.theme_color || "pink",
        selectedItems: ['playStyles', 'activeTimes', 'mbti']
      };
      
      setThemeColor(settings.themeColor);
      setSelectedItems(settings.selectedItems);
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, [router]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 6) return prev; // 最大6個
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const settings = {
        themeColor,
        selectedItems
      };

      const { error } = await supabase
        .from('profiles')
        .update({ vrc_card_settings: settings })
        .eq('id', user.id);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndCopy = async () => {
    const success = await handleSave();
    if (success !== false && userId) {
      const url = `${origin}/api/vrc-card/${userId}.png`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-bold text-brand-text/50 animate-pulse">
        読み込み中...
      </div>
    );
  }

  // プレビュー用URLの構築
  const previewUrl = `/api/vrc-card/${userId}.png?previewTheme=${themeColor}&previewItems=${selectedItems.join(',')}&t=${Date.now()}`;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-start pt-8 pb-32 p-4 font-sans relative">
      <div className="max-w-4xl w-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl shadow-sm border border-brand-sub/20">
          <Link href="/mypage" className="flex items-center gap-2 text-brand-text/70 hover:text-brand-pink transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> マイページへ戻る
          </Link>
          <h1 className="text-xl font-black text-brand-text hidden sm:block">VRCカードをカスタマイズ</h1>
          <div className="w-[120px]"></div> {/* スペーサー */}
        </div>

        {/* プレビューエリア */}
        <div className="bg-white p-4 sm:p-6 rounded-[32px] shadow-sm border border-brand-sub/20 mb-6">
          <h2 className="text-lg font-black text-brand-text mb-4 text-center">プレビュー</h2>
          <div className="rounded-2xl overflow-hidden border-4 border-brand-bg relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewUrl} 
              alt="VRC Card Preview" 
              className="w-full h-auto object-contain bg-gray-50 aspect-[1200/630]"
              key={previewUrl} // URLが変わるたびに再マウントして即時反映させる
            />
          </div>
          <p className="text-center text-sm font-bold text-brand-text/50 mt-4">
            ※画像の生成には少し時間がかかる場合があります。<br />
            ※アバター画像が4枚以上設定されている場合でも、VRCカードには最初の3枚だけが表示されます。<br />
            ※URLをコピーして、プロフィールやSNSに貼り付けてお使いください。
          </p>
        </div>

        {/* カスタマイズエリア */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-brand-sub/20 space-y-8">
          
          {/* テーマカラー */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-brand-text text-lg">テーマカラー</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(themeColors).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setThemeColor(key)}
                  className={`w-12 h-12 rounded-full transition-transform active:scale-95 flex items-center justify-center shadow-sm ${
                    themeColor === key ? 'ring-4 ring-offset-2 ring-brand-text/20 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: value.main }}
                  title={value.name}
                >
                  {themeColor === key && <Check className="w-6 h-6 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* 表示項目の選択 */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h3 className="font-black text-brand-text text-lg">表示する項目を選ぶ</h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedItems.length >= 6 ? 'bg-brand-pink/10 text-brand-pink' : 'bg-brand-bg text-brand-text/60'}`}>
                {selectedItems.length} / 6 個選択中
              </span>
            </div>
            <p className="text-sm text-brand-text/60 mb-4">
              VRCカードに表示したい項目を最大6つまで選べます。プロフィールで入力していない項目は、選んでも表示されません。
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ITEM_LABELS).map(([id, meta]) => {
                const isSelected = selectedItems.includes(id);
                const isDisabled = !isSelected && selectedItems.length >= 6;
                
                return (
                  <button
                    key={id}
                    disabled={isDisabled}
                    onClick={() => toggleItem(id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-brand-pink bg-brand-pink/5 text-brand-pink' 
                        : isDisabled 
                          ? 'border-brand-sub/10 bg-brand-bg opacity-50 cursor-not-allowed' 
                          : 'border-brand-sub/20 bg-white hover:border-brand-pink/30 hover:bg-brand-bg'
                      }
                    `}
                  >
                    <span className="font-bold flex items-center gap-2">
                      {meta.label}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-brand-pink bg-brand-pink' : 'border-brand-sub/30'}
                    `}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 下部固定ボタンエリア */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-brand-sub/20 flex justify-center z-50">
        <div className="w-full max-w-4xl flex gap-3 px-2">
          <button
            onClick={handleSave}
            disabled={saving || !userId}
            className="flex-1 bg-white text-brand-text py-4 rounded-full font-black text-sm md:text-base border-2 border-brand-sub/50 shadow-sm hover:bg-brand-hover hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? '保存中...' : saveSuccess ? '保存しました！' : '上書き保存'}
          </button>
          
          <button
            onClick={handleSaveAndCopy}
            disabled={saving || !userId}
            className="flex-[2] bg-brand-pink text-white py-4 rounded-full font-black text-sm md:text-base shadow-sm hover:bg-brand-pink/90 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {saving ? '保存中...' : copied ? 'コピーしたよ！' : '保存してURLをコピー'}
          </button>
        </div>
      </div>
    </div>
  );
}

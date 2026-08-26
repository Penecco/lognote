import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const previewTheme = url.searchParams.get('previewTheme');
    const previewItemsParam = url.searchParams.get('previewItems');
    const previewItems = previewItemsParam ? previewItemsParam.split(',') : null;
    
    // ".png" などの拡張子を取り除いて userId を抽出する
    const userId = id.replace(/\.(png|jpg|jpeg)$/i, '');

    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://lognote-puce.vercel.app';

    let username = "ゲスト";
    let avatarUrl = `${baseUrl}/images/lognote-logo.png`;
    
    // 全データ保持用
    let profileData: any = {};
    let dbSettings: any = null;
    let fallbackTheme = "pink";

    if (userId) {
      let { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!data) {
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', userId)
          .single();
        data = fallbackData;
      }

      if (data) {
        profileData = data;
        username = data.username || "名無しさん";
        if (data.avatar_url) avatarUrl = data.avatar_url;
        dbSettings = data.vrc_card_settings;
        fallbackTheme = data.theme_color || "pink";
      }
    }

    // 最終的な設定の決定 (プレビューURL > DB設定 > デフォルト)
    const activeTheme = previewTheme || (dbSettings?.themeColor) || fallbackTheme;
    const activeItems = previewItems || (dbSettings?.selectedItems) || ['playStyles', 'activeTimes', 'mbti'];

    const bgUrl = `${baseUrl}/images/og_bg.png`;

    const fontData = await fetch(
      'https://github.com/googlefonts/zen-marugothic/raw/main/fonts/ttf/ZenMaruGothic-Bold.ttf',
      { cache: 'force-cache' }
    ).then((res) => res.arrayBuffer());

    // カラーテーマ設定
    const themeColors: Record<string, { main: string, sub: string, text: string }> = {
      pink: { main: '#ff7eb3', sub: '#ff758c', text: '#fff' },
      blue: { main: '#00b4d8', sub: '#90e0ef', text: '#fff' },
      green: { main: '#4ade80', sub: '#86efac', text: '#fff' },
      purple: { main: '#c084fc', sub: '#d8b4fe', text: '#fff' },
      orange: { main: '#fb923c', sub: '#fdba74', text: '#fff' },
      dark: { main: '#333333', sub: '#666666', text: '#fff' },
    };
    const colors = themeColors[activeTheme] || themeColors.pink;

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

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: '"Zen Maru Gothic"',
            backgroundColor: colors.sub,
          }}
        >
          {/* メインカードコンテナ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '40px 50px',
              borderRadius: '40px',
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.2)',
              border: `6px solid ${colors.main}`,
              width: '1180px',
              height: '620px',
              gap: '40px',
            }}
          >
            {/* 左側: アバターアイコン（小さく） */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px', justifyContent: 'flex-start', paddingTop: '20px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="avatar"
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '70px',
                  objectFit: 'cover',
                  border: `6px solid ${colors.main}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </div>
            
            {/* 右側: 名前 + ステータス */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start', gap: '16px' }}>
              
              {/* 名前 */}
              <div style={{ 
                display: 'flex', 
                fontSize: 40, 
                fontWeight: 'bold', 
                color: '#333',
                marginBottom: '10px'
              }}>
                {username}
              </div>

              {/* ステータス項目 */}
              {activeItems.map((itemId: string) => {
                const itemDef = ITEM_LABELS[itemId];
                if (!itemDef) return null;
                const valueArray = profileData[itemDef.key];
                if (!valueArray || !Array.isArray(valueArray) || valueArray.length === 0) return null;

                return (
                  <div key={itemId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', color: colors.main, fontSize: 18, fontWeight: 'bold' }}>
                      {itemDef.label}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {valueArray.map((val, i) => (
                        <div key={i} style={{ 
                          display: 'flex',
                          backgroundColor: '#f0f0f0', 
                          padding: '4px 14px', 
                          borderRadius: '16px', 
                          fontSize: 20, 
                          fontWeight: 'bold', 
                          color: '#444' 
                        }}>
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      ),
      {
        width: 1280, // 16:9 比率
        height: 720,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
        fonts: [
          {
            name: 'Zen Maru Gothic',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}

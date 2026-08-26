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
    
    // ".png" などの拡張子を取り除いて userId を抽出する
    const userId = id.replace(/\.(png|jpg|jpeg)$/i, '');

    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://lognote-puce.vercel.app';

    let username = "ゲスト";
    let avatarUrl = `${baseUrl}/images/lognote-logo.png`;
    let customTags: string[] = [];
    let playStyles: string[] = [];
    let activeTimes: string[] = [];
    let mbti: string[] = [];

    if (userId) {
      let { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, custom_tags, play_style, active_time, mbti')
        .eq('user_id', userId)
        .single();
        
      if (!data) {
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('username, avatar_url, custom_tags, play_style, active_time, mbti')
          .eq('username', userId)
          .single();
        data = fallbackData;
      }

      if (data) {
        username = data.username || "名無しさん";
        if (data.avatar_url) avatarUrl = data.avatar_url;
        if (data.custom_tags && Array.isArray(data.custom_tags)) customTags = data.custom_tags;
        if (data.play_style && Array.isArray(data.play_style)) playStyles = data.play_style;
        if (data.active_time && Array.isArray(data.active_time)) activeTimes = data.active_time;
        if (data.mbti && Array.isArray(data.mbti)) mbti = data.mbti;
      }
    }

    const bgUrl = `${baseUrl}/images/og_bg.png`;

    const fontData = await fetch(
      'https://github.com/googlefonts/zen-marugothic/raw/main/fonts/ttf/ZenMaruGothic-Bold.ttf',
      { cache: 'force-cache' }
    ).then((res) => res.arrayBuffer());

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
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt="background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* メインカードコンテナ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '60px 80px',
              borderRadius: '60px',
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.7)',
              width: '1000px',
              gap: '60px',
            }}
          >
            {/* 左側: アバターと名前 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '320px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="avatar"
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '140px',
                  objectFit: 'cover',
                  border: '8px solid white',
                  marginBottom: '20px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }}
              />
              <div style={{ 
                display: 'flex', 
                fontSize: 48, 
                fontWeight: 'bold', 
                color: '#333', 
                textAlign: 'center',
                textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
              }}>
                {username}
              </div>
            </div>
            
            {/* 右側: ステータス */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '20px' }}>
              
              {/* プレイスタイル */}
              {playStyles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: '#666', fontSize: 24, fontWeight: 'bold' }}>🎮 プレイスタイル</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {playStyles.slice(0, 3).map((style, i) => (
                      <div key={i} style={{ backgroundColor: '#f0f0f0', padding: '8px 20px', borderRadius: '20px', fontSize: 28, fontWeight: 'bold', color: '#444' }}>
                        {style}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ログイン時間帯 */}
              {activeTimes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: '#666', fontSize: 24, fontWeight: 'bold' }}>⏰ よくいる時間</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {activeTimes.slice(0, 4).map((time, i) => (
                      <div key={i} style={{ backgroundColor: '#f0f0f0', padding: '8px 20px', borderRadius: '20px', fontSize: 28, fontWeight: 'bold', color: '#444' }}>
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MBTI */}
              {mbti.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: '#666', fontSize: 24, fontWeight: 'bold' }}>🧠 MBTI</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {mbti.slice(0, 1).map((type, i) => (
                      <div key={i} style={{ backgroundColor: '#00b4d8', padding: '8px 20px', borderRadius: '20px', fontSize: 28, fontWeight: 'bold', color: '#fff' }}>
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* カスタムタグ (スペースが余っていれば) */}
              {customTags.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '10px' }}>
                  {customTags.slice(0, 3).map((tag, i) => (
                    <div key={i} style={{ color: '#00b4d8', fontSize: 28, fontWeight: 'bold' }}>
                      #{tag}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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

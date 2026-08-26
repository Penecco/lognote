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
    // 例: "penecco.png" -> "penecco"
    const userId = id.replace(/\.(png|jpg|jpeg)$/i, '');

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://lognote-puce.vercel.app');

    let username = "ゲスト";
    let avatarUrl = `${baseUrl}/images/lognote-logo.png`; // デフォルト画像
    let customTags: string[] = [];

    if (userId) {
      let { data } = await supabase.from('profiles').select('username, avatar_url, custom_tags').eq('user_id', userId).single();
      if (!data) {
        const { data: fallbackData } = await supabase.from('profiles').select('username, avatar_url, custom_tags').eq('username', userId).single();
        data = fallbackData;
      }

      if (data) {
        username = data.username || "名無しさん";
        if (data.avatar_url) avatarUrl = data.avatar_url;
        if (data.custom_tags && Array.isArray(data.custom_tags)) customTags = data.custom_tags;
      }
    }

    const bgUrl = `${baseUrl}/images/og_bg.png`;

    // Zen Maru Gothic のフォントをフェッチ (Bold)
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

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '50px 80px',
              borderRadius: '60px',
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.7)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: '260px',
                height: '260px',
                borderRadius: '130px',
                objectFit: 'cover',
                border: '8px solid white',
                marginBottom: '24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
            />
            <div style={{ 
              display: 'flex', 
              fontSize: 64, 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: 20,
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}>
              {username}
            </div>
            
            {customTags.length > 0 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                {customTags.slice(0, 5).map((tag, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      backgroundColor: '#00b4d8',
                      color: 'white',
                      padding: '12px 30px',
                      borderRadius: '40px',
                      fontSize: 38,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0, 180, 216, 0.4)',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </div>
                ))}
              </div>
            ) : null}
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

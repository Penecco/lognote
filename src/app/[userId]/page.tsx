import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProfilePreview from "@/components/profile-preview";
import { ProfileData } from "@/types/profile";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const decodedUserId = decodeURIComponent(userId);
  let { data } = await supabase.from('profiles').select('username, bio, avatar_url').eq('user_id', decodedUserId).single();
  
  if (!data) {
    const { data: fallbackData } = await supabase.from('profiles').select('username, bio, avatar_url').eq('username', decodedUserId).single();
    data = fallbackData;
  }

  if (!data) return { title: 'プロフィールが見つかりません' };

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://lognote-penecco.vercel.app';

  const ogImageUrl = `${baseUrl}/api/og/${decodedUserId}.png`;

  return {
    title: `${data.username}のろぐのーとプロフィール⭐`,
    description: data.bio || `${data.username}のろぐのーとプロフィールページです。`,
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${data.username}のプロフィール画像`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.username}のろぐのーとプロフィール⭐`,
      description: data.bio || `${data.username}のろぐのーとプロフィールページです。`,
      images: [ogImageUrl],
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  const decodedUserId = decodeURIComponent(userId);

  // 1. user_id で検索
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', decodedUserId)
    .single();

  // 2. 見つからない場合は username でフォールバック検索
  if (!data) {
    const { data: fallbackData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', decodedUserId)
      .single();
    data = fallbackData;
  }

  // それでも見つからない場合は404ページへ
  if (!data) {
    notFound();
  }

  // ProfileData 型へのマッピング
  const profile: ProfileData = {
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
      const defaultLinks = { twitter: "", discord: "", youtube: "", booth: "", vrc: "", others: [] };
      if (!data.links) return defaultLinks;
      const parsedLinks = { ...defaultLinks, ...data.links };
      if (Array.isArray(parsedLinks.others) && parsedLinks.others.length > 0 && typeof parsedLinks.others[0] === 'string') {
        parsedLinks.others = [];
      }
      return parsedLinks;
    })(),
    isSearchable: data.is_searchable || false,
  };

  return (
    <ProfilePreview profile={profile}>
      <div className="flex justify-center pb-12 pt-8">
        <Link 
          href="/"
          className="w-full max-w-sm mx-4 bg-brand-pink text-white text-center py-3.5 md:py-4 rounded-full font-black text-lg md:text-xl transition-all hover:bg-brand-pink/90 hover:-translate-y-1 active:scale-95 shadow-md"
        >
          自分も作ってみる！
        </Link>
      </div>
    </ProfilePreview>
  );
}

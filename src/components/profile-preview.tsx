"use client";
import { ProfileData } from "@/types/profile";
import { useState, useEffect } from "react";
import { User, Clock, Monitor, Gamepad2, Sparkles, MessageCircle, Heart, Image as ImageIcon, Users, Globe, Calendar, Book, Tv, Mic, Music, Brain, AtSign, PlaySquare, MessageSquare, ShoppingBag, Link as LinkIcon, Share2, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface ProfilePreviewProps {
  profile: ProfileData;
}

export default function ProfilePreview({ profile }: ProfilePreviewProps) {
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);

  const avatarList = profile.avatarUrls || (profile.avatarUrl ? [profile.avatarUrl] : []);

  const handlePrevAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev === 0 ? avatarList.length - 1 : prev - 1));
  };
  const handleNextAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev === avatarList.length - 1 ? 0 : prev + 1));
  };

  const isCustomBg = profile.backgroundImage && profile.backgroundImage.startsWith('http');
  const themeClass = profile.themeColor ? `theme-${profile.themeColor}` : 'theme-pink';

  const TagList = ({ items, color }: { items: string[], color: string }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-3 md:gap-4 justify-start mt-4">
        {items.map(item => (
          <span key={item} className="px-5 py-1.5 md:px-6 md:py-2 rounded-full text-xl md:text-2xl font-bold border-2 bg-brand-card border-brand-sub text-brand-text shadow-sm">
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`w-full min-h-[100dvh] font-sans bg-brand-bg ${themeClass} md:p-8 flex flex-col`}
      style={isCustomBg ? { backgroundImage: `url(${profile.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {}}
    >
      <div className="w-full md:w-[60%] md:max-w-none mx-auto bg-brand-card backdrop-blur-sm rounded-none md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border-0 md:border border-brand-sub/20 flex-1">
        {/* カバー画像（ヘッダー） */}
        <div className="w-full aspect-[1920/600] md:aspect-[1920/800] bg-brand-accent relative overflow-hidden">
          {profile.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-brand-sub/50">
              <Sparkles className="w-12 h-12 mb-2" />
              <span className="font-bold text-lg">ヘッダー画像がありません</span>
            </div>
          )}
        </div>

        {/* プロフィール本体 */}
        <div className="p-6 md:p-12 relative z-10">
          {/* アイコンとユーザー名の行（大きく中央寄せ） */}
          <div className="flex flex-col items-center gap-6 mb-12 relative text-center">
            {/* アバター（最大5枚のカルーセル） */}
            <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-brand-card rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-3 shadow-xl border border-brand-sub/20 flex-shrink-0 -mt-24 md:-mt-32 relative z-20 group">
              <div className="w-full h-full bg-brand-accent rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-brand-sub overflow-hidden relative">
                {avatarList.length > 0 ? (
                  <>
                    <img src={avatarList[currentAvatarIndex]} alt="Avatar" className="w-full h-full object-cover transition-opacity duration-300" />
                    {avatarList.length > 1 && (
                      <>
                        <button onClick={handlePrevAvatar} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <button onClick={handleNextAvatar} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {avatarList.map((_, i) => (
                            <div key={i} className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${i === currentAvatarIndex ? "bg-white scale-125" : "bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <User className="w-24 h-24 md:w-40 md:h-40 opacity-50" />
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-text tracking-tight">
                {profile.username || "ユーザー名未設定"}
              </h2>
            </div>
          </div>

        {/* リンク集（ユーザー名の下に独立して配置） */}
        {(profile.links?.twitter || profile.links?.youtube || profile.links?.discord || profile.links?.booth || profile.links?.vrc || (profile.links?.others && profile.links.others.length > 0)) && (
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {profile.links?.vrc && (
              <a href={profile.links.vrc.startsWith('http') ? profile.links.vrc : `https://vrchat.com/home/user/${profile.links.vrc}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <Globe className="w-5 h-5" />
                <span>VRChat</span>
              </a>
            )}
            {profile.links?.twitter && (
              <a href={profile.links.twitter.startsWith('http') ? profile.links.twitter : `https://x.com/${profile.links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <AtSign className="w-5 h-5" />
                <span>X</span>
              </a>
            )}
            {profile.links?.youtube && (
              <a href={profile.links.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <PlaySquare className="w-5 h-5" />
                <span>YouTube</span>
              </a>
            )}
            {profile.links?.discord && (
              profile.links.discord.startsWith('http') ? (
                <a href={profile.links.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <MessageSquare className="w-5 h-5" />
                  <span>Discord</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                  <span>{profile.links.discord}</span>
                </div>
              )
            )}
            {profile.links?.booth && (
              <a href={profile.links.booth} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-brand-pink text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <ShoppingBag className="w-5 h-5" />
                <span>BOOTH</span>
              </a>
            )}
            {profile.links?.others?.map((customLink, idx) => {
              if (!customLink.url) return null;
              return (
                <a key={idx} href={customLink.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-brand-card text-brand-text border-2 border-brand-sub/30 rounded-full font-bold shadow-sm hover:shadow-md hover:border-brand-sub hover:-translate-y-0.5 transition-all">
                  <LinkIcon className="w-5 h-5 text-brand-sub" />
                  <span>{customLink.title || "リンク"}</span>
                </a>
              );
            })}
          </div>
        )}
        {/* カスタムタグ */}
        {profile.customTags && profile.customTags.length > 0 && (
          <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
            {profile.customTags.map((tag) => (
              <span key={tag} className="px-6 py-2 md:px-8 md:py-3 rounded-full text-xl md:text-2xl font-bold bg-brand-sub text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
          

          {/* 各種タグエリア */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-card/40 p-6 rounded-2xl border border-brand-sub/10 mb-10">
            {profile.vrcHistory && profile.vrcHistory.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Calendar className="w-6 h-6" /> ブイチャ歴
                </p>
                <TagList items={profile.vrcHistory} color="brand" />
              </div>
            )}

            {profile.joinPolicy && profile.joinPolicy.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" /> フレンド申請
                </p>
                <TagList items={profile.joinPolicy} color="brand" />
              </div>
            )}
            {profile.playStyles.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6" /> プレイスタイル
                </p>
                <TagList items={profile.playStyles} color="brand" />
              </div>
            )}

            {profile.playEnvironments.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Monitor className="w-6 h-6" /> プレイ環境
                </p>
                <TagList items={profile.playEnvironments} color="brand" />
              </div>
            )}

            {profile.creatives.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> クリエイティブ
                </p>
                <TagList items={profile.creatives} color="brand" />
              </div>
            )}
            
            {profile.activeTimes.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Clock className="w-6 h-6" /> 出没時間
                </p>
                <TagList items={profile.activeTimes} color="brand" />
              </div>
            )}

            {profile.partnerStatus && profile.partnerStatus.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Heart className="w-6 h-6" /> お砂糖
                </p>
                <TagList items={profile.partnerStatus} color="brand" />
              </div>
            )}

            {profile.groups && profile.groups.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Users className="w-6 h-6" /> 所属グループ
                </p>
                <TagList items={profile.groups} color="brand" />
              </div>
            )}

            {profile.favoriteWorlds && profile.favoriteWorlds.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Globe className="w-6 h-6" /> 好きなワールド
                </p>
                <TagList items={profile.favoriteWorlds} color="brand" />
              </div>
            )}

            {profile.favoriteGames && profile.favoriteGames.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6" /> 好きなゲーム
                </p>
                <TagList items={profile.favoriteGames} color="brand" />
              </div>
            )}

            {profile.favoriteMangas && profile.favoriteMangas.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Book className="w-6 h-6" /> 好きな漫画
                </p>
                <TagList items={profile.favoriteMangas} color="brand" />
              </div>
            )}

            {profile.favoriteAnimes && profile.favoriteAnimes.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Tv className="w-6 h-6" /> 好きなアニメ
                </p>
                <TagList items={profile.favoriteAnimes} color="brand" />
              </div>
            )}

            {profile.favoriteStreamers && profile.favoriteStreamers.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Mic className="w-6 h-6" /> 好きな配信者
                </p>
                <TagList items={profile.favoriteStreamers} color="brand" />
              </div>
            )}

            {profile.favoriteMusics && profile.favoriteMusics.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Music className="w-6 h-6" /> 好きな音楽
                </p>
                <TagList items={profile.favoriteMusics} color="brand" />
              </div>
            )}

            {profile.mbti && profile.mbti.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <Brain className="w-6 h-6" /> MBTI
                </p>
                <TagList items={profile.mbti} color="brand" />
              </div>
            )}

            {profile.realLife && profile.realLife.length > 0 && (
              <div>
                <p className="text-xl md:text-2xl font-bold text-brand-text/60 mb-3 flex items-center gap-2">
                  <User className="w-6 h-6" /> リアル属性
                </p>
                <TagList items={profile.realLife} color="brand" />
              </div>
            )}
          </div>

          {/* 自由記述セクション（各種タグエリアの下） */}
          {profile.freeSections && profile.freeSections.length > 0 && (
            <div className="w-full space-y-6 mb-10">
              {profile.freeSections.map((section, idx) => (
                section.title || section.content ? (
                  <div key={idx} className="w-full bg-brand-card/60 p-8 rounded-3xl shadow-sm border border-brand-sub/20">
                    {section.title && (
                      <h3 className="text-2xl md:text-3xl font-black text-brand-accent mb-4 border-b-2 border-brand-sub/20 pb-3">
                        {section.title}
                      </h3>
                    )}
                    {section.content && (
                      <div className="text-xl md:text-2xl font-bold text-brand-text/90 whitespace-pre-wrap leading-relaxed">
                        {section.content}
                      </div>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          )}

          {/* 下部ギャラリー画像（作品一覧風） */}
          {profile.galleryImages && profile.galleryImages.length > 0 && (
            <div className="mt-12 w-full">
              <h3 className="text-xl font-black text-brand-text mb-6 flex items-center gap-2 border-b-2 border-brand-pink/30 pb-2">
                <ImageIcon className="w-6 h-6 text-brand-pink" /> ギャラリー
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.galleryImages.map((img, i) => (
                  <div key={i} className="aspect-[16/9] bg-brand-sub/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-brand-sub/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export interface ProfileData {
  avatarUrl: string | null;
  avatarUrls: string[];
  coverImage: string | null;
  backgroundImage: string | null;
  themeColor: string;
  galleryImages: string[];
  username: string;
  userId: string;
  playStyles: string[];
  playEnvironments: string[];
  joinPolicy: string[];
  vrcHistory: string[];
  creatives: string[];
  activeTimes: string[];
  partnerStatus: string[];
  // 詳細項目
  bio: string;
  freeSections: { title: string; content: string }[];
  customTags: string[];
  hobbies: string;
  groups: string[];
  favoriteWorlds: string[];
  favoriteGames: string[];
  favoriteMangas: string[];
  favoriteAnimes: string[];
  favoriteStreamers: string[];
  favoriteMusics: string[];
  mbti: string[];
  realLife: string[];
  links: {
    twitter: string;
    discord: string;
    youtube: string;
    booth: string;
    vrc: string;
    others: { title: string; url: string }[];
  };
  isSearchable: boolean;
}

export const defaultProfile: ProfileData = {
  avatarUrl: null,
  avatarUrls: [],
  coverImage: null,
  backgroundImage: null,
  themeColor: "pink",
  galleryImages: [],
  username: "",
  userId: "",
  playStyles: [],
  playEnvironments: [],
  joinPolicy: [],
  vrcHistory: [],
  creatives: [],
  activeTimes: [],
  partnerStatus: [],
  bio: "",
  freeSections: [],
  customTags: [],
  hobbies: "",
  groups: [],
  favoriteWorlds: [],
  favoriteGames: [],
  favoriteMangas: [],
  favoriteAnimes: [],
  favoriteStreamers: [],
  favoriteMusics: [],
  mbti: [],
  realLife: [],
  links: {
    twitter: "",
    discord: "",
    youtube: "",
    booth: "",
    vrc: "",
    others: [],
  },
  isSearchable: false,
};

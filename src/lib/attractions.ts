import type { Lang } from "./i18n";

export type Attraction = {
  id: string;
  nameZh: string;
  nameEn: string;
  nameJa: string;
  nameKo: string;
  lat: number;
  lng: number;
  ticket: number;
  categoryZh: string;
  categoryEn: string;
  categoryJa: string;
  categoryKo: string;
  imageUrl: string;
  imageCredit?: string;
  featured?: boolean;
};

// Wikimedia Commons thumbnails (public domain / Creative Commons).
// The Special:FilePath redirector follows the actual file regardless of folder structure.
const wikimedia = (filename: string, width = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;

export const TAIPEI_ATTRACTIONS: Attraction[] = [
  {
    id: "taipei101",
    nameZh: "台北101觀景台",
    nameEn: "Taipei 101 Observatory",
    nameJa: "台北101展望台",
    nameKo: "타이베이 101 전망대",
    lat: 25.0339,
    lng: 121.5645,
    ticket: 600,
    categoryZh: "地標",
    categoryEn: "Landmark",
    categoryJa: "ランドマーク",
    categoryKo: "랜드마크",
    imageUrl: wikimedia("Taipei 101 from afar.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "npm",
    nameZh: "國立故宮博物院",
    nameEn: "National Palace Museum",
    nameJa: "国立故宮博物院",
    nameKo: "국립고궁박물원",
    lat: 25.1023,
    lng: 121.5485,
    ticket: 350,
    categoryZh: "博物館",
    categoryEn: "Museum",
    categoryJa: "博物館",
    categoryKo: "박물관",
    imageUrl: wikimedia("National Palace Museum Front View.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "shilin",
    nameZh: "士林夜市",
    nameEn: "Shilin Night Market",
    nameJa: "士林夜市",
    nameKo: "스린 야시장",
    lat: 25.0884,
    lng: 121.5246,
    ticket: 0,
    categoryZh: "夜市美食",
    categoryEn: "Night Market",
    categoryJa: "夜市",
    categoryKo: "야시장",
    imageUrl: wikimedia("Shilin Night Market.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "raohe",
    nameZh: "饒河街觀光夜市",
    nameEn: "Raohe Night Market",
    nameJa: "饒河街観光夜市",
    nameKo: "라오허제 관광야시장",
    lat: 25.0511,
    lng: 121.5775,
    ticket: 0,
    categoryZh: "夜市美食",
    categoryEn: "Night Market",
    categoryJa: "夜市",
    categoryKo: "야시장",
    imageUrl: wikimedia("Raohe Street Tourist Night Market 20180616.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "ningxia",
    nameZh: "寧夏夜市",
    nameEn: "Ningxia Night Market",
    nameJa: "寧夏夜市",
    nameKo: "닝샤 야시장",
    lat: 25.0567,
    lng: 121.5152,
    ticket: 0,
    categoryZh: "夜市美食",
    categoryEn: "Night Market",
    categoryJa: "夜市",
    categoryKo: "야시장",
    imageUrl: wikimedia("Ningxia Night Market 20140615.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "yongkang",
    nameZh: "永康街美食",
    nameEn: "Yongkang Street Food District",
    nameJa: "永康街グルメ",
    nameKo: "융캉제 맛집 거리",
    lat: 25.0331,
    lng: 121.5298,
    ticket: 0,
    categoryZh: "美食街",
    categoryEn: "Food Street",
    categoryJa: "グルメ街",
    categoryKo: "맛집 거리",
    imageUrl: wikimedia("Yongkang Street, Da-an, Taipei.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "ximending",
    nameZh: "西門町",
    nameEn: "Ximending",
    nameJa: "西門町",
    nameKo: "시먼딩",
    lat: 25.0421,
    lng: 121.5067,
    ticket: 0,
    categoryZh: "商圈",
    categoryEn: "Shopping District",
    categoryJa: "ショッピング街",
    categoryKo: "쇼핑가",
    imageUrl: wikimedia("Ximending in Taipei City.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "elephant",
    nameZh: "象山步道",
    nameEn: "Elephant Mountain Trail",
    nameJa: "象山ハイキングコース",
    nameKo: "샹산 등산로",
    lat: 25.0274,
    lng: 121.571,
    ticket: 0,
    categoryZh: "秘境探索",
    categoryEn: "Hiking",
    categoryJa: "ハイキング",
    categoryKo: "하이킹",
    imageUrl: wikimedia("Taipei 101 from Xiangshan, Taipei 20180813.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "longshan",
    nameZh: "龍山寺",
    nameEn: "Longshan Temple",
    nameJa: "龍山寺",
    nameKo: "룽산쓰",
    lat: 25.0372,
    lng: 121.4998,
    ticket: 0,
    categoryZh: "古蹟",
    categoryEn: "Heritage",
    categoryJa: "史跡",
    categoryKo: "유적",
    imageUrl: wikimedia("Lungshan Temple Taipei.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "cks",
    nameZh: "中正紀念堂",
    nameEn: "CKS Memorial Hall",
    nameJa: "中正紀念堂",
    nameKo: "중정기념당",
    lat: 25.0349,
    lng: 121.5219,
    ticket: 0,
    categoryZh: "地標",
    categoryEn: "Landmark",
    categoryJa: "ランドマーク",
    categoryKo: "랜드마크",
    imageUrl: wikimedia("Liberty Square in Chiang Kai-shek Memorial Hall.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "huashan",
    nameZh: "華山1914文創園區",
    nameEn: "Huashan 1914 Creative Park",
    nameJa: "華山1914文創パーク",
    nameKo: "화산1914 문화창의단지",
    lat: 25.044,
    lng: 121.5294,
    ticket: 0,
    categoryZh: "文青散策",
    categoryEn: "Culture",
    categoryJa: "カルチャー",
    categoryKo: "문화",
    imageUrl: wikimedia("Huashan 1914 Creative Park Plaza 20140817.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "songyan",
    nameZh: "松山文創園區",
    nameEn: "Songshan Cultural Park",
    nameJa: "松山文創パーク",
    nameKo: "송산 문화창의단지",
    lat: 25.044,
    lng: 121.5605,
    ticket: 0,
    categoryZh: "文青散策",
    categoryEn: "Culture",
    categoryJa: "カルチャー",
    categoryKo: "문화",
    imageUrl: wikimedia("Songshan Cultural and Creative Park.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "maokong",
    nameZh: "貓空纜車",
    nameEn: "Maokong Gondola",
    nameJa: "猫空ロープウェイ",
    nameKo: "마오쿵 곤돌라",
    lat: 24.9682,
    lng: 121.5879,
    ticket: 120,
    categoryZh: "秘境探索",
    categoryEn: "Scenic",
    categoryJa: "絶景",
    categoryKo: "절경",
    imageUrl: wikimedia("Maokong Gondola Cabin.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "zoo",
    nameZh: "台北市立動物園",
    nameEn: "Taipei Zoo",
    nameJa: "台北市立動物園",
    nameKo: "타이베이 시립동물원",
    lat: 24.9982,
    lng: 121.5811,
    ticket: 60,
    categoryZh: "親子體驗",
    categoryEn: "Family",
    categoryJa: "ファミリー",
    categoryKo: "가족",
    imageUrl: wikimedia("Taipei Zoo Entrance 20120428.jpg"),
    imageCredit: "Wikimedia",
    featured: true,
  },
  {
    id: "ntch",
    nameZh: "國家兩廳院",
    nameEn: "National Theater & Concert Hall",
    nameJa: "国家両庁院",
    nameKo: "국가 양청원",
    lat: 25.0359,
    lng: 121.5208,
    ticket: 800,
    categoryZh: "演唱會",
    categoryEn: "Performing Arts",
    categoryJa: "舞台芸術",
    categoryKo: "공연예술",
    imageUrl: wikimedia("National Theater Taiwan.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "dadaocheng",
    nameZh: "大稻埕",
    nameEn: "Dadaocheng",
    nameJa: "大稲埕",
    nameKo: "다다오청",
    lat: 25.0561,
    lng: 121.5099,
    ticket: 0,
    categoryZh: "市集展演",
    categoryEn: "Old Town",
    categoryJa: "旧市街",
    categoryKo: "옛 거리",
    imageUrl: wikimedia("Dihua Street, Taipei 20140419.jpg"),
    imageCredit: "Wikimedia",
  },
  {
    id: "beitou",
    nameZh: "北投溫泉博物館",
    nameEn: "Beitou Hot Spring Museum",
    nameJa: "北投温泉博物館",
    nameKo: "베이터우 온천박물관",
    lat: 25.1366,
    lng: 121.5064,
    ticket: 0,
    categoryZh: "親子體驗",
    categoryEn: "Family",
    categoryJa: "ファミリー",
    categoryKo: "가족",
    imageUrl: wikimedia("Beitou Hot Spring Museum 20120426.jpg"),
    imageCredit: "Wikimedia",
  },
];

// Category → gradient + emoji used for image fallback when remote image fails
export const CATEGORY_THEME: Record<
  string,
  { gradient: string; emoji: string }
> = {
  Landmark: { gradient: "from-amber-700 to-orange-900", emoji: "🏙️" },
  Museum: { gradient: "from-sky-700 to-indigo-900", emoji: "🏛️" },
  "Night Market": { gradient: "from-rose-700 to-red-900", emoji: "🍜" },
  "Food Street": { gradient: "from-orange-700 to-rose-900", emoji: "🥟" },
  "Shopping District": { gradient: "from-fuchsia-700 to-purple-900", emoji: "🛍️" },
  Hiking: { gradient: "from-emerald-700 to-teal-900", emoji: "🥾" },
  Heritage: { gradient: "from-amber-800 to-yellow-900", emoji: "🏯" },
  Culture: { gradient: "from-violet-700 to-fuchsia-900", emoji: "🎨" },
  Scenic: { gradient: "from-cyan-700 to-blue-900", emoji: "🚠" },
  Family: { gradient: "from-cyan-600 to-emerald-800", emoji: "👨‍👩‍👧" },
  "Performing Arts": { gradient: "from-rose-700 to-pink-900", emoji: "🎭" },
  "Old Town": { gradient: "from-stone-700 to-amber-900", emoji: "🏘️" },
};

export function attractionTheme(a: Attraction) {
  return (
    CATEGORY_THEME[a.categoryEn] ?? {
      gradient: "from-slate-700 to-slate-900",
      emoji: "📍",
    }
  );
}

export function attractionName(a: Attraction, lang: Lang): string {
  switch (lang) {
    case "zh": return a.nameZh;
    case "en": return a.nameEn;
    case "ja": return a.nameJa;
    case "ko": return a.nameKo;
  }
}

export function attractionCategory(a: Attraction, lang: Lang): string {
  switch (lang) {
    case "zh": return a.categoryZh;
    case "en": return a.categoryEn;
    case "ja": return a.categoryJa;
    case "ko": return a.categoryKo;
  }
}

const KKDAY_LOCALE: Record<Lang, string> = {
  zh: "zh-tw",
  en: "en",
  ja: "ja",
  ko: "ko",
};

export function kkdayTicketUrl(a: Attraction, lang: Lang): string {
  const keyword = lang === "zh" ? a.nameZh : a.nameEn;
  const locale = KKDAY_LOCALE[lang];
  return `https://www.kkday.com/${locale}/search?keyword=${encodeURIComponent(keyword)}`;
}

export const TAIPEI_CENTER = { lat: 25.0478, lng: 121.5318 };

export const TAIPEI_BOUNDS = {
  minLat: 24.95,
  maxLat: 25.21,
  minLng: 121.45,
  maxLng: 121.67,
};

export function isWithinTaipei(lat: number, lng: number): boolean {
  return (
    lat >= TAIPEI_BOUNDS.minLat &&
    lat <= TAIPEI_BOUNDS.maxLat &&
    lng >= TAIPEI_BOUNDS.minLng &&
    lng <= TAIPEI_BOUNDS.maxLng
  );
}

export const FEATURED_ATTRACTIONS = TAIPEI_ATTRACTIONS.filter(
  (a) => a.featured
);

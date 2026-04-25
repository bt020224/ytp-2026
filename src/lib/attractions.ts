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
};

export const TAIPEI_ATTRACTIONS: Attraction[] = [
  { id: "taipei101", nameZh: "台北101觀景台", nameEn: "Taipei 101 Observatory", nameJa: "台北101展望台", nameKo: "타이베이 101 전망대", lat: 25.0339, lng: 121.5645, ticket: 600, categoryZh: "地標", categoryEn: "Landmark", categoryJa: "ランドマーク", categoryKo: "랜드마크" },
  { id: "npm", nameZh: "國立故宮博物院", nameEn: "National Palace Museum", nameJa: "国立故宮博物院", nameKo: "국립고궁박물원", lat: 25.1023, lng: 121.5485, ticket: 350, categoryZh: "博物館", categoryEn: "Museum", categoryJa: "博物館", categoryKo: "박물관" },
  { id: "shilin", nameZh: "士林夜市", nameEn: "Shilin Night Market", nameJa: "士林夜市", nameKo: "스린 야시장", lat: 25.0884, lng: 121.5246, ticket: 0, categoryZh: "夜市", categoryEn: "Night Market", categoryJa: "夜市", categoryKo: "야시장" },
  { id: "raohe", nameZh: "饒河街觀光夜市", nameEn: "Raohe Night Market", nameJa: "饒河街観光夜市", nameKo: "라오허제 관광야시장", lat: 25.0511, lng: 121.5775, ticket: 0, categoryZh: "夜市", categoryEn: "Night Market", categoryJa: "夜市", categoryKo: "야시장" },
  { id: "ximending", nameZh: "西門町", nameEn: "Ximending", nameJa: "西門町", nameKo: "시먼딩", lat: 25.0421, lng: 121.5067, ticket: 0, categoryZh: "商圈", categoryEn: "Shopping District", categoryJa: "ショッピング街", categoryKo: "쇼핑가" },
  { id: "elephant", nameZh: "象山步道", nameEn: "Elephant Mountain Trail", nameJa: "象山ハイキングコース", nameKo: "샹산 등산로", lat: 25.0274, lng: 121.5710, ticket: 0, categoryZh: "秘境探索", categoryEn: "Hiking", categoryJa: "ハイキング", categoryKo: "하이킹" },
  { id: "longshan", nameZh: "龍山寺", nameEn: "Longshan Temple", nameJa: "龍山寺", nameKo: "룽산쓰", lat: 25.0372, lng: 121.4998, ticket: 0, categoryZh: "古蹟", categoryEn: "Heritage", categoryJa: "史跡", categoryKo: "유적" },
  { id: "cks", nameZh: "中正紀念堂", nameEn: "CKS Memorial Hall", nameJa: "中正紀念堂", nameKo: "중정기념당", lat: 25.0349, lng: 121.5219, ticket: 0, categoryZh: "地標", categoryEn: "Landmark", categoryJa: "ランドマーク", categoryKo: "랜드마크" },
  { id: "huashan", nameZh: "華山1914文創園區", nameEn: "Huashan 1914 Creative Park", nameJa: "華山1914文創パーク", nameKo: "화산1914 문화창의단지", lat: 25.0440, lng: 121.5294, ticket: 0, categoryZh: "文青散策", categoryEn: "Culture", categoryJa: "カルチャー", categoryKo: "문화" },
  { id: "songyan", nameZh: "松山文創園區", nameEn: "Songshan Cultural Park", nameJa: "松山文創パーク", nameKo: "송산 문화창의단지", lat: 25.0440, lng: 121.5605, ticket: 0, categoryZh: "文青散策", categoryEn: "Culture", categoryJa: "カルチャー", categoryKo: "문화" },
  { id: "maokong", nameZh: "貓空纜車", nameEn: "Maokong Gondola", nameJa: "猫空ロープウェイ", nameKo: "마오쿵 곤돌라", lat: 24.9682, lng: 121.5879, ticket: 120, categoryZh: "秘境探索", categoryEn: "Scenic", categoryJa: "絶景", categoryKo: "절경" },
  { id: "zoo", nameZh: "台北市立動物園", nameEn: "Taipei Zoo", nameJa: "台北市立動物園", nameKo: "타이베이 시립동물원", lat: 24.9982, lng: 121.5811, ticket: 60, categoryZh: "親子體驗", categoryEn: "Family", categoryJa: "ファミリー", categoryKo: "가족" },
  { id: "ntch", nameZh: "國家兩廳院", nameEn: "National Theater & Concert Hall", nameJa: "国家両庁院", nameKo: "국가 양청원", lat: 25.0359, lng: 121.5208, ticket: 800, categoryZh: "演唱會", categoryEn: "Performing Arts", categoryJa: "舞台芸術", categoryKo: "공연예술" },
  { id: "dadaocheng", nameZh: "大稻埕", nameEn: "Dadaocheng", nameJa: "大稲埕", nameKo: "다다오청", lat: 25.0561, lng: 121.5099, ticket: 0, categoryZh: "市集展演", categoryEn: "Old Town", categoryJa: "旧市街", categoryKo: "옛 거리" },
  { id: "beitou", nameZh: "北投溫泉博物館", nameEn: "Beitou Hot Spring Museum", nameJa: "北投温泉博物館", nameKo: "베이터우 온천박물관", lat: 25.1366, lng: 121.5064, ticket: 0, categoryZh: "親子體驗", categoryEn: "Family", categoryJa: "ファミリー", categoryKo: "가족" },
];

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

export type Lang = "zh" | "en" | "ja" | "ko";

type L = Record<Lang, string>;

export const STRINGS: Record<string, L> = {
  appTitle: {
    zh: "台北找樂｜玩樂推薦",
    en: "台北找樂 — Find Fun in Taipei",
    ja: "台北找樂｜台北おすすめ",
    ko: "台北找樂｜타이베이 추천",
  },
  subtitle: {
    zh: "情境感知 × 個人化體驗推薦（限定台北）",
    en: "Context-aware & personalized experiences (Taipei only)",
    ja: "コンテキスト認識 × パーソナライズ体験（台北限定）",
    ko: "상황 인식 × 개인 맞춤 추천 (타이베이 한정)",
  },
  origin: { zh: "我的位置", en: "My Location", ja: "現在地", ko: "내 위치" },
  useGps: {
    zh: "使用目前位置",
    en: "Use Current Location",
    ja: "現在地を取得",
    ko: "현재 위치 사용",
  },
  manualLatLng: {
    zh: "或輸入經緯度",
    en: "Or enter coordinates",
    ja: "または緯度経度を入力",
    ko: "또는 좌표 입력",
  },
  destination: { zh: "目的地", en: "Destination", ja: "目的地", ko: "목적지" },
  pickDest: {
    zh: "請選擇景點…",
    en: "Pick an attraction…",
    ja: "観光地を選択…",
    ko: "관광지를 선택…",
  },
  transport: {
    zh: "交通方式",
    en: "Transport Mode",
    ja: "交通手段",
    ko: "교통수단",
  },
  walk: { zh: "步行", en: "Walk", ja: "徒歩", ko: "도보" },
  ubike: { zh: "YouBike", en: "YouBike", ja: "YouBike", ko: "YouBike" },
  mrt: { zh: "捷運", en: "MRT", ja: "MRT", ko: "MRT" },
  bus: { zh: "公車", en: "Bus", ja: "バス", ko: "버스" },
  taxi: { zh: "計程車", en: "Taxi", ja: "タクシー", ko: "택시" },
  distance: { zh: "距離", en: "Distance", ja: "距離", ko: "거리" },
  fare: {
    zh: "預估費用",
    en: "Estimated Fare",
    ja: "推定料金",
    ko: "예상 요금",
  },
  duration: {
    zh: "預估時間",
    en: "Estimated Time",
    ja: "所要時間",
    ko: "예상 시간",
  },
  km: { zh: "公里", en: "km", ja: "km", ko: "km" },
  minutes: { zh: "分鐘", en: "min", ja: "分", ko: "분" },
  free: { zh: "免費", en: "Free", ja: "無料", ko: "무료" },
  ticket: { zh: "門票", en: "Ticket", ja: "入場料", ko: "입장료" },
  nearby: {
    zh: "目的地附近推薦景點",
    en: "Nearby Attractions",
    ja: "周辺の観光スポット",
    ko: "주변 추천 명소",
  },
  notInTaipei: {
    zh: "您不在台北範圍內，已使用台北市中心做為起點。",
    en: "Outside Taipei — defaulting origin to Taipei center.",
    ja: "台北エリア外です。台北中心部を起点とします。",
    ko: "타이베이 외부입니다. 타이베이 중심을 기본 출발점으로 설정합니다.",
  },
  gpsDenied: {
    zh: "瀏覽器拒絕定位權限，請點地圖或手動輸入經緯度。",
    en: "Location permission denied. Click on the map or enter coordinates.",
    ja: "ブラウザが位置情報を拒否しました。地図をクリックするか、緯度経度を入力してください。",
    ko: "브라우저가 위치 정보를 거부했습니다. 지도를 클릭하거나 좌표를 입력하세요.",
  },
  gpsTimeout: {
    zh: "定位逾時，請改用地圖點選或手動輸入。",
    en: "Location request timed out. Try clicking the map instead.",
    ja: "位置情報の取得がタイムアウトしました。地図で指定してください。",
    ko: "위치 요청 시간이 초과되었습니다. 지도에서 선택하세요.",
  },
  gpsUnavailable: {
    zh: "目前無法取得定位（GPS 訊號或裝置問題）。",
    en: "Location unavailable (GPS signal or device issue).",
    ja: "位置情報を取得できません（GPS信号またはデバイスの問題）。",
    ko: "위치 정보를 사용할 수 없습니다 (GPS 신호 또는 기기 문제).",
  },
  gpsUnsupported: {
    zh: "此瀏覽器不支援定位功能。",
    en: "This browser does not support geolocation.",
    ja: "このブラウザは位置情報をサポートしていません。",
    ko: "이 브라우저는 위치 정보를 지원하지 않습니다.",
  },
  pickOnMap: {
    zh: "點地圖設定起點",
    en: "Click map to set origin",
    ja: "地図をクリックして起点を設定",
    ko: "지도를 클릭하여 출발점 설정",
  },
  fillFirst: {
    zh: "請先設定起點與目的地",
    en: "Please set origin and destination first",
    ja: "起点と目的地を先に設定してください",
    ko: "출발점과 목적지를 먼저 설정하세요",
  },
  askAi: {
    zh: "問問 AI 關於這個景點",
    en: "Ask AI about this attraction",
    ja: "この観光地についてAIに質問",
    ko: "AI에게 이 명소에 대해 질문",
  },
  askPlaceholder: {
    zh: "例：開放時間？必看亮點？附近美食？",
    en: "e.g. Hours? Must-see? Best food nearby?",
    ja: "例：営業時間は？見どころは？周辺グルメは？",
    ko: "예: 영업시간? 꼭 봐야 할 곳? 근처 맛집?",
  },
  askButton: { zh: "詢問", en: "Ask", ja: "質問する", ko: "질문하기" },
  askPickFirst: {
    zh: "請先選擇目的地",
    en: "Pick a destination first",
    ja: "先に目的地を選択してください",
    ko: "먼저 목적지를 선택하세요",
  },
  askLoading: {
    zh: "AI 思考中…",
    en: "AI is thinking…",
    ja: "AIが考え中…",
    ko: "AI가 생각 중…",
  },
  askError: {
    zh: "發生錯誤，請稍後再試",
    en: "Something went wrong. Try again.",
    ja: "エラーが発生しました。後でやり直してください",
    ko: "오류가 발생했습니다. 다시 시도해 주세요",
  },
  recommendedRoutes: {
    zh: "建議路線",
    en: "Suggested Routes",
    ja: "おすすめルート",
    ko: "추천 경로",
  },
  totalLabel: { zh: "合計", en: "Total", ja: "合計", ko: "합계" },
  tagFastest: { zh: "最快", en: "Fastest", ja: "最速", ko: "최단시간" },
  tagCheapest: {
    zh: "最便宜",
    en: "Cheapest",
    ja: "最安",
    ko: "최저가",
  },
  tagBalanced: {
    zh: "推薦",
    en: "Recommended",
    ja: "おすすめ",
    ko: "추천",
  },
  ticketInfo: {
    zh: "門票資訊",
    en: "Ticket",
    ja: "入場券",
    ko: "입장권",
  },
  buyTicket: {
    zh: "前往 KKday 購票",
    en: "Buy on KKday",
    ja: "KKdayで購入",
    ko: "KKday에서 구매",
  },
  buyTicketNote: {
    zh: "將於新分頁開啟外部購票平台",
    en: "Opens external ticketing in a new tab",
    ja: "新しいタブで外部購入サイトを開きます",
    ko: "새 탭에서 외부 예매 사이트를 엽니다",
  },
  freeNoTicket: {
    zh: "此景點免費入場，無需購票",
    en: "Free entry — no ticket needed",
    ja: "入場無料 — チケット不要",
    ko: "무료 입장 — 티켓 불필요",
  },
  detailedDirections: {
    zh: "AI 詳細指引",
    en: "AI Detailed Directions",
    ja: "AI 詳しい案内",
    ko: "AI 상세 안내",
  },
  loadingDetail: {
    zh: "AI 生成路線指引中…",
    en: "Generating directions…",
    ja: "案内を生成中…",
    ko: "안내를 생성 중…",
  },
  hideDetail: {
    zh: "收合",
    en: "Hide",
    ja: "閉じる",
    ko: "접기",
  },
  detailDisclaimer: {
    zh: "※ AI 估算，實際請以站內資訊為準",
    en: "※ AI estimate — confirm at the station",
    ja: "※ AI推定。実際は駅で確認してください",
    ko: "※ AI 추정 — 역에서 확인하세요",
  },
  showOnMap: {
    zh: "於地圖上顯示",
    en: "Show on map",
    ja: "地図に表示",
    ko: "지도에 표시",
  },
  selectedOnMap: {
    zh: "已顯示於地圖",
    en: "Showing on map",
    ja: "地図に表示中",
    ko: "지도에 표시 중",
  },
  legend: { zh: "圖例", en: "Legend", ja: "凡例", ko: "범례" },
  brand: {
    zh: "台北找樂",
    en: "Taipei Find Fun",
    ja: "台北で遊ぼう",
    ko: "타이베이 즐기기",
  },
  brandTagline: {
    zh: "AI · 路線 · 票券 · 多語",
    en: "AI · Routes · Tickets · Multilingual",
    ja: "AI · ルート · チケット · 多言語",
    ko: "AI · 경로 · 티켓 · 다국어",
  },
  apiKeyMissingTitle: {
    zh: "尚未設定 AI 金鑰",
    en: "AI key not configured",
    ja: "APIキーが未設定です",
    ko: "AI 키가 설정되지 않았습니다",
  },
  apiKeyMissingBody: {
    zh: "需要設定 ANTHROPIC_API_KEY 才能使用 AI 功能。請在專案根目錄建立 .env.local 檔，加入金鑰後重啟 dev server。",
    en: "Set ANTHROPIC_API_KEY in .env.local at the project root, then restart the dev server.",
    ja: "プロジェクトルートの.env.localに ANTHROPIC_API_KEY を設定し、dev serverを再起動してください。",
    ko: "프로젝트 루트의 .env.local에 ANTHROPIC_API_KEY를 설정한 후 dev server를 재시작하세요.",
  },
  apiKeyGetIt: {
    zh: "前往 console.anthropic.com 取得金鑰",
    en: "Get a key at console.anthropic.com",
    ja: "console.anthropic.comでキーを取得",
    ko: "console.anthropic.com에서 키 발급",
  },
};

export type StringKey = keyof typeof STRINGS;
export const t = (key: StringKey, lang: Lang) => STRINGS[key][lang];

export const TRANSPORT_NOTES = {
  walkTooFar: {
    zh: "距離過長不建議步行",
    en: "Too far to walk comfortably",
    ja: "距離が長すぎて徒歩には不向き",
    ko: "도보로 이동하기에는 너무 멉니다",
  },
  ubikeTooFar: {
    zh: "距離過長不建議單車",
    en: "Too far for cycling",
    ja: "距離が長すぎてサイクリングには不向き",
    ko: "자전거로 이동하기에는 너무 멉니다",
  },
};

export const LANG_LABELS: Record<Lang, string> = {
  zh: "中",
  en: "EN",
  ja: "日",
  ko: "한",
};

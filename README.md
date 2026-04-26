# 台北找樂 · Taipei Find Fun

> **YTP 2026 黑客松 — 模組二｜AI 即時在地玩樂推播**
> 情境感知 × 個人化體驗推薦（限定台北）

一個 Next.js 14 + Leaflet 的台北旅遊推薦網站，整合 Claude Opus 4.7 提供即時路線指引、景點問答，並深連結 KKday 完成購票。

---

## ✨ 主要功能

| 區塊 | 功能 |
| --- | --- |
| 📍 起點 | 瀏覽器 GPS 定位 / 經緯度輸入 / 點地圖選擇；超出台北自動回中心 |
| 🎯 目的地 | 15 個熱門景點下拉選單（地標、夜市、博物館、文創、秘境、親子、演藝） |
| 🛣️ 建議路線 | 多模式路線規劃（步行 / YouBike / 捷運 / 公車 / 計程車），自動標記 **最快 / 最便宜 / 推薦** |
| 🗺️ 地圖整合 | 點選路線 → 地圖以**彩色分段線**繪製（步行綠虛線、捷運紅實線、公車藍虛線、計程車琥珀、YouBike 萊姆） |
| 📋 AI 詳細指引 | Claude Opus 4.7 生成段落式指引：捷運線名、起訖站、轉乘、班距、公車路線編號、步行方向 |
| 🎟️ 門票資訊 | 顯示票價，並深連結到 **KKday** 對應地區網站（中/英/日/韓四語版） |
| ✨ AI 問答 | 對所選景點直接發問（開放時間、必看亮點、附近美食） |
| 🌐 多語介面 | 繁體中文 / English / 日本語 / 한국어 一鍵切換，**包含景點名與分類** |

---

## 🧱 技術棧

- **[Next.js 14](https://nextjs.org/)** App Router、Server Components、API Routes
- **[Leaflet](https://leafletjs.com/) + react-leaflet** 地圖；底圖用 OpenStreetMap
- **[Tailwind CSS](https://tailwindcss.com/)** 樣式；Inter + Noto Sans TC 字型
- **[@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript)** Claude API（路線詳細指引、景點問答）
- **TypeScript** strict mode
- **Haversine** 距離計算；自製多模式路線規劃器

---

## 🚀 快速開始

```bash
git clone https://github.com/bt020224/ytp-2026.git
cd ytp-2026
npm install
```

### 設定 Claude API 金鑰

1. 到 [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) 申請金鑰
2. 在專案根目錄建立 `.env.local`：

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

> 沒設定金鑰時，AI 功能會顯示橘色「尚未設定 AI 金鑰」卡片並附取得連結；其他功能（地圖、路線、門票連結）不受影響。

### 啟動 dev server

```bash
npm run dev
# → http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

---

## 📁 專案結構

```
src/
├── app/
│   ├── api/
│   │   ├── ask/route.ts            # POST — 景點 AI 問答
│   │   └── route-detail/route.ts   # POST — 路線 AI 詳細指引
│   ├── globals.css                  # 字型、漸層背景、Leaflet 美化、動畫
│   ├── layout.tsx                   # Inter + Noto Sans TC 載入
│   └── page.tsx                     # 主畫面（accordion + 路線 + 地圖）
├── components/
│   └── MapView.tsx                  # Leaflet 地圖、彩色分段路線繪製
└── lib/
    ├── attractions.ts               # 15 個台北景點資料 + KKday URL helper
    ├── i18n.ts                      # 4 語言字串字典（30+ keys）
    └── transport.ts                 # 距離、費用、路線規劃、模式顏色
```

---

## 🛣️ 多模式路線演算法

依照起點到目的地的 Haversine 距離，挑出可行組合：

| 路線 ID | 段落 | 條件 |
| --- | --- | --- |
| `walk` | 純步行 | 距離 ≤ 3 km |
| `ubike` | 純 YouBike | 0.5 ≤ 距離 ≤ 10 km |
| `mrt` | 步行 0.5 → 捷運 → 步行 0.5 | 距離 ≥ 1.5 km |
| `bus` | 步行 0.2 → 公車 → 步行 0.2 | 距離 ≥ 0.8 km |
| `taxi` | 純計程車 | 任何距離 |

每條路線估時間（依模式平均速度）、估費用（捷運跳級、公車段票、計程車起跳跳表、YouBike 30 分鐘級距）。然後給最低時間者貼 **最快**、最低費用 **最便宜**、(time/maxT + fare/maxF) 最低且未被前兩者佔用 **推薦**。

費用模型來源：捷運 NT$20–65（依距離跳級）、公車 NT$15/段、計程車 NT$85 起跳 + NT$5/200m、YouBike 前 30 分 NT$10、超過每 30 分 +NT$20。**估算用，請以實際票價為準**。

---

## 🌐 i18n 系統

非常輕量、無外部依賴：

```ts
// src/lib/i18n.ts
export type Lang = "zh" | "en" | "ja" | "ko";
export const STRINGS: Record<string, Record<Lang, string>> = { /* ... */ };
export const t = (key, lang) => STRINGS[key][lang];
```

所有 UI 字串、警告、按鈕、圖例、錯誤訊息均 4 語言齊備。景點名與分類額外存 `nameJa / nameKo / categoryJa / categoryKo` 欄位於資料中。

---

## 🤖 Claude API 用法

兩個 server-side endpoints，模型 **`claude-opus-4-7`**：

### `POST /api/ask`

景點問答。系統提示要求專家身份、限制 150 字、不可虛構資料、依使用者語言回應。

```json
{
  "attractionId": "taipei101",
  "question": "開放時間？",
  "lang": "zh"
}
```

### `POST /api/route-detail`

路線詳細指引。系統提示要求 Taipei-specific 站名、線名、班距，不確定時要寫「請至站內確認」。

```json
{
  "originLat": 25.0421,
  "originLng": 121.5067,
  "destinationId": "taipei101",
  "route": { "id": "mrt", "segments": [/* ... */] },
  "lang": "zh"
}
```

兩個 endpoint 都有：
- 系統提示 `cache_control: ephemeral`（prompt caching）
- 缺金鑰、AuthError、RateLimit、APIError 分類處理
- 輸入驗證（500 字以下、必填欄位）

---

## 📝 模組二題目對應

> **Play Taipei: 情境感知與個人化體驗推薦**
>
> - 情境感知推薦：依使用者所在位置、時間、天候與停留行為，即時推送周邊景點、活動、展演與消費場域
> - 主題式個人化：設計互動介面讓使用者點選或輸入感興趣主題
> - 社群輿情探勘：蒐集分析 PTT、Dcard、IG、FB、Threads 等公開平台內容
> - 動態行程生成：透過 AI Agent 整合以上資訊，即時產製可調整之客製化行程

本專案目前已實作：**位置感知、主題分類**（地標／夜市／文青／親子等）、**AI 動態指引**、**多語化**。社群輿情探勘為未來迭代範圍。

---

## 🔮 後續迭代方向

- [ ] **TDX 運輸資料 API** 接入：捷運即時班距、公車即時到站（精確到分鐘）
- [ ] **OSRM 路徑** 替代直線：捷運/公車段顯示真實路網而非 Haversine 直線
- [ ] **PTT/Dcard/Threads 輿情**：用 NLP 抓取熱門景點與新興趨勢
- [ ] **動態行程**：AI Agent 串接多個景點 → 客製整日行程
- [ ] **真實票券 API**：與 KKday/KLOOK partner API 整合 in-app 結帳

---

## 📄 授權與致謝

- Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- AI by [Claude Opus 4.7](https://www.anthropic.com/claude) (Anthropic)
- Ticket links via [KKday](https://www.kkday.com/)

YTP 2026 Hackathon · 2026

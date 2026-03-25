# VeriSenior：Render / Vercel 部署與環境變數

GitHub Pages **只能放靜態前端**，無法接收 Threads Webhook。**後端 API 必須**部署在可執行 Node、有 HTTPS 的服務（例如 Render、Railway、Fly.io）。以下為環境變數清單與建議流程。

---

## 架構速覽

| 元件 | 建議部署 | 說明 |
|------|----------|------|
| **前端**（Vite PWA） | GitHub Pages、**Vercel Static**、Netlify | 需設定 `VITE_API_BASE` 指向後端網址 |
| **後端**（Express `server/`） | **Render Web Service**、Railway、Fly | 提供 `GET/POST /api/webhook`、`GET /api/verifications` |

Webhook URL 範例：`https://<你的後端網域>/api/webhook`（Meta 後台填此 HTTPS 位址）。

---

## 後端環境變數（`server/`，Render / 任何 Node 主機）

在 Render：**Dashboard → Web Service → Environment**，或使用 `.env`（本機）。

| 變數 | 必填 | 說明 |
|------|------|------|
| `PORT` | 選填 | Render 通常會注入 `PORT`，程式已讀取；本機預設 `3001`。 |
| `WEBHOOK_VERIFY_TOKEN` | **建議** | Meta 訂閱驗證用；與開發者後台填的 **Verify Token** 必須一致。 |
| `THREADS_ACCESS_TOKEN` | 選填 | Threads Graph（`graph.threads.net`）拉 parent 貼文；無則走示範/錯誤訊息。 |
| `META_ACCESS_TOKEN` | 選填 | 可與 Threads 共用部分情境；見 Meta 文件。 |
| `TWITTER_BEARER_TOKEN` | 選填 | 若未來接 X Webhook。 |
| `OPENAI_API_KEY` | 選填 | 啟用 GPT 查核；未設則看 `GEMINI_API_KEY` 或內建啟發式。 |
| `OPENAI_MODEL` | 選填 | 預設 `gpt-4o`。 |
| `GEMINI_API_KEY` | 選填 | 啟用 Gemini 查核。 |
| `GEMINI_MODEL` | 選填 | 預設 `gemini-2.0-flash`。 |

**Render 建議設定**

- **Root Directory**：`server`（若儲存庫根目錄含前端 + `server/` 子資料夾）
- **Build Command**：`npm install && npm run build`
- **Start Command**：`npm start`（執行 `node server.js`，需已 `tsc` 產出 `dist/`）
- **Health Check Path**（若有）：`/api/health`

資料檔：`server/data/verifications.json`（持久磁碟在免費方案可能重置；正式環境可改接資料庫）。

---

## 前端環境變數（專案根目錄，Vercel / 建置時注入）

在 **Vercel**：Project → **Settings → Environment Variables**，或 GitHub Actions / 本機 `.env.production`。

| 變數 | 必填 | 說明 |
|------|------|------|
| `VITE_API_BASE` | **建議** | 後端 API **原點**，**不要**結尾斜線。例：`https://verisenior-api.onrender.com`。**必須 HTTPS**。 |
| `VITE_VERIFICATIONS_MOCK` | 選填 | 設為 `true` 時，API 連不上才顯示內建假資料；正式站請勿設或設 `false`。 |

建置指令（與現有 `package.json` 一致）：`npm run build`。  
部署後瀏覽器會向 `VITE_API_BASE + '/api/verifications'` 輪詢（見 `src/api/verifications.ts`）。

---

## Meta 開發者後台（對照用）

| 欄位 | 填入 |
|------|------|
| Callback URL | `https://<後端網域>/api/webhook` 或 `https://<後端網域>/api/webhook/meta`（Meta Graph / Facebook Page） |
| Verify Token | 與 `WEBHOOK_VERIFY_TOKEN` **完全相同** |

---

## 一鍵複製（範例，請改成你的值）

```bash
# 後端（Render 等）
WEBHOOK_VERIFY_TOKEN=你的隨機密碼請與Meta後台一致
THREADS_ACCESS_TOKEN=從Meta取得
GEMINI_API_KEY=你的Gemini金鑰

# 前端建置（Vercel / 本機 production）
VITE_API_BASE=https://你的後端.onrender.com
```

將後端網址填進 `VITE_API_BASE` 後重新 **build + 部署前端**，PWA 才能拉到即時查核列表。

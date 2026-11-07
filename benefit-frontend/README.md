# Benefits Journey｜前端

電影特典地圖的前端介面，提供電影與影城探索、地圖，以及後台的電影影城維護、爬蟲同步、審核、紀錄與 Excel 下載。

## 技術與環境

- 前端框架／語言：Vue 3、JavaScript、Vite、Vue Router
- UI 與地圖套件：Bootstrap 5、Leaflet（OpenStreetMap Tiles、Marker）
- HTTP：Axios
- 部署：GitHub Pages
- 線上體驗：[https://inagakiromi.github.io/benefits-journey/map](https://inagakiromi.github.io/benefits-journey/map)
- 後端 API：由獨立的 Spring Boot 服務提供，正式環境為 [https://benefits-journey.onrender.com](https://benefits-journey.onrender.com)

## 主要頁面與功能

### 探索與地圖

- 瀏覽、搜尋電影與影城。電影探索可一併查看特典資訊。
- 在地圖上查看影城位置，以 Marker 標示每間影城。

### 管理介面

- 電影、影城的列表、新增與修改。
- 爬蟲資料同步、爬蟲審核與爬蟲紀錄。
- 將電影或影城資料下載為 Excel。

## 本機執行

### 環境需求

- Node.js `^22.18.0` 或 `>=24.12.0`（見 `package.json` 的 `engines`）
- 後端 API 需先在本機 `http://localhost:8080` 啟動。開發伺服器會把 `/api` 轉送到該位址，並去掉 `/api` 前綴。

### 安裝與啟動

```bash
npm install
npm run dev
```

啟動後開啟 [http://localhost:5173/](http://localhost:5173/)。

### 環境變數

| 變數           | 說明                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | API 基底路徑。本機 `.env` 設為 `/api`，由 Vite 代理到後端。正式建置讀取 `.env.production`，指向已部署的後端。 |

### 建置與預覽

```bash
npm run build
npm run preview
```

`npm run build` 的靜態資源前綴為 `/benefits-journey/`，供 GitHub Pages 使用。`npm run dev` 仍以網站根路徑 `/` 提供頁面。

完整專案介紹與測試入口請見 [專案首頁](../README.md)。

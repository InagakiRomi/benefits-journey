# Benefits Journey｜電影特典地圖

「電影特典地圖」整理電影與影城資料，讓使用者可以集中查詢電影、影城，並在地圖上查看影城位置。

影城與電影資料可透過爬蟲同步。同步結果先進入審核，通過後才寫入正式資料；也可以查詢爬蟲紀錄，並將電影、影城匯出成 Excel。

## 線上體驗

| 項目       | 連結                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 網站測試版 | [電影特典地圖](https://inagakiromi.github.io/benefits-journey/map)                             |
| 前端原始碼 | [benefit-frontend](https://github.com/InagakiRomi/benefits-journey/tree/main/benefit-frontend) |
| 後端原始碼 | [benefit-backend](https://github.com/InagakiRomi/benefits-journey/tree/main/benefit-backend)   |
| API 文件   | [Swagger UI](https://benefits-journey.onrender.com/swagger-ui/index.html)                      |

> 管理後台需管理員權限。Render 免費服務休眠後，首次開啟 API 可能需要等待。

## 測試管理員

登入後可進入後台，維護電影與影城、執行爬蟲同步與審核，以及下載 Excel。

| 項目 | 內容        |
| ---- | ----------- |
| 帳號 | `admin`     |
| 密碼 | `123123123` |

## 主要功能

- **電影與影城查詢**：前台可瀏覽、搜尋電影與影城；後台可新增、修改電影與影城資料。
- **影城地圖**：以地圖查看影城位置，依所在位置與搜尋條件找出附近影城。
- **爬蟲同步與審核**：爬取並同步影城、電影資料。待審核資料通過後才更新正式資料，拒絕則保留原資料，並可查詢爬蟲紀錄。
- **Excel 下載**：依電影或影城匯出 Excel。

## 技術概覽

| 範圍     | 技術                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 前端     | Vue 3、JavaScript、Vite、Vue Router、Bootstrap 5、Leaflet（OpenStreetMap、Marker）、Axios |
| 後端     | Java 17、Spring Boot 4、Spring Data JPA、Jsoup、Apache POI                                |
| 資料庫   | Microsoft SQL Server（本機預設）；H2（本機可選、Render 測試環境）                         |
| API 文件 | Swagger / OpenAPI                                                                         |
| 部署     | 前端 GitHub Pages、後端 Render                                                            |

## 主要使用流程

1. 瀏覽電影、影城，並在地圖上查看附近影城。
2. 於後台維護電影與影城資料。
3. 執行爬蟲同步，審核通過後寫入正式資料，並可查看爬蟲紀錄。
4. 將電影或影城資料下載為 Excel。

## 專案架構

- **前端**：負責電影列表、影城列表、地圖，以及後台的電影影城維護、爬蟲同步、審核、紀錄與 Excel 下載。詳見 [前端 README](benefit-frontend/README.md)。
- **後端**：提供電影、影城、地圖、爬蟲、審核、紀錄與 Excel 的 REST API，並處理全域錯誤、時間格式與 log。詳見 [後端 README](benefit-backend/README.md)。

## 專案狀態與注意事項

- 測試版已上線。前端部署於 GitHub Pages，後端部署於 Render，並以 H2 檔案資料庫運行。
- 未登入即可瀏覽電影、影城與地圖。
- 電影與影城維護、爬蟲同步、審核、紀錄與 Excel 下載只開放給管理員。
- 後端在 Render 免費方案休眠後，第一次呼叫 API 會較慢。爬蟲同步的電影與影城資料，經審核通過後才納入正式資料。

## 專案畫面

<img width="1905" height="1244" alt="localhost_5173_map" src="https://github.com/user-attachments/assets/8ea0f301-c403-4863-8661-6474ab09f5a4" />
<img width="1920" height="914" alt="localhost_5173_map (2)" src="https://github.com/user-attachments/assets/039139cf-075c-4c32-98d4-8585d8fd0460" />
<img width="1905" height="3771" alt="localhost_5173_movies" src="https://github.com/user-attachments/assets/272e2a8f-74dc-4a74-a42d-31fc8c656116" />
<img width="1905" height="1060" alt="localhost_5173_admin_crawler" src="https://github.com/user-attachments/assets/635f840c-3837-49f7-bdf0-e55a7ffe232c" />
<img width="1920" height="919" alt="localhost_5173_admin_crawler (1)" src="https://github.com/user-attachments/assets/d8526545-671e-4173-9856-aa11855b57bb" />
<img width="1920" height="919" alt="localhost_5173_admin_cinemas-movies_reviews" src="https://github.com/user-attachments/assets/1f87efc2-b8e1-4f70-b2cc-8a8ebb16a7cf" />
<img width="1905" height="957" alt="localhost_5173_admin_crawler-logs" src="https://github.com/user-attachments/assets/7b435c29-7e3c-444d-946c-6583eb416576" />

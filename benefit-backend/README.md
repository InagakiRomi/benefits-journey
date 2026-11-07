# Benefits Journey｜後端

電影特典地圖的 Spring Boot 後端服務，提供電影、影城查詢與地圖 API，並處理影城與電影的爬蟲同步、審核、紀錄與 Excel 匯出。

## 技術

| 項目 | 技術 |
| --- | --- |
| 語言／框架 | Java 17、Spring Boot 4 |
| 資料存取 | Spring Data JPA |
| 爬蟲與匯出 | Jsoup、Apache POI |
| 資料庫 | Microsoft SQL Server、H2（測試） |
| API 文件 | Swagger / OpenAPI（springdoc-openapi-starter-webmvc-ui） |
| 部署 | Render |

## 核心模組

### 電影與影城

- 電影、影城的查詢、新增及修改。
- 提供前台電影探索與影城探索；電影探索會一併帶出特典資訊。
- 地圖依緯度、經度與半徑搜尋附近影城，可再配合關鍵字與縣市等條件篩選。

### 爬蟲、審核與紀錄

1. 爬取影城或電影頁面，以 Jsoup 解析 HTML，並同步資料。
2. 同步結果建立爬蟲審核。僅待審核資料可以通過；通過後將爬蟲值更新至正式電影或影城。
3. 拒絕時狀態改為 `REJECTED`，不更新正式資料。
4. 可查詢、新增爬蟲紀錄，預設依執行時間降序排列。

### 匯出與共通處理

- 依 `CinemaResourceType` 匯出電影或影城 Excel。
- 提供 Swagger / OpenAPI 文件與測試介面。
- 全域錯誤處理、全域時間格式（日期時間為 `yyyy-MM-dd HH:mm:ss`），以及主控台 log 格式。

## API 文件

- Swagger UI：[https://benefits-journey.onrender.com/swagger-ui/index.html](https://benefits-journey.onrender.com/swagger-ui/index.html)
- OpenAPI JSON：`/v3/api-docs`
- 測試環境基底網址：`https://benefits-journey.onrender.com`（無額外 context path）

未登入即可查詢的主要路徑：

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| GET | `/movies/explore` | 前台電影探索 |
| GET | `/cinemas/explore` | 前台影城探索 |
| GET | `/cinemas/map` | 地圖影城搜尋 |

電影、影城的查詢、新增與修改，以及爬蟲、審核、紀錄、Excel 匯出需管理員。完整欄位與錯誤碼以 Swagger 為準。

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| GET、POST、PATCH | `/cinemas`、`/cinemas/{id}` | 影城查詢、新增、修改 |
| GET、POST、PATCH | `/movies`、`/movies/{id}` | 電影查詢、新增、修改 |
| GET | `/cinema-movie/crawler/cinemas`、`/cinema-movie/crawler/movies` | 爬取並同步影城、電影 |
| GET、POST | `/cinema-movie/reviews` | 查詢、新增爬蟲審核 |
| PATCH | `/cinema-movie/reviews/{id}/approve`、`/cinema-movie/reviews/{id}/reject` | 審核通過、拒絕 |
| GET、POST | `/crawler-logs` | 查詢、新增爬蟲紀錄 |
| GET | `/cinema-movie/export` | 匯出 Excel |

## 本機執行與測試

### 環境需求

- JDK 17
- 專案內的 Maven Wrapper（Windows 用 `mvnw.cmd`，macOS／Linux 用 `./mvnw`）

### 資料庫

- 未設定 `DB_TYPE` 時使用 `mssql`。連線寫在 `application.yml`：本機 SQL Server `localhost:14330`，資料庫 `BenefitsJourney`，帳號 `sa`。密碼在 `.env` 的 `DB_PASSWORD`。
- `DB_TYPE=h2` 會改走 `application-h2.yml`，使用檔案型 H2（`./data/h2/BenefitsJourney`）。Render 映像即採此設定；表由 JPA 建立，空資料庫再由 `SqlDataInitializer` 匯入種子 SQL。

### 環境變數

本機從專案根目錄的 `.env` 讀取（`application.yml` 的 `spring.config.import`）。

#### 必填

| 變數 | 沒設會怎樣 |
| --- | --- |
| `DB_PASSWORD` | 本機 SQL Server 的 `sa` 密碼，寫在 `.env`。`DB_TYPE=h2` 時不用。 |

#### 選填（沒設仍可啟動）

| 變數 | 未設定時 | 沒有它就測不到 |
| --- | --- | --- |
| `MAIL_USERNAME`、`MAIL_PASSWORD` | 沒設、或不是有效的 Gmail 帳號與應用程式密碼時，服務仍可啟動。忘記密碼不會寄出重設信，其餘 API 不受影響。帳密只留在 `.env`。 | 會員忘記密碼寄信。 |
| `PASSWORD_RESET_URL` | 沒設時不寄密碼重設信。 | 重設信裡的連結網址。 |
| `PORT` | 使用 `8080`。 | — |
| `DB_TYPE` | 使用 `mssql`，連本機 SQL Server。 | 設成 `h2` 才改走檔案型 H2，不必先裝 SQL Server。 |
| `ADMIN_INIT_ACCOUNT`、`ADMIN_INIT_PASSWORD`、`ADMIN_INIT_EMAIL` | 不建立管理員。三者都要有值才會建立；密碼須 8～16 碼。資料庫裡已有 `ADMIN`，或帳號／信箱已被占用時不會再建立。 | 電影、影城維護、爬蟲、審核、紀錄與 Excel 等管理 API。 |

電影探索、影城探索與地圖搜尋不依賴上表的選填變數。

### 啟動

SQL Server：

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

H2：

```bash
# Windows PowerShell
$env:DB_TYPE="h2"; .\mvnw.cmd spring-boot:run

# macOS / Linux
DB_TYPE=h2 ./mvnw spring-boot:run
```

啟動後可開 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)。

### 測試

```bash
# Windows
mvnw.cmd test

# macOS / Linux
./mvnw test
```

測試以 Mock 的 WebMvc 與 Service 單元測試為主，涵蓋電影、影城、地圖、爬蟲同步、審核、爬蟲紀錄、Excel 匯出、全域錯誤處理與時間格式。`BenefitsjourneyApplicationTests` 會啟動 Spring context，預設會連本機 SQL Server。不想連 SQL Server 時，執行這類測試前先設 `DB_TYPE=h2`。`MAIL_USERNAME`、`MAIL_PASSWORD` 沒設也能跑完 context 測試，只是寄信不會成功。

完整專案介紹與線上測試入口請見 [專案首頁](../README.md)。

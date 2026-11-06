<!-- ========== src/views/exchange/ExchangeMyFavoritesView.vue ========== -->
<!-- 會員收藏管理頁面 -->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { openAppAlert } from "@/components/ui/Alert.vue";
import { useAuth } from "@/composables/useAuth";
import PageIntro from "@/components/layout/PageIntro.vue";
import ResultBanner from "@/components/layout/ResultBanner.vue";
import StatePanel from "@/components/layout/StatePanel.vue";
import AppButton from "@/components/ui/Button.vue";
import heartIcon from "@iconify-icons/mdi/heart-outline";
import giftIcon from "@iconify-icons/mdi/gift-outline";
import ticketIcon from "@iconify-icons/mdi/ticket-outline";
import refreshIcon from "@iconify-icons/mdi/refresh";

import ExchangeFavoriteSection from "@/components/exchange/ExchangeFavoriteSection.vue";
import TicketFavoriteSection from "@/components/exchange/TicketFavoriteSection.vue";

import {
    getMyExchangeFavorites,
    removeExchangeFavorite,
    getMyTicketFavorites,
    removeTicketFavorite,
    getCinemas,
    getMovies,
} from "@/api/exchangeApi.js";

const {
    token,
    isLoggedIn,
    refreshAuth,
    logout,
} = useAuth();

const route = useRoute();
const router = useRouter();

// 避免多個 API 同時回傳 401 時重複處理。
const authExpiredHandled = ref(false);

const activeTab = ref("exchange");
const loading = ref(false);
const errorMessage = ref("");

const exchangeFavorites = ref([]);
const ticketFavorites = ref([]);
const cinemas = ref([]);
const movies = ref([]);
// 每 5 秒自動重新載入收藏的定時器
let favoritesRefreshTimer = null;

function unwrapList(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;

    return [];
}

function firstValue(item, keys, fallback = "") {
    for (const key of keys) {
        const value = item?.[key];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
}

function listingId(item, kind) {
    if (kind === "exchange") {
        return firstValue(item, [
            "exchangeListingId",
            "exchange_listing_id",
            "id",
        ]);
    }

    return firstValue(item, [
        "ticketListingId",
        "ticket_listing_id",
        "id",
    ]);
}

function favoriteListing(favorite, kind) {
    if (kind === "exchange") {
        return (
            favorite?.exchangeListing ??
            favorite?.exchangeListingBean ??
            favorite?.listing ??
            favorite
        );
    }

    return (
        favorite?.ticketListing ??
        favorite?.ticketListingBean ??
        favorite?.listing ??
        favorite
    );
}

async function handleAuthExpired(error) {
    // 同一頁面只處理一次 Token 失效。
    if (authExpiredHandled.value) return;

    authExpiredHandled.value = true;

    console.warn(
        "我的收藏頁收到 HTTP 401，清除本機登入狀態。",
        error?.response?.data?.message || "",
    );

    logout();

    await openAppAlert({
        variant: "warning",
        title: "登入狀態已失效",
        text: "登入憑證可能已過期或無效，請重新登入後再繼續操作。",
        confirmText: "前往登入",
        cancelText: "",
    });

    await router.push({
        name: "login",
        query: {
            redirect: route.fullPath,
        },
    });
}

function errorText(error) {
    const status = error?.response?.status;

    if (status === 401) {
        return "登入憑證無效或已過期，請重新登入。";
    }

    if (status === 403) {
        return "目前帳號沒有執行此操作的權限。";
    }

    if (status === 404) {
        return "找不到 API 路徑，請確認後端 Controller 與 Axios 設定。";
    }

    return (
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "發生未知錯誤。"
    );
}

function cinemaId(item) {
    return firstValue(item, ["cinemaId", "cinema_id", "id"]);
}

function movieId(item) {
    return firstValue(item, ["movieId", "movie_id", "id"]);
}

function cinemaName(item) {
    const nested = item?.cinemaBean ?? item?.cinema;

    const directName = firstValue(
        item,
        ["cinemaName", "cinema_name"],
        firstValue(nested, ["cinemaName", "name"], ""),
    );

    if (directName) return directName;

    const id = firstValue(
        item,
        ["cinemaId", "cinema_id"],
        firstValue(nested, ["cinemaId", "cinema_id", "id"], ""),
    );

    const matched = cinemas.value.find(
        (cinema) => String(cinemaId(cinema)) === String(id),
    );

    if (matched) {
        return firstValue(
            matched,
            ["cinemaName", "cinema_name", "name", "title"],
            `影城 #${id}`,
        );
    }

    return id ? `影城編號 ${id}` : "影城資料未提供";
}

function movieName(item) {
    const nested = item?.movieBean ?? item?.movie;

    const directName = firstValue(
        item,
        ["movieName", "movie_name"],
        firstValue(nested, ["movieName", "name"], ""),
    );

    if (directName) return directName;

    const id = firstValue(
        item,
        ["movieId", "movie_id"],
        firstValue(nested, ["movieId", "movie_id", "id"], ""),
    );

    const matched = movies.value.find(
        (movie) => String(movieId(movie)) === String(id),
    );

    if (matched) {
        return firstValue(
            matched,
            ["movieName", "movie_name", "name", "title"],
            `電影 #${id}`,
        );
    }

    return id ? `電影編號 ${id}` : "電影資料未提供";
}

// 是否已完成第一次收藏載入
const hasInitialized = ref(false);

// 是否正在執行收藏 API，避免重複發送請求
const isFetchingFavorites = ref(false);

async function loadFavorites() {
    if (!token.value) {
        errorMessage.value = "請先登入，才能查看自己的收藏。";
        return;
    }

    // 上一輪請求尚未完成時，不重複發送請求。
    if (isFetchingFavorites.value) {
        return;
    }

    isFetchingFavorites.value = true;

    // 只有第一次載入時顯示整頁載入狀態。
    // 後續自動更新不切換畫面。
    if (!hasInitialized.value) {
        loading.value = true;
    }

    errorMessage.value = "";

    const results = await Promise.allSettled([
        getMyExchangeFavorites(token.value),
        getMyTicketFavorites(token.value),
        getCinemas(),
        getMovies(),
    ]);

    // 先統一處理 HTTP 401，避免產生重複錯誤訊息。
    const unauthorizedResult = results.find(
        (result) =>
            result.status === "rejected" &&
            result.reason?.response?.status === 401,
    );

    if (unauthorizedResult) {
        await handleAuthExpired(unauthorizedResult.reason);
        loading.value = false;
        hasInitialized.value = true;
        isFetchingFavorites.value = false;
        return;
    }

    const failures = [];

    if (results[0].status === "fulfilled") {
        exchangeFavorites.value = unwrapList(results[0].value).filter(
            (favorite) =>
                String(favorite?.status ?? "").trim().toUpperCase() === "ACTIVE",
        );
    } else {
        failures.push(`我的特典收藏：${errorText(results[0].reason)}`);
    }

    if (results[1].status === "fulfilled") {
        ticketFavorites.value = unwrapList(results[1].value).filter(
            (favorite) =>
                String(favorite?.status ?? "").trim().toUpperCase() === "ACTIVE",
        );
    } else {
        failures.push(`我的票券收藏：${errorText(results[1].reason)}`);
    }

    if (results[2].status === "fulfilled") {
        cinemas.value = unwrapList(results[2].value);
    } else {
        failures.push(`影城選項：${errorText(results[2].reason)}`);
    }

    if (results[3].status === "fulfilled") {
        movies.value = unwrapList(results[3].value);
    } else {
        failures.push(`電影選項：${errorText(results[3].reason)}`);
    }

    if (failures.length) {
        errorMessage.value = failures.join("\n");
    }

    loading.value = false;
    hasInitialized.value = true;
    isFetchingFavorites.value = false;
}

async function removeFavorite(item, kind) {
    if (!token.value) {
        await openAppAlert({
            variant: "warning",
            title: "請先登入",
            text: "取消收藏需要有效的登入 Token。",
            confirmText: "確定",
            cancelText: "",
        });
        return;
    }

    const listing = favoriteListing(item, kind);
    const id = listingId(listing, kind);

    if (!id) {
        await openAppAlert({
            variant: "error",
            title: "無法取消收藏",
            text: "找不到刊登 ID，請確認收藏 API 的回傳格式。",
            confirmText: "確定",
            cancelText: "",
        });
        return;
    }

    const confirmed = await openAppAlert({
        variant: "confirm",
        title: "確定取消收藏？",
        text: "取消後，這筆刊登會從你的收藏清單移除。",
        confirmText: "取消收藏",
        cancelText: "保留收藏",
    });

    if (!confirmed.isConfirmed) return;

    try {
        if (kind === "exchange") {
            await removeExchangeFavorite(id, token.value);
        } else {
            await removeTicketFavorite(id, token.value);
        }

        await loadFavorites();

        await openAppAlert({
            variant: "success",
            title: "完成",
            text: "已取消收藏。",
            confirmText: "確定",
            cancelText: "",
        });
    } catch (error) {
        if (error?.response?.status === 401) {
            await handleAuthExpired(error);
            return;
        }

        await openAppAlert({
            variant: "error",
            title: "操作失敗",
            text: errorText(error),
            confirmText: "確定",
            cancelText: "",
        });
    }
}

onMounted(async () => {
    refreshAuth();

    // 每 5 秒嘗試重新載入收藏。
    // 未登入、沒有 Token 或目前正在載入時，不發出新的請求。
    favoritesRefreshTimer = window.setInterval(() => {
        if (
            !isLoggedIn.value ||
            !token.value ||
            isFetchingFavorites.value
        ) {
            return;
        }

        loadFavorites();
    }, 5000);

    // 保留原本進入頁面時的初始化流程
    if (isLoggedIn.value && token.value) {
        await loadFavorites();
    } else {
        errorMessage.value = "請先登入，才能查看自己的收藏。";
    }
});

// 離開頁面時停止定時重新載入
onUnmounted(() => {
    if (favoritesRefreshTimer !== null) {
        window.clearInterval(favoritesRefreshTimer);
        favoritesRefreshTimer = null;
    }
});
</script>

<template>
    <section class="my-favorites">
        <PageIntro
            kicker="✦ MY FAVORITES"
            lead="我的"
            mark="收藏"
            description="查看你收藏的特典交換與票券刊登。"
            :icon-left="heartIcon"
            :icon-right="giftIcon"
            :icon-top="ticketIcon"
        />

        <ResultBanner
            v-if="!isLoggedIn"
            :icon="heartIcon"
            title="我的收藏"
            :count="0"
            empty-text="請先登入，再查看自己的收藏。"
        />

        <template v-else>
            <ResultBanner
                v-if="!loading && !errorMessage"
                :icon="activeTab === 'exchange' ? giftIcon : ticketIcon"
                :title="activeTab === 'exchange' ? '我的特典收藏' : '我的票券收藏'"
                :count="activeTab === 'exchange' ? exchangeFavorites.length : ticketFavorites.length"
                unit-text="筆收藏"
                empty-text="目前沒有收藏。"
            >
                <template #action>
                    <AppButton type="button" variant="outline" :icon="refreshIcon" :disabled="loading" @click="loadFavorites">
                        重新載入
                    </AppButton>
                </template>
            </ResultBanner>

            <nav class="favorite-tabs" aria-label="我的收藏分類">
                <button type="button" :class="{ active: activeTab === 'exchange' }" @click="activeTab = 'exchange'">
                    我的特典收藏
                </button>

                <button type="button" :class="{ active: activeTab === 'ticket' }" @click="activeTab = 'ticket'">
                    我的票券收藏
                </button>
            </nav>

            <StatePanel v-if="loading" variant="loading" message="正在載入收藏…" :icon="heartIcon" />
            <StatePanel
                v-else-if="errorMessage"
                variant="error"
                title="目前無法取得收藏"
                :message="errorMessage"
                @retry="loadFavorites"
            />

            <ExchangeFavoriteSection v-else-if="activeTab === 'exchange'" :favorites="exchangeFavorites"
                @remove-favorite="removeFavorite($event, 'exchange')" />

            <TicketFavoriteSection v-else-if="activeTab === 'ticket'" :favorites="ticketFavorites"
                :cinema-name="cinemaName" :movie-name="movieName" @remove-favorite="removeFavorite($event, 'ticket')" />
        </template>
    </section>
</template>

<style scoped>
.my-favorites {
    min-width: 0;
}

.favorite-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.favorite-tabs button {
    min-width: 0;
    max-width: 100%;
    padding: 0.65rem 0.9rem;
    border: 1.5px solid var(--c-border);
    border-radius: 14px;
    background: var(--c-card);
    color: var(--c-ink);
    font: inherit;
    font-weight: 800;
    overflow-wrap: anywhere;
    cursor: pointer;
}

.favorite-tabs button.active {
    border-color: #ff7049;
    background: #fff0e9;
    color: #9a4632;
}

@media (max-width: 650px) {
    .favorite-tabs {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.6rem;
    }
}

</style>
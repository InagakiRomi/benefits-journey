<script setup>
import { ref, computed, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PageIntro from "@/components/layout/PageIntro.vue";
import StatePanel from "@/components/layout/StatePanel.vue";
import DetailCard from "@/components/layout/DetailCard.vue";
import TicketCard from "@/components/ui/TicketCard.vue";
import AppButton from "@/components/ui/Button.vue";
import { openAppAlert } from "@/components/ui/Alert.vue";
import http from "@/plugins/axios";
import accountIcon from "@iconify-icons/mdi/account-circle-outline";
import clipboardListIcon from "@iconify-icons/mdi/clipboard-list-outline";
import heartIcon from "@iconify-icons/mdi/heart-outline";
import giftIcon from "@iconify-icons/mdi/gift-outline";
import messageIcon from "@iconify-icons/mdi/message-text-outline";
import feedbackIcon from "@iconify-icons/mdi/comment-text-outline";
import cancelIcon from "@iconify-icons/mdi/account-cancel-outline";
import checkIcon from "@iconify-icons/mdi/account-check-outline";

const route = useRoute();
const router = useRouter();

const accountMenus = [
  { to: "/account", label: "關於我", icon: accountIcon },
  { to: "/account/listings", label: "我的刊登", icon: clipboardListIcon },
  { to: "/account/favorites", label: "我的收藏", icon: heartIcon },
  { to: "/account/benefits", label: "我的特典", icon: giftIcon },
  { to: "/account/messages", label: "訊息中心", icon: messageIcon },
  { to: "/account/feedback", label: "意見回饋", icon: feedbackIcon },
];

const isHome = computed(() => route.name === "account-home");

function isCurrentMenu(menu) {
  if (menu.to === "/account/messages") {
    return (
      route.path === "/account/messages" ||
      route.path.startsWith("/account/messages/")
    );
  }

  return route.path === menu.to;
}

function goToMenu(menu) {
  if (isCurrentMenu(menu)) return;
  router.push(menu.to);
}

const user = ref(null);
const isLoading = ref(true);
const loadFailed = ref(false);
const loadErrorMessage = ref("請重新登入後再試一次。");
const isDeactivating = ref(false);

const accountLinks = [
  {
    title: "修改個人資料",
    description: "更新暱稱、電子郵件等基本資料",
    stamp: "資料",
    color: "yellow",
    to: "/account/profile",
  },
  {
    title: "我的刊登",
    description: "查看自己的刊登內容",
    stamp: "刊登",
    color: "yellow",
    to: "/account/listings",
  },
  {
    title: "我的收藏",
    description: "查看已收藏的刊登與內容",
    stamp: "收藏",
    color: "yellow",
    to: "/account/favorites",
  },
  {
    title: "我的特典",
    description: "管理自己的特典紀錄",
    stamp: "特典",
    color: "yellow",
    to: "/account/benefits",
  },
  {
    title: "我的訊息",
    description: "前往會員私訊功能",
    stamp: "訊息",
    color: "yellow",
    to: "/account/messages",
  },
  {
    title: "意見回饋",
    description: "提交問題或建議，查看處理進度與管理員回覆",
    stamp: "回饋",
    color: "purple",
    to: "/account/feedback",
  },
];

function statusText(status) {
  if (status === "ACTIVE") return "使用中";
  if (status === "INACTIVE") return "已停用";
  return status || "—";
}

async function loadAccount() {
  isLoading.value = true;
  loadFailed.value = false;

  try {
    const response = await http.get("/users/me");
    user.value = response.data;
  } catch (error) {
    loadFailed.value = true;
    loadErrorMessage.value =
      error.response?.data?.message || "請重新登入後再試一次。";
  } finally {
    isLoading.value = false;
  }
}

watch(
  isHome,
  (home) => {
    if (!home || user.value) return;
    loadAccount();
  },
  { immediate: true },
);

async function deactivateAccount() {
  if (user.value?.status !== "ACTIVE" || isDeactivating.value) return;

  const result = await openAppAlert({
    variant: "warning",
    title: "確定要停用帳號嗎？",
    text: "停用後，你仍然可以登入帳號，也可以重新啟用帳號。",
    confirmText: "確定停用",
    cancelText: "取消",
  });

  if (!result.isConfirmed) return;

  isDeactivating.value = true;

  try {
    const response = await http.patch("/users/me/status", {
      status: "INACTIVE",
    });
    user.value = response.data;

    await openAppAlert({
      variant: "success",
      title: "帳號已停用",
      text: "帳號狀態已更新為停用，你仍然可以登入並重新啟用帳號。",
      confirmText: "確定",
      cancelText: "",
    });
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "停用失敗",
      text: error.response?.data?.message || "無法停用帳號，請稍後再試。",
      confirmText: "確定",
      cancelText: "",
    });
  } finally {
    isDeactivating.value = false;
  }
}

async function reactivateAccount() {
  if (user.value?.status !== "INACTIVE" || isDeactivating.value) return;

  const result = await openAppAlert({
    variant: "confirm",
    title: "重新啟用帳號？",
    text: "確認後，帳號狀態將恢復為使用中。",
    confirmText: "確認啟用",
    cancelText: "取消",
  });

  if (!result.isConfirmed) return;

  isDeactivating.value = true;

  try {
    const response = await http.patch("/users/me/status", { status: "ACTIVE" });
    user.value = response.data;

    await openAppAlert({
      variant: "success",
      title: "帳號已重新啟用",
      text: "你的帳號現在已恢復為使用中。",
      confirmText: "確定",
      cancelText: "",
    });
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "重新啟用失敗",
      text: error.response?.data?.message || "無法重新啟用帳號，請稍後再試。",
      confirmText: "確定",
      cancelText: "",
    });
  } finally {
    isDeactivating.value = false;
  }
}
</script>

<template>
  <div class="account-layout">
    <PageIntro
      v-if="isHome"
      kicker="✦ MEMBER CENTER"
      lead="會員"
      mark="中心"
      description="管理你的會員資料，整理屬於你的特典收藏旅程。"
      :icon-left="giftIcon"
      :icon-right="accountIcon"
      :icon-top="heartIcon"
    />

    <div v-if="isHome">
      <StatePanel
        v-if="isLoading"
        variant="loading"
        message="正在載入會員資料…"
        :icon="accountIcon"
      />
      <StatePanel
        v-else-if="loadFailed || !user"
        variant="error"
        title="目前無法取得會員資料"
        :message="loadErrorMessage"
        @retry="loadAccount"
      />

      <template v-else>
        <DetailCard
          :title="user.name || user.account || '會員'"
          :title-icon="accountIcon"
        >
          <template #actions>
            <AppButton
              v-if="user.status === 'ACTIVE'"
              type="button"
              variant="outline"
              :icon="cancelIcon"
              :disabled="isDeactivating"
              @click="deactivateAccount"
            >
              {{ isDeactivating ? "處理中…" : "停用我的帳號" }}
            </AppButton>
            <AppButton
              v-else-if="user.status === 'INACTIVE'"
              type="button"
              :icon="checkIcon"
              :disabled="isDeactivating"
              @click="reactivateAccount"
            >
              {{ isDeactivating ? "處理中…" : "重新啟用帳號" }}
            </AppButton>
          </template>

          <section class="detail-section">
            <h3>會員資料</h3>
            <dl>
              <div>
                <dt>會員編號</dt>
                <dd>{{ user.usersId }}</dd>
              </div>
              <div>
                <dt>登入帳號</dt>
                <dd>{{ user.account || "尚未設定" }}</dd>
              </div>
              <div>
                <dt>電子郵件</dt>
                <dd>{{ user.email || "尚未設定" }}</dd>
              </div>
              <div>
                <dt>角色</dt>
                <dd>{{ user.role === "ADMIN" ? "管理員" : "一般會員" }}</dd>
              </div>
              <div>
                <dt>帳號狀態</dt>
                <dd>{{ statusText(user.status) }}</dd>
              </div>
            </dl>
          </section>
        </DetailCard>

        <div class="ticket-grid">
          <TicketCard
            v-for="(item, index) in accountLinks"
            :key="item.to"
            :color="item.color"
            :appear="index < 6"
            :stamp="item.stamp"
            :title="item.title"
            :detail="item.description"
          >
            <template #action>
              <RouterLink class="ticket-link" :to="item.to">前往</RouterLink>
            </template>
          </TicketCard>
        </div>
      </template>
    </div>

    <div v-else class="account-content">
      <aside class="account-sidebar">
        <h2 class="sidebar-title">會員功能</h2>
        <nav aria-label="會員中心選單" class="sidebar-menu">
          <button
            v-for="menu in accountMenus"
            :key="menu.to"
            type="button"
            class="sidebar-item"
            :class="{ active: isCurrentMenu(menu) }"
            :disabled="isCurrentMenu(menu)"
            :aria-current="isCurrentMenu(menu) ? 'page' : undefined"
            @click="goToMenu(menu)"
          >
            <span class="sidebar-icon">
              <Icon :icon="menu.icon" />
            </span>
            <span>{{ menu.label }}</span>
          </button>
        </nav>
      </aside>

      <div class="account-panel">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-layout {
  width: 100%;
}

.account-content {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.account-sidebar,
.account-panel {
  min-width: 0;
}

.account-sidebar {
  padding: 1.15rem;
  border: 1.5px solid var(--c-border);
  border-radius: 22px;
  background: var(--c-card);
  box-shadow: var(--shadow-soft);
}

.sidebar-title {
  margin: 0 0 0.85rem;
  font-size: var(--text-card-title);
  font-weight: 900;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.7rem 0.75rem;
  border: 1.5px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: var(--c-ink);
  font: inherit;
  font-size: var(--text-control);
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.sidebar-item:hover:not(:disabled) {
  background: #fff4dc;
}

.sidebar-item.active,
.sidebar-item:disabled {
  border-color: #ffda8a;
  background: #fff0c2;
  color: #805b16;
  cursor: default;
}

.sidebar-icon {
  display: inline-flex;
  font-size: 1.25rem;
}

.ticket-grid {
  margin-top: 0.25rem;
}

@media (min-width: 768px) {
  .ticket-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .ticket-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .account-content {
    grid-template-columns: 1fr;
  }

  .sidebar-menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import accountGroupIcon from "@iconify-icons/mdi/account-group-outline";
import magnifyIcon from "@iconify-icons/mdi/magnify";
import filterIcon from "@iconify-icons/mdi/filter-variant";
import shieldIcon from "@iconify-icons/mdi/shield-account-outline";
import refreshIcon from "@iconify-icons/mdi/refresh";

import PageIntro from "@/components/layout/PageIntro.vue";
import ResultBanner from "@/components/layout/ResultBanner.vue";
import SearchFilter from "@/components/layout/SearchFilter.vue";
import StatePanel from "@/components/layout/StatePanel.vue";
import DataTable from "@/components/ui/DataTable.vue";
import AppButton from "@/components/ui/Button.vue";
import { openAppAlert } from "@/components/ui/Alert.vue";
import http from "@/plugins/axios";

const users = ref([]);
const loadingUsers = ref(false);
const userError = ref("");
const updatingUserId = ref(null);

const filters = ref({
  keyword: "",
  status: "",
});

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "正常" },
  { value: "INACTIVE", label: "停用" },
  { value: "BANNED", label: "封鎖" },
  { value: "DELETED", label: "已刪除" },
];

const appliedFilters = computed({
  get: () => filters.value,
  set: (next) => {
    const status = next?.status ?? "";
    const keyword = next?.keyword ?? "";
    const statusChanged = status !== filters.value.status;
    filters.value = { keyword, status };
    if (statusChanged) loadUsers();
  },
});

const filterFields = [
  {
    key: "keyword",
    label: "帳號或電子郵件",
    type: "search",
    placeholder: "搜尋帳號或電子郵件",
    icon: magnifyIcon,
  },
  {
    key: "status",
    label: "會員狀態",
    type: "select",
    emptyLabel: "全部會員（不含已刪除）",
    icon: filterIcon,
    options: STATUS_OPTIONS,
  },
];

const columns = [
  { key: "usersId", label: "編號", minWidth: "6rem", nowrap: true, align: "center" },
  { key: "account", label: "帳號", minWidth: "9rem", format: (value) => value || "—" },
  { key: "name", label: "暱稱", minWidth: "8rem", format: (value) => value || "—" },
  { key: "email", label: "電子郵件", minWidth: "14rem", format: (value) => value || "—" },
  {
    key: "role",
    label: "角色",
    minWidth: "7rem",
    nowrap: true,
    align: "center",
    format: roleLabel,
  },
  {
    key: "status",
    label: "狀態",
    minWidth: "6.5rem",
    nowrap: true,
    align: "center",
    format: statusLabel,
  },
  {
    key: "createdAt",
    label: "註冊時間",
    minWidth: "12rem",
    nowrap: true,
    align: "center",
    format: formatDate,
  },
  { key: "actions", label: "操作", minWidth: "8rem", align: "center" },
];

const filteredUsers = computed(() => {
  const keyword = filters.value.keyword.trim().toLowerCase();
  if (!keyword) return users.value;

  return users.value.filter((user) =>
    (user.account || "").toLowerCase().includes(keyword) ||
    (user.email || "").toLowerCase().includes(keyword),
  );
});

const hasFilters = computed(
  () => Boolean(filters.value.keyword.trim()) || Boolean(filters.value.status),
);

function readError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  return fallback;
}

async function loadUsers() {
  loadingUsers.value = true;
  userError.value = "";

  try {
    const params = filters.value.status ? { status: filters.value.status } : {};
    const { data } = await http.get("/admin/users", { params });
    users.value = Array.isArray(data) ? data : [];
  } catch (error) {
    userError.value = readError(error, "讀取會員列表失敗");
  } finally {
    loadingUsers.value = false;
  }
}

function roleLabel(role) {
  if (role === "ADMIN") return "管理員";
  if (role === "USER" || role === "MEMBER") return "一般會員";
  return role || "—";
}

function statusLabel(status) {
  const labels = {
    ACTIVE: "正常",
    INACTIVE: "停用",
    BANNED: "封鎖",
    DELETED: "已刪除",
  };
  return labels[status] || status || "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", { hour12: false });
}

function nextAction(user) {
  if (user.status === "ACTIVE") return { status: "BANNED", label: "封鎖" };
  if (user.status === "BANNED") return { status: "ACTIVE", label: "解除封鎖" };
  if (user.status === "INACTIVE") return { status: "ACTIVE", label: "重新啟用" };
  return null;
}

async function updateUserStatus(user) {
  const action = nextAction(user);
  if (!action || updatingUserId.value === user.usersId) return;

  const result = await openAppAlert({
    variant: "warning",
    title: `確定要${action.label}這位會員嗎？`,
    text: `會員帳號：${user.account || "—"}`,
    confirmText: action.label,
    cancelText: "取消",
  });
  if (!result.isConfirmed) return;

  updatingUserId.value = user.usersId;

  try {
    await http.patch(`/admin/users/${user.usersId}/status`, { status: action.status });
    await loadUsers();
    await openAppAlert({
      variant: "success",
      title: `已${action.label}會員`,
      confirmText: "關閉",
      cancelText: "",
    });
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "無法更新會員狀態",
      text: readError(error, "更新會員狀態失敗"),
      confirmText: "關閉",
      cancelText: "",
    });
  } finally {
    updatingUserId.value = null;
  }
}

onMounted(loadUsers);
</script>

<template>
  <section>
    <PageIntro
      kicker="✦ MEMBER MANAGEMENT"
      lead="會員"
      mark="管理"
      description="管理會員資料、搜尋帳號與電子郵件，並調整會員狀態。"
      :icon-left="accountGroupIcon"
      :icon-right="filterIcon"
      :icon-top="shieldIcon"
      theme="purple"
    />

    <ResultBanner
      v-if="!(loadingUsers && !users.length) && !userError"
      :icon="accountGroupIcon"
      title="會員列表"
      :count="filteredUsers.length"
      :unit-text="hasFilters ? '位符合條件的會員' : '位會員'"
      empty-text="目前沒有符合條件的會員。"
      theme="purple"
    >
      <template #action>
        <AppButton type="button" color="purple" :icon="refreshIcon" :disabled="loadingUsers" @click="loadUsers">
          重新整理
        </AppButton>
      </template>
    </ResultBanner>

    <SearchFilter
      v-if="!(loadingUsers && !users.length) && !userError"
      v-model="appliedFilters"
      title="篩選會員"
      :title-icon="filterIcon"
      submit-label="查詢會員"
      :fields="filterFields"
      theme="purple"
    >
      <DataTable
        caption="會員資料表"
        :columns="columns"
        :rows="filteredUsers"
        row-key="usersId"
        empty-text="目前沒有符合條件的會員。"
        :loading="loadingUsers"
        theme="purple"
      >
        <template #cell-actions="{ row }">
          <div class="user-actions">
            <AppButton
              v-if="nextAction(row)"
              type="button"
              color="purple"
              variant="outline"
              :disabled="updatingUserId === row.usersId"
              @click="updateUserStatus(row)"
            >
              {{ updatingUserId === row.usersId ? "處理中…" : nextAction(row).label }}
            </AppButton>
            <span v-else>無可用操作</span>
          </div>
        </template>
      </DataTable>
    </SearchFilter>

    <StatePanel
      v-if="loadingUsers && !users.length"
      variant="loading"
      message="正在載入會員資料…"
      :icon="accountGroupIcon"
      color="purple"
    />
    <StatePanel
      v-else-if="userError"
      variant="error"
      title="目前無法取得會員資料"
      :message="userError"
      color="purple"
      @retry="loadUsers"
    />
  </section>
</template>

<style scoped>
.user-actions {
  display: flex;
  justify-content: center;
}

.user-actions :deep(.app-button) {
  min-height: 2.25rem;
  padding: 0.3rem 0.8rem;
  box-shadow: none;
}
</style>

<script setup>
import { computed, ref, onMounted } from "vue";
import PageIntro from "@/components/layout/PageIntro.vue";
import ResultBanner from "@/components/layout/ResultBanner.vue";
import SearchFilter from "@/components/layout/SearchFilter.vue";
import StatePanel from "@/components/layout/StatePanel.vue";
import DataTable from "@/components/ui/DataTable.vue";
import Pagination from "@/components/ui/Pagination.vue";
import AppButton from "@/components/ui/Button.vue";
import http from "@/plugins/axios";
import historyIcon from "@iconify-icons/mdi/history";
import refreshIcon from "@iconify-icons/mdi/refresh";
import accountIcon from "@iconify-icons/mdi/account-outline";
import devicesIcon from "@iconify-icons/mdi/devices";
import ipIcon from "@iconify-icons/mdi/ip-network-outline";
import filterIcon from "@iconify-icons/mdi/filter-variant";
import clockOutlineIcon from "@iconify-icons/mdi/clock-outline";

const loginLogs = ref([]);
const loadingLogs = ref(false);
const logError = ref("");
const page = ref(1);
const logTotalPages = ref(0);
const logTotalElements = ref(0);
const listTop = ref(null);

const filters = ref({
  memberKeyword: "",
  deviceKeyword: "",
  ipKeyword: "",
});

const appliedFilters = computed({
  get: () => filters.value,
  set: (next) => {
    filters.value = {
      memberKeyword: next?.memberKeyword ?? "",
      deviceKeyword: next?.deviceKeyword ?? "",
      ipKeyword: next?.ipKeyword ?? "",
    };
    page.value = 1;
    loadLoginLogs();
  },
});

const filterFields = [
  {
    key: "memberKeyword",
    label: "會員",
    type: "search",
    placeholder: "會員編號、帳號或姓名",
    icon: accountIcon,
  },
  {
    key: "deviceKeyword",
    label: "設備",
    type: "search",
    placeholder: "瀏覽器或作業系統",
    icon: devicesIcon,
  },
  {
    key: "ipKeyword",
    label: "IP 位址",
    type: "search",
    placeholder: "完整或部分 IP",
    icon: ipIcon,
  },
];

const columns = [
  {
    key: "loginLogId",
    label: "紀錄編號",
    minWidth: "7rem",
    nowrap: true,
    align: "center",
    format: (value) => value ?? "—",
  },
  {
    key: "usersId",
    label: "會員編號",
    minWidth: "7rem",
    nowrap: true,
    align: "center",
    format: (value) => value ?? "—",
  },
  {
    key: "userName",
    label: "會員姓名",
    minWidth: "8rem",
    format: (value) => value || "—",
  },
  {
    key: "loginTime",
    label: "登入時間",
    minWidth: "12rem",
    nowrap: true,
    align: "center",
    format: formatDate,
  },
  {
    key: "loginStatus",
    label: "登入結果",
    minWidth: "7rem",
    nowrap: true,
    align: "center",
    format: loginStatusLabel,
  },
  {
    key: "ipAddress",
    label: "IP 位址",
    minWidth: "10rem",
    nowrap: true,
    format: (value) => value || "—",
  },
  {
    key: "userAgent",
    label: "瀏覽器資訊",
    minWidth: "14rem",
    format: formatDevice,
  },
];

const hasFilters = computed(() =>
  Boolean(
    filters.value.memberKeyword.trim() ||
    filters.value.deviceKeyword.trim() ||
    filters.value.ipKeyword.trim(),
  ),
);

function readError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  return fallback;
}

async function loadLoginLogs() {
  loadingLogs.value = true;
  logError.value = "";

  try {
    const params = { page: page.value - 1 };
    const memberKeyword = filters.value.memberKeyword.trim();
    const deviceKeyword = filters.value.deviceKeyword.trim();
    const ipKeyword = filters.value.ipKeyword.trim();

    if (memberKeyword) params.memberKeyword = memberKeyword;
    if (deviceKeyword) params.deviceKeyword = deviceKeyword;
    if (ipKeyword) params.ipKeyword = ipKeyword;

    const endpoint = hasFilters.value ? "/admin/login-logs/search" : "/admin/login-logs";
    const { data: result } = await http.get(endpoint, { params });

    loginLogs.value = result.content || [];
    logTotalPages.value = result.totalPages ?? 0;
    logTotalElements.value = result.totalElements ?? 0;
  } catch (error) {
    logError.value = readError(error, "讀取登入日誌失敗");
  } finally {
    loadingLogs.value = false;
  }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", { hour12: false });
}

function formatDevice(userAgent) {
  if (!userAgent) return "未知設備";

  let os = "未知系統";
  if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = "macOS";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  let browser = "未知瀏覽器";
  let version = "";
  const browserPatterns = [
    { name: "Edge", regex: /Edg(?:e|A|iOS)?\/([\d.]+)/ },
    { name: "Opera", regex: /OPR\/([\d.]+)/ },
    { name: "Samsung Internet", regex: /SamsungBrowser\/([\d.]+)/ },
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
    { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari\// },
  ];

  for (const item of browserPatterns) {
    const match = userAgent.match(item.regex);
    if (match) {
      browser = item.name;
      version = match[1];
      break;
    }
  }

  const majorVersion = version ? ` ${version.split(".")[0]}` : "";
  return `${os} · ${browser}${majorVersion}`;
}

function loginStatusLabel(status) {
  const value = String(status ?? "").toUpperCase();
  if (["SUCCESS", "SUCCEEDED", "成功", "TRUE"].includes(value)) return "成功";
  if (["FAIL", "FAILED", "失敗", "FALSE"].includes(value)) return "失敗";
  return status || "未知";
}

function goToPage(next) {
  if (!Number.isInteger(next) || next < 1 || next > logTotalPages.value || next === page.value) return;
  page.value = next;
  loadLoginLogs();
  listTop.value?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

onMounted(loadLoginLogs);
</script>

<template>
  <section>
    <PageIntro
      kicker="✦ LOGIN ACTIVITY"
      lead="登入"
      mark="日誌"
      description="查看會員登入時間、登入結果與連線資訊。"
      :icon-left="historyIcon"
      :icon-right="accountIcon"
      :icon-top="clockOutlineIcon"
      theme="purple"
    />

    <ResultBanner
      v-if="!(loadingLogs && !loginLogs.length) && !logError"
      :icon="historyIcon"
      title="會員登入紀錄"
      :count="logTotalElements"
      :unit-text="hasFilters ? '筆符合條件的紀錄' : '筆紀錄'"
      empty-text="目前沒有符合條件的登入紀錄。"
      theme="purple"
    >
      <template #action>
        <AppButton type="button" color="purple" :icon="refreshIcon" :disabled="loadingLogs" @click="loadLoginLogs">
          重新整理
        </AppButton>
      </template>
    </ResultBanner>

    <SearchFilter
      v-if="!(loadingLogs && !loginLogs.length) && !logError"
      v-model="appliedFilters"
      title="篩選紀錄"
      :title-icon="filterIcon"
      submit-label="查詢紀錄"
      :fields="filterFields"
      theme="purple"
    >
      <div ref="listTop" class="log-sheet">
        <DataTable
          caption="登入日誌資料表"
          :columns="columns"
          :rows="loginLogs"
          row-key="loginLogId"
          empty-text="目前沒有符合條件的登入紀錄。"
          :loading="loadingLogs"
          theme="purple"
        />
      </div>

      <Pagination
        v-if="logTotalPages > 1"
        :page="page"
        :total-pages="logTotalPages"
        label="登入日誌分頁"
        color="purple"
        @update:page="goToPage"
      />
    </SearchFilter>

    <StatePanel
      v-if="loadingLogs && !loginLogs.length"
      variant="loading"
      message="正在載入登入紀錄…"
      :icon="historyIcon"
      color="purple"
    />
    <StatePanel
      v-else-if="logError"
      variant="error"
      title="目前無法取得登入日誌"
      :message="logError"
      color="purple"
      @retry="loadLoginLogs"
    />
  </section>
</template>

<style scoped>
.log-sheet {
  scroll-margin-top: 5.5rem;
}
</style>

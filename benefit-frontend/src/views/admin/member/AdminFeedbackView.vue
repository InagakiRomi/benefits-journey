<script setup>
import { computed, ref, onMounted } from "vue";
import http from "@/plugins/axios";
import PageIntro from "@/components/layout/PageIntro.vue";
import ResultBanner from "@/components/layout/ResultBanner.vue";
import SearchFilter from "@/components/layout/SearchFilter.vue";
import StatePanel from "@/components/layout/StatePanel.vue";
import DetailCard from "@/components/layout/DetailCard.vue";
import DataTable from "@/components/ui/DataTable.vue";
import Pagination from "@/components/ui/Pagination.vue";
import AppButton from "@/components/ui/Button.vue";
import AppForm from "@/components/ui/Form.vue";
import { openAppAlert } from "@/components/ui/Alert.vue";

import messageIcon from "@iconify-icons/mdi/message-text-outline";
import clipboardIcon from "@iconify-icons/mdi/clipboard-check-outline";
import shieldIcon from "@iconify-icons/mdi/shield-check-outline";
import filterIcon from "@iconify-icons/mdi/filter-variant";
import refreshIcon from "@iconify-icons/mdi/refresh";
import eyeIcon from "@iconify-icons/mdi/eye-outline";
import closeIcon from "@iconify-icons/mdi/close";

const categories = {
  FEATURE_SUGGESTION: "功能建議",
  BUG_REPORT: "問題回報",
  QUESTION: "使用問題",
  OTHER: "其他",
};

const statuses = {
  PENDING: "待處理",
  PROCESSING: "處理中",
  COMPLETED: "已完成",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "待處理" },
  { value: "PROCESSING", label: "處理中" },
  { value: "COMPLETED", label: "已完成" },
];

const filters = ref({ status: "" });
const feedbackList = ref([]);
const selectedFeedback = ref(null);
const replyForm = ref({ status: "PENDING", adminReply: "" });

const page = ref(1);
const totalPages = ref(0);
const totalElements = ref(0);
const loading = ref(false);
const detailLoading = ref(false);
const saving = ref(false);
const loadError = ref("");
const listTop = ref(null);

const appliedFilters = computed({
  get: () => filters.value,
  set: (next) => {
    filters.value = { status: next?.status ?? "" };
    page.value = 1;
    selectedFeedback.value = null;
    loadFeedback();
  },
});

const filterFields = [
  {
    key: "status",
    label: "處理狀態",
    type: "select",
    emptyLabel: "全部狀態",
    icon: filterIcon,
    options: STATUS_OPTIONS,
  },
];

const columns = [
  { key: "title", label: "回饋內容", minWidth: "16rem" },
  {
    key: "memberName",
    label: "會員",
    minWidth: "8rem",
    format: (_value, row) => getMemberName(row),
  },
  {
    key: "status",
    label: "狀態",
    minWidth: "7rem",
    nowrap: true,
    align: "center",
    format: statusLabel,
  },
  {
    key: "createdAt",
    label: "送出時間",
    minWidth: "12rem",
    nowrap: true,
    align: "center",
    format: formatDate,
  },
  { key: "actions", label: "操作", minWidth: "8rem", align: "center" },
];

const hasFilters = computed(() => Boolean(filters.value.status));

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", { hour12: false });
}

function categoryLabel(value) {
  return categories[value] || value || "—";
}

function statusLabel(value) {
  return statuses[value] || value || "未知";
}

function getMemberName(item) {
  return item?.memberName || item?.account || `會員 #${item?.userId ?? "—"}`;
}

function readError(error, fallback) {
  return error.response?.data?.message || fallback;
}

async function loadFeedback() {
  loading.value = true;
  loadError.value = "";

  try {
    const params = { page: page.value - 1, size: 10 };
    if (filters.value.status) params.status = filters.value.status;

    const response = await http.get("/admin/feedback", { params });
    const data = response.data;

    feedbackList.value = Array.isArray(data) ? data : (data?.content || []);
    totalPages.value = data?.totalPages ?? (feedbackList.value.length ? 1 : 0);
    totalElements.value = data?.totalElements ?? feedbackList.value.length;

    if (
      selectedFeedback.value &&
      !feedbackList.value.some((item) => item.feedbackId === selectedFeedback.value.feedbackId)
    ) {
      selectedFeedback.value = null;
    }
  } catch (error) {
    loadError.value = readError(error, "無法載入回饋清單，請確認管理員登入狀態後重試。");
  } finally {
    loading.value = false;
  }
}

function goToPage(next) {
  if (!Number.isInteger(next) || next < 1 || next > totalPages.value || next === page.value) return;
  page.value = next;
  selectedFeedback.value = null;
  loadFeedback();
  listTop.value?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

async function openFeedback(item) {
  selectedFeedback.value = null;
  detailLoading.value = true;

  try {
    const response = await http.get(`/admin/feedback/${item.feedbackId}`);
    selectedFeedback.value = response.data;
    replyForm.value = {
      status: response.data.status || "PENDING",
      adminReply: response.data.adminReply || "",
    };
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "無法載入回饋",
      text: readError(error, "無法載入這則回饋的詳細資料。"),
      confirmText: "關閉",
      cancelText: "",
    });
  } finally {
    detailLoading.value = false;
  }
}

async function saveFeedback() {
  if (!selectedFeedback.value || saving.value) return;

  saving.value = true;

  try {
    const payload = {
      status: replyForm.value.status,
      adminReply: replyForm.value.adminReply.trim() || null,
    };

    const response = await http.put(
      `/admin/feedback/${selectedFeedback.value.feedbackId}`,
      payload,
    );

    selectedFeedback.value = response.data;
    replyForm.value = {
      status: response.data.status || payload.status,
      adminReply: response.data.adminReply || "",
    };

    await loadFeedback();
    selectedFeedback.value = response.data;

    await openAppAlert({
      variant: "success",
      title: "回饋處理結果已更新",
      confirmText: "關閉",
      cancelText: "",
    });
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "更新失敗",
      text: readError(error, "更新失敗，請稍後再試。"),
      confirmText: "關閉",
      cancelText: "",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(loadFeedback);
</script>

<template>
  <section>
    <PageIntro
      kicker="✦ FEEDBACK MANAGEMENT"
      lead="會員回饋"
      mark="管理"
      description="集中查看會員的建議與問題回報，更新處理狀態，並留下清楚的處理回覆。"
      :icon-left="messageIcon"
      :icon-right="clipboardIcon"
      :icon-top="shieldIcon"
      theme="purple"
    />

    <ResultBanner
      v-if="!(loading && !feedbackList.length) && !loadError"
      :icon="messageIcon"
      title="會員回饋"
      :count="totalElements"
      :unit-text="hasFilters ? '筆符合條件的回饋' : '筆回饋'"
      empty-text="目前沒有符合條件的回饋。"
      theme="purple"
    >
      <template #action>
        <AppButton type="button" color="purple" :icon="refreshIcon" :disabled="loading" @click="loadFeedback">
          重新整理
        </AppButton>
      </template>
    </ResultBanner>

    <SearchFilter
      v-if="!(loading && !feedbackList.length) && !loadError"
      v-model="appliedFilters"
      title="篩選回饋"
      :title-icon="filterIcon"
      submit-label="查詢回饋"
      :fields="filterFields"
      theme="purple"
    >
      <div ref="listTop" class="feedback-sheet">
        <DataTable
          caption="會員回饋資料表"
          :columns="columns"
          :rows="feedbackList"
          row-key="feedbackId"
          empty-text="目前沒有符合條件的回饋。"
          :loading="loading"
          theme="purple"
        >
          <template #cell-title="{ row }">
            <div class="feedback-title">
              <strong>{{ row.title }}</strong>
              <span>{{ categoryLabel(row.category) }}</span>
            </div>
          </template>
          <template #cell-actions="{ row }">
            <div class="feedback-actions">
              <AppButton
                type="button"
                color="purple"
                variant="outline"
                :icon="eyeIcon"
                :disabled="detailLoading"
                @click="openFeedback(row)"
              >
                查看
              </AppButton>
            </div>
          </template>
        </DataTable>
      </div>

      <Pagination
        v-if="totalPages > 1"
        :page="page"
        :total-pages="totalPages"
        label="回饋清單分頁"
        color="purple"
        @update:page="goToPage"
      />
    </SearchFilter>

    <StatePanel
      v-if="loading && !feedbackList.length"
      variant="loading"
      message="正在載入回饋清單…"
      :icon="messageIcon"
      color="purple"
    />
    <StatePanel
      v-else-if="loadError"
      variant="error"
      title="目前無法取得回饋"
      :message="loadError"
      color="purple"
      @retry="loadFeedback"
    />

    <StatePanel
      v-if="detailLoading"
      variant="loading"
      message="正在載入回饋詳細資料…"
      :icon="clipboardIcon"
      color="purple"
    />

    <DetailCard
      v-if="selectedFeedback"
      :title="selectedFeedback.title"
      :title-icon="messageIcon"
      theme="purple"
    >
      <template #actions>
        <AppButton type="button" color="purple" variant="outline" :icon="closeIcon" @click="selectedFeedback = null">
          收合
        </AppButton>
      </template>

      <section class="detail-section">
        <h3>回饋內容</h3>
        <dl>
          <div>
            <dt>會員</dt>
            <dd>{{ getMemberName(selectedFeedback) }}</dd>
          </div>
          <div>
            <dt>類型</dt>
            <dd>{{ categoryLabel(selectedFeedback.category) }}</dd>
          </div>
          <div>
            <dt>送出時間</dt>
            <dd>{{ formatDate(selectedFeedback.createdAt) }}</dd>
          </div>
        </dl>
        <p class="feedback-content">{{ selectedFeedback.content }}</p>
      </section>

      <AppForm
        plain
        theme="purple"
        :submitting="saving"
        submit-label="儲存處理結果"
        submitting-label="儲存中…"
        @submit="saveFeedback"
      >
        <div class="form-field is-wide">
          <label class="field-label" for="feedback-admin-status">
            處理狀態 <span class="field-required">*</span>
          </label>
          <select id="feedback-admin-status" v-model="replyForm.status" class="form-select" required>
            <option v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-field is-wide">
          <label class="field-label" for="feedback-admin-reply">管理員回覆</label>
          <textarea
            id="feedback-admin-reply"
            v-model="replyForm.adminReply"
            class="form-control"
            rows="5"
            maxlength="2000"
            placeholder="可填寫處理結果或回覆；若不需要回覆，可以留空。"
          />
          <p class="field-hint">{{ replyForm.adminReply.length }}/2000 字，回覆可留空。</p>
        </div>
      </AppForm>
    </DetailCard>
  </section>
</template>

<style scoped>
.feedback-sheet {
  scroll-margin-top: 5.5rem;
}

.feedback-title {
  display: grid;
  gap: 0.2rem;
}

.feedback-title span {
  color: var(--c-muted);
  font-size: var(--text-min);
  font-weight: 700;
}

.feedback-actions {
  display: flex;
  justify-content: center;
}

.feedback-actions :deep(.app-button) {
  min-height: 2.25rem;
  padding: 0.3rem 0.8rem;
  box-shadow: none;
}

.feedback-content {
  margin: 1rem 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: var(--text-body);
  line-height: var(--leading-body);
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import http from "@/plugins/axios";
import { openAppAlert } from "@/components/ui/Alert.vue";
import PageIntro from "@/components/layout/PageIntro.vue";
import AppForm from "@/components/ui/Form.vue";
import accountIcon from "@iconify-icons/mdi/account-edit-outline";
import cardIcon from "@iconify-icons/mdi/card-account-details-outline";
import emailIcon from "@iconify-icons/mdi/email-outline";

const form = ref({
  name: "",
  email: "",
  birthDate: "",
});

const loading = ref(true);
const saving = ref(false);
const loadFailed = ref(false);
const loadErrorMessage = ref("請確認連線後再試一次。");

async function loadProfile() {
  loading.value = true;
  loadFailed.value = false;

  try {
    const response = await http.get("/users/me");
    const data = response.data;

    form.value = {
      name: data.name ?? "",
      email: data.email ?? "",
      birthDate: data.birthDate ?? "",
    };
  } catch (error) {
    loadFailed.value = true;
    loadErrorMessage.value = error.response?.data?.message || "無法載入會員資料，請稍後再試。";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (saving.value) return;

  if (!form.value.name.trim()) {
    await openAppAlert({
      variant: "warning",
      title: "請輸入姓名或暱稱",
      confirmText: "確定",
      cancelText: "",
    });
    return;
  }

  if (!form.value.email.trim()) {
    await openAppAlert({
      variant: "warning",
      title: "請輸入電子郵件",
      confirmText: "確定",
      cancelText: "",
    });
    return;
  }

  saving.value = true;

  try {
    await http.put("/users/me", {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      birthDate: form.value.birthDate || null,
    });

    await openAppAlert({
      variant: "success",
      title: "個人資料已更新",
      text: "你的會員資料已成功儲存。",
      confirmText: "確定",
      cancelText: "",
    });
  } catch (error) {
    await openAppAlert({
      variant: "error",
      title: "儲存失敗",
      text: error.response?.data?.message || "儲存個人資料時發生錯誤，請稍後再試。",
      confirmText: "確定",
      cancelText: "",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(loadProfile);
</script>

<template>
  <section>
    <PageIntro
      kicker="✦ PROFILE"
      lead="修改"
      mark="個人資料"
      description="管理你的會員基本資料。"
      :icon-left="accountIcon"
      :icon-right="emailIcon"
      :icon-top="cardIcon"
    />

    <AppForm
      title="會員資料"
      :title-icon="accountIcon"
      :loading="loading"
      loading-message="正在載入會員資料…"
      :loading-icon="accountIcon"
      :load-failed="loadFailed"
      load-error-title="目前無法取得會員資料"
      :load-error-message="loadErrorMessage"
      :submitting="saving"
      submit-label="儲存修改"
      submitting-label="儲存中…"
      @submit="saveProfile"
      @retry="loadProfile"
    >
      <div class="form-field">
        <label class="field-label" for="name">
          姓名／暱稱 <span class="field-required">*</span>
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          maxlength="100"
          required
          placeholder="請輸入姓名或暱稱"
        />
      </div>

      <div class="form-field">
        <label class="field-label" for="email">
          電子郵件 <span class="field-required">*</span>
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control"
          maxlength="255"
          required
          placeholder="請輸入電子郵件"
        />
      </div>

      <div class="form-field is-wide">
        <label class="field-label" for="birthDate">生日</label>
        <input id="birthDate" v-model="form.birthDate" type="date" class="form-control" />
        <p class="field-hint">生日可以不填。</p>
      </div>
    </AppForm>
  </section>
</template>

<script setup>
/**
 * 共用彈出視窗。
 * 用 v-model 控制開關：<AppModal v-model="open" title="標題">內容</AppModal>
 * 外框使用 TicketCard。內容自己已是 TicketCard 時設 bare，只保留遮罩與關閉行為。
 * 按右上角 ✕、按背景、按 Esc 都會關閉（送出中時不能關）。
 */
import { onBeforeUnmount, watch } from "vue";
import { Icon } from "@iconify/vue";
import closeIcon from "@iconify-icons/mdi/close";
import TicketCard from "@/components/ui/TicketCard.vue";

const open = defineModel({ type: Boolean, default: false });

const props = defineProps({
  title: { type: String, default: "" },
  // 送出中時不能關閉，避免資料送到一半視窗就不見
  busy: { type: Boolean, default: false },
  width: { type: String, default: "36rem" },
  color: { type: String, default: "yellow" },

  // false＝點背景不會關閉（例如要填很多資料的視窗，避免誤關）
  closeOnBackdrop: { type: Boolean, default: true },

  // 內容已包在 TicketCard 裡時，不再多包一層票券
  bare: { type: Boolean, default: false },
});

function close() {
  if (!props.busy) open.value = false;
}

function onBackdrop() {
  if (props.closeOnBackdrop) close();
}

function onKeydown(event) {
  if (event.key === "Escape") close();
}

// 打開時鎖住背景捲動、監聽 Esc；關閉時還原
watch(open, (value) => {
  if (value) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeydown);
  } else {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="onBackdrop">
      <div
        v-if="bare"
        class="modal-dialog-box"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :style="{ width }"
      >
        <div class="modal-head">
          <h2>{{ title }}</h2>
          <button type="button" class="modal-close" aria-label="關閉" :disabled="busy" @click="close">
            <Icon :icon="closeIcon" aria-hidden="true" />
          </button>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="modal-foot">
          <slot name="footer" />
        </div>
      </div>

      <div
        v-else
        class="modal-dialog-box is-ticket"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :style="{ width }"
      >
        <TicketCard appear class="modal-ticket" :color="color" :title="title">
          <template #title>
            <div class="modal-head">
              <span class="modal-title">{{ title }}</span>
              <button type="button" class="modal-close" aria-label="關閉" :disabled="busy" @click="close">
                <Icon :icon="closeIcon" aria-hidden="true" />
              </button>
            </div>
          </template>

          <div class="modal-body">
            <slot />
          </div>

          <template v-if="$slots.footer" #action>
            <div class="modal-foot">
              <slot name="footer" />
            </div>
          </template>
        </TicketCard>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: safe center;
  padding: 1.25rem;
  overflow: auto;
  background: color-mix(in srgb, #292b35 46%, transparent);
  backdrop-filter: blur(3px);
}

.modal-dialog-box {
  max-width: 100%;
  border: 1.5px solid var(--c-border);
  border-radius: 22px;
  background: var(--c-card);
  box-shadow: 0 18px 40px rgb(41 43 53 / 18%);
}

.modal-dialog-box.is-ticket {
  border: 0;
  background: transparent;
  box-shadow: none;
}

.modal-dialog-box.is-ticket :deep(.ticket-frame),
.modal-dialog-box.is-ticket :deep(.ticket-frame:hover) {
  filter: drop-shadow(0 18px 28px rgb(41 43 53 / 22%));
}

.modal-dialog-box.is-ticket :deep(.ticket),
.modal-dialog-box.is-ticket :deep(.ticket:hover) {
  min-height: 0;
  max-height: calc(100dvh - 2.5rem);
  transform: none;
}

.modal-dialog-box.is-ticket :deep(.ticket-body) {
  min-height: 0;
  overflow: auto;
  padding-top: 0.85rem;
}

.modal-dialog-box.is-ticket :deep(.ticket-body h2) {
  width: 100%;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 1.35rem 0.85rem;
  border-bottom: 1.5px solid var(--c-border);
}

.is-ticket .modal-head {
  padding: 0;
  border-bottom: 0;
}

.modal-head h2,
.modal-title {
  margin: 0;
  min-width: 0;
  font-size: var(--text-feature-title);
  line-height: 1.35;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.modal-close {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--c-muted);
  font-size: var(--text-section-title);
  cursor: pointer;
}

.modal-close:hover:not(:disabled) {
  background: color-mix(in srgb, var(--c-muted) 12%, white);
}

.modal-close:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.modal-body {
  padding: 1.15rem 1.35rem;
}

.is-ticket .modal-body {
  padding: 0.35rem 0 0;
}

.modal-foot {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.35rem 1.15rem;
  border-top: 1.5px solid var(--c-border);
}

.is-ticket .modal-foot {
  padding: 0;
  border-top: 0;
}

/* 讓表單欄位在視窗裡也有一致的樣式 */
.modal-body :deep(.field) {
  margin-bottom: 1rem;
}

.modal-body :deep(.field-label) {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--c-muted);
  font-size: var(--text-control);
  font-weight: 700;
}

.modal-body :deep(.form-control),
.modal-body :deep(.form-select) {
  min-height: 2.9rem;
  border: 1.5px solid var(--c-border);
  border-radius: 14px;
  font-size: var(--text-control);
}

.modal-body :deep(.field-hint) {
  margin: 0.3rem 0 0;
  color: var(--c-muted);
  font-size: var(--text-min);
}
</style>

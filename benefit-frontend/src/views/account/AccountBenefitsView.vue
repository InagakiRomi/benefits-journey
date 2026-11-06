<script setup>
import { RouterLink } from "vue-router";
import giftIcon from "@iconify-icons/mdi/gift-outline";
import ticketIcon from "@iconify-icons/mdi/ticket-outline";
import starIcon from "@iconify-icons/mdi/star-outline";
import PageIntro from "@/components/layout/PageIntro.vue";
import TicketCard from "@/components/ui/TicketCard.vue";

const benefitLinks = [
  {
    title: "我的收藏庫",
    description: "記錄領到的特典，拍照留念",
    stamp: "收藏",
    color: "yellow",
    to: "/collection",
  },
  {
    title: "我的回報紀錄",
    description: "庫存回報、缺漏回報和審核結果",
    stamp: "回報",
    color: "yellow",
    to: "/my-reports",
  },
];
</script>

<template>
  <section>
    <PageIntro
      kicker="✦ MY BENEFITS"
      lead="我的"
      mark="特典"
      description="收藏庫和回報紀錄只有本人看得到，從這裡前往原本的整頁。"
      :icon-left="giftIcon"
      :icon-right="ticketIcon"
      :icon-top="starIcon"
    />

    <div class="ticket-grid">
      <TicketCard
        v-for="(item, index) in benefitLinks"
        :key="item.to"
        :color="item.color"
        :appear="index < 6"
        :stamp="item.stamp"
        :title="item.title"
        :detail="item.description"
      >
        <template #action>
          <RouterLink class="ticket-link" :to="item.to"> 前往 </RouterLink>
        </template>
      </TicketCard>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 768px) {
  .ticket-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

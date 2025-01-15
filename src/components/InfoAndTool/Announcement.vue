<script setup name="announcement" lang="ts">
import { onMounted, ref } from "vue";

import { DateTime } from "luxon";

import ceobeRequest from "@/api/operations/ceobeRequest";
import type { Announcement } from "@/api/resourceFetcher/announcement";

const announcementData = ref<Announcement[]>([]);
const announcementIndex = ref(0);
const getAnnouncementData = () => {
  ceobeRequest.getAnnouncementInfo().then((res) => {
    if (res.status === 200) {
      announcementData.value = res.data.data.filter(
        (x) =>
          DateTime.fromSQL(x.start_time, { zone: "Asia/Shanghai" }) <=
            DateTime.local() &&
          DateTime.fromSQL(x.over_time, { zone: "Asia/Shanghai" }) >=
            DateTime.local(),
      );
    }
  });
};

onMounted(() => {
  getAnnouncementData();
});
</script>

<template>
  <div class="announcement mt-2">
    <v-card>
      <v-carousel
        v-model="announcementIndex"
        cycle
        interval="3000"
        :show-arrows="false"
        height="160"
        :continuous="false"
        hide-delimiter-background
        delimiter-icon="mdi: mdi-square"
      >
        <v-carousel-item v-for="(item, i) in announcementData" :key="i">
          <div v-html="item.html"></div>
        </v-carousel-item>
      </v-carousel>
    </v-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.announcement {
  .online-area {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 7px;
    font-size: 14px;

    p {
      margin: 0;
    }

    // 菜单按钮

    drawer {
      color: #dd558a;
    }

    // 设置按钮

    setting {
      color: #dd55c4;
    }

    .online-title-img {
      margin: auto 10px;
      height: 105px;

      &.radius {
        border-radius: 4px;
      }
    }
  }
}
</style>

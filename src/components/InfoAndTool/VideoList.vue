<script setup name="video" lang="ts">
import { onMounted, reactive } from "vue";

import { DateTime } from "luxon";

import { getVideoList, VideoItem } from "@/api/resourceFetcher/videoList";

import operate from "../../api/operations/operate";

const videoInfo = reactive<{
  list: VideoItem[];
  getList: () => void;
}>({
  list: [],
  getList() {
    getVideoList().then((res) => {
      // 快捷连接
      videoInfo.list = res.data.data.filter(
        (x) =>
          DateTime.fromSQL(x.start_time, { zone: "Asia/Shanghai" }) <=
            DateTime.local() &&
          DateTime.fromSQL(x.over_time, { zone: "Asia/Shanghai" }) >=
            DateTime.local(),
      );
    });
  },
});
const openUrl = (url: string) => {
  operate.openUrlInBrowser(url);
};

onMounted(() => {
  videoInfo.getList();
});
</script>

<template>
  <div class="video mt-2 d-flex flex-wrap justify-space-evenly">
    <v-card
      v-for="(item, index) in videoInfo.list"
      :key="index"
      width="320"
      class="mb-2"
      @click="openUrl(item.video_link)"
    >
      <!--      {{ item.video_link }}-->
      <v-img
        class="align-end text-white"
        width="100%"
        :src="item.cover_img.split('@')[0]"
        cover
      >
        <v-card-title class="text-right">{{ item.author }}</v-card-title>
      </v-img>

      <v-card-subtitle class="py-2">
        {{ item.title }}
      </v-card-subtitle>
    </v-card>
    <i />
    <i />
    <i />
    <i />
    <i />
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.video {
  .v-card {
    .v-card-title {
      text-shadow: 0 0 5px black;
    }

    .v-img__img {
      object-position: top;
    }

    .v-card-subtitle {
      white-space: normal;
    }
  }

  i {
    width: 320px;
  }
}
</style>

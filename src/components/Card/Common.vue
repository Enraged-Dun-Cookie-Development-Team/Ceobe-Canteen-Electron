<script setup lang="ts">
import { onMounted, ref } from "vue";

import ceobeRequest from "@/api/operations/ceobeRequest";
import { Cookie } from "@/api/resourceFetcher/cookieList";

const props = defineProps<{
  info: Cookie;
}>();
const emits = defineEmits({
  openUrl: null,
});

const imgUrl = ref<string>("");
const getImg = (index: number = 0) => {
  if (!props.info.default_cookie.images) {
    return;
  } else if (props.info.datasource.includes("微博")) {
    ceobeRequest
      .getHasRefererImageBase64(
        props.info.default_cookie.images[index].origin_url,
      )
      .then((res) => {
        imgUrl.value = `data:image/jpeg;base64,${res}`;
      });
  } else {
    const url = new URL(props.info.default_cookie.images[index].origin_url);
    ceobeRequest
      .getHasRefererImageBase64(
        props.info.default_cookie.images[index].origin_url,
        url.origin,
      )
      .then((res) => {
        imgUrl.value = `data:image/jpeg;base64,${res}`;
      });
  }
  return imgUrl.value;
};

const openUrl = () => {
  // 统一格式 只需要标题和url和icon
  const data = {
    url: props.info.item.url,
    source: props.info.datasource,
    icon: props.info.icon,
  };
  console.log(data);
  emits("openUrl", data);
};

onMounted(() => {
  if (props.info.default_cookie.images) {
    getImg();
  }
});
</script>

<template>
  <div class="common-window">
    <v-card class="mx-auto cursor-pointer" width="400" @click="openUrl">
      <v-img
        v-if="info.default_cookie.images"
        referrerpolicy="no-referrer"
        class="align-end text-white header-image"
        :src="getImg()"
        max-height="320"
        cover
      ></v-img>

      <v-card-text>
        <div class="cookie-text">{{ info.default_cookie.text }}</div>
        <div v-if="info.item.retweeted" class="retweet-area">
          <div>转发自：{{ info.item.retweeted.author_name }}</div>
          <div class="retweet-text">{{ info.item.retweeted.text }}</div>
        </div>
      </v-card-text>

      <v-card-actions>
        <slot :info="info"></slot>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.common-window {
  .header-image {
    img {
      object-position: top;
    }
  }
  .cookie-text {
    /* 盒子模型 */
    display: -webkit-box;
    /* 超出范围隐藏 */
    overflow: hidden;
    /* 文字超出用省略号 */
    text-overflow: ellipsis;
    white-space: pre-wrap;
    /* 显示的文本行数 */
    -webkit-line-clamp: 10;
    /* 子元素的垂直排列方式 */
    -webkit-box-orient: vertical;
  }
  .retweet-area {
    padding: 10px;
    background-color: #e7e7e7;
    .retweet-text {
      /* 盒子模型 */
      display: -webkit-box;
      /* 超出范围隐藏 */
      overflow: hidden;
      /* 文字超出用省略号 */
      text-overflow: ellipsis;
      white-space: pre-wrap;
      /* 显示的文本行数 */
      -webkit-line-clamp: 7;
      /* 子元素的垂直排列方式 */
      -webkit-box-orient: vertical;
    }
  }
}
</style>

<script setup lang="ts">
import operate from "@/api/operations/operate";
import {
  DownloadSource,
  primaryToSpare,
  PrimaryUrl,
  SpareUrl,
} from "@/api/resourceFetcher/version";
import { log } from "console";
import { computed, ref } from "vue";

const props = defineProps<{
  source: DownloadSource;
}>();

const initialSelect = ref(1);

const downloadSourceCombine = (primary: PrimaryUrl, spares?: SpareUrl[]) => {
  const urls: SpareUrl[] = [];
  urls.push(primaryToSpare(primary));
  if (spares) urls.push(...spares);
  return urls;
};
const urls = computed(() =>
  downloadSourceCombine(props.source.primary_url, props.source.spare_urls).map(
    (url) => {
      return url.url;
    },
  ),
);
const sourceItem = computed(() =>
  downloadSourceCombine(props.source.primary_url, props.source.spare_urls).map(
    (url) => {
      console.log(url);

      return {
        title: url.name === "Primary" ? "主链接" : url.name,
        subtitle: `手动下载：${url.manual} | 支持平台：${url.support_platforms ?? [].join(", ")}`,
      };
    },
  ),
);
</script>

<template>
  <v-col>
    <p v-if="source.description">{{ source.description }}</p>
    <VSelect>
      density="compact" lable="下载源" v-model="initialSelect"
      :item="sourceItem"
    </VSelect>
    <v-btn
      color="#e6a23c"
      icon="mdi mdi-check"
      @click="operate.openUrlInBrowser(urls[initialSelect - 1])"
    />
  </v-col>
</template>

<style lang="scss" scoped></style>

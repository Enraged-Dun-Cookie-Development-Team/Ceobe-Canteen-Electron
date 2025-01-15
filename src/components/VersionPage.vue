<script setup name="version" lang="ts">
import { computed, defineEmits, defineProps, onMounted, reactive } from "vue";

import { app } from "@tauri-apps/api";

import operate from "@/api/operations/operate";
import {
  primaryToSpare,
  PrimaryUrl,
  ReleaseVersion,
  SpareUrl,
} from "@/api/resourceFetcher/version";
import DownloadSource from "./DownloadSource.vue";

const props = defineProps<{
  versionInfo: ReleaseVersion;
}>();
const emits = defineEmits({
  close: null,
});

// 如果更新版本即为前一强制更新版本，需要强制更新
const mandatory = computed(
  () =>
    props.versionInfo.previous_mandatory_version === props.versionInfo.version,
);

// const Selects = ref(props.versionInfo.download_source.map(()=>1))

const downloadSourceCombine = (primary: PrimaryUrl, spares?: SpareUrl[]) => {
  const urls: SpareUrl[] = [];
  urls.push(primaryToSpare(primary));
  if (spares) urls.push(...spares);
  return urls;
};

const itemProp = (item: SpareUrl) => {
  return {
    title: item.name === "Primary" ? "主链接" : item.name,
    subtitle: `手动下载：${item.manual} | 支持平台：${item.support_platforms ?? [].join(", ")}`,
  };
};

const version = reactive<{
  currentVersion: string;
  show: boolean;
  openUrl(url: string): void;
  close(): void;
  exist(): void;
}>({
  currentVersion: "",
  show: false,
  // 查看收支一览表
  openUrl(url: string) {
    console.log(url);
    if (!url) {
      return;
    }
    operate.openUrlInBrowser(url);
  },
  close() {
    emits("close");
  },
  exist() {
    operate.exit();
  },
});
onMounted(() => {
  app.getVersion().then((nowVersion: string) => {
    version.currentVersion = nowVersion;
  });
});
</script>

<template>
  <div class="donate">
    <v-card>
      <v-toolbar color="#e6a23c">
        <v-toolbar-title>版本更新</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!mandatory"
          variant="text"
          icon="fa-solid fa-xmark"
          @click="version.close"
        ></v-btn>
      </v-toolbar>
      <v-card-text>
        <div v-if="mandatory" class="text-subtitle-1 pl-6">更新方式：强制</div>
        <div class="text-subtitle-1 pl-6">
          版本：{{ version.currentVersion }} >>> {{ versionInfo.version }}
          <br />
          {{ versionInfo.description }}
        </div>
        <div v-for="source in versionInfo.download_source" :key="source.name">
          <download-source :source="source"> </download-source>
        </div>
        <!-- <v-btn
          v-for="source in versionInfo.download_source"
          :key="source.name"
          density="de"
          color="#e6a23c"
          class="w-25"
        >
          <template #default>
            <v-select
              density="compact"
              class="w-100 h-100"
              label="下载源"
              :items="
                downloadSourceCombine(source.primary_url, source.spare_urls)
              "
              :item-props="itemProp"
            />
          </template>
          <template #append> 下载 </template>
        </v-btn> -->

        <!-- <v-btn
            color="#e6a23c"
            @click="version.openUrl(versionInfo.exe)"
        >Windows安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl(versionInfo.spare_exe)"
        >Windows备用安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl(versionInfo.dmg)"
        >Mac安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl(versionInfo.spare_dmg)"
        >Mac备用安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl('')"
        >Ubuntu安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl('')"
        >Ubuntu备用安装包
        </v-btn>
        <v-btn
            color="#e6a23c"
            @click="version.openUrl(versionInfo.baidu)"
        >百度云链接{{ versionInfo.baidu_text }}
        </v-btn> -->
      </v-card-text>
      <v-card-actions class="justify-space-around flex-wrap">
        <v-btn v-if="mandatory" color="red" @click="version.exist"
          >退出小刻食堂
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss"></style>

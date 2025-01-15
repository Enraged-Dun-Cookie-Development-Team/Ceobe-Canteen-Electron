<script lang="ts" name="setting" setup>
import { computed, onMounted, reactive } from "vue";

import { app, invoke } from "@tauri-apps/api";

import notification, {
  allNotifyMode,
  NotifyMode,
} from "@/api/operations/notification";
import operate from "@/api/operations/operate";
import { VersionStateType } from "@/api/operations/updater";
import SettingItem from "@/components/SettingItem/SettingItem.vue";

const emits = defineEmits<{
  (e: "close"): void;
  (e: "checkUpdate"): void;
}>();

const props = withDefaults(
  defineProps<{
    versionState: VersionStateType;
  }>(),
  {
    versionState: VersionStateType.Unknown,
  },
);

const isDebug = computed(() => {
  return invoke("is_debug");
});

// test send notification
const sen_d = () => {
  setTimeout(() => {
    operate.openNotificationWindow({
      datasource: "kkwd",
      default_cookie: {
        images: [
          {
            compress_url: null,
            origin_url:
              "https://i0.hdslb.com/bfs/new_dyn/2956e376fb056cf79cc95bcf585dbbc0161775300.jpg",
          },
        ],
        text: "欸嘿嘿，桃金娘的脚小小的~香香的~.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
      icon: "/assets/icon/anime.png",
      source: { data: "123", type: "nn" },
      timestamp: {
        fetcher: 114_514,
        platform: 114_514,
        platform_precision: "minute",
      },
      item: {
        id: "123",
        url: "https://www.bilibili.com",
      },
    });
  }, 5000);
};

const showDownload = computed(
  () => props.versionState === VersionStateType.UpdateAvailable,
);
const showAlreadyNewest = computed(
  () => props.versionState === VersionStateType.Newest,
);

const setting = reactive<{
  // auto boot setting
  autoBoot: boolean;
  initAutoBoot: () => void;
  setAutoBoot: () => void;
  // quit
  close: () => void;
  checkUpdate: () => void;
  // notification
  notify_mode: { idx: number; tip: string; value: string };
  initNotifyMode: () => void;
  setNotifyMode: () => void;
  //version
  currentVersion: string;
  getAppVersion: () => void;
}>({
  currentVersion: "",
  getAppVersion: () => {
    app.getVersion().then((version) => {
      setting.currentVersion = version;
    });
  },
  notify_mode: NotifyMode.PopUpAndBeep,
  initNotifyMode: () => {
    notification.getNotificationMode().then((v) => (setting.notify_mode = v));
  },
  setNotifyMode: () => {
    notification.setNotificationMode(setting.notify_mode.idx);
  },
  autoBoot: false,
  setAutoBoot() {
    operate.bootSetting(setting.autoBoot).then(() => {});
  },
  initAutoBoot() {
    operate.getBootSetting().then((res) => {
      setting.autoBoot = res;
    });
  },
  close() {
    emits("close");
  },

  checkUpdate(): void {
    emits("checkUpdate");
  },
});

onMounted(() => {
  setting.initAutoBoot();
  setting.initNotifyMode();
  setting.getAppVersion();
});
</script>

<template>
  <div class="setting">
    <v-card>
      <v-toolbar color="#e6a23c">
        <v-toolbar-title>设置</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon="fa-solid fa-xmark"
          variant="text"
          @click="setting.close"
        ></v-btn>
      </v-toolbar>
      <SettingItem sub-title="每次开机就能自动蹲饼呢~" title="开机自启">
        <template #action="{ color }">
          <v-switch
            v-model="setting.autoBoot"
            :color="color"
            @change="setting.setAutoBoot"
          >
          </v-switch>
        </template>
      </SettingItem>
      <SettingItem title="版本">
        <template #sub-title> 当前版本 {{ setting.currentVersion }} </template>
        <template #action="{ color }">
          <v-btn :color="color" @click="setting.checkUpdate">检查更新 </v-btn>
        </template>
      </SettingItem>
      <SettingItem v-if="!isDebug" title="测试弹窗">
        <template #action>
          <v-btn @click="sen_d"> 弹窗 </v-btn>
        </template>
      </SettingItem>
      <SettingItem>
        <template #fill-action>
          <v-select
            v-model="setting.notify_mode"
            :hint="setting.notify_mode.tip"
            :items="allNotifyMode"
            item-title="value"
            label="通知设置"
            persistent-hint
            return-object
            @update:model-value="setting.setNotifyMode()"
          >
          </v-select>
        </template>
      </SettingItem>
    </v-card>
    <v-snackbar v-model="showDownload">
      检测到了新版本，即将跳转到下载页面
    </v-snackbar>
    <v-snackbar v-model="showAlreadyNewest">
      已经是最新版本，无需下载
    </v-snackbar>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss"></style>

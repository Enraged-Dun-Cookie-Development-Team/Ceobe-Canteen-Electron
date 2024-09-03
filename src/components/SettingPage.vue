<template>
  <div class="setting">
    <v-card>
      <v-toolbar color="#e6a23c">

        <v-toolbar-title>设置</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="fa-solid fa-xmark" variant="text" @click="setting.close"></v-btn>
      </v-toolbar>
      <SettingItem sub-title="每次开机就能自动蹲饼呢~" title="开机自启">
        <template v-slot:action="{ color }">
          <v-switch v-model="setting.autoBoot" :color=color @change="setting.setAutoBoot">
          </v-switch>
        </template>

      </SettingItem>
      <SettingItem title="版本">
        <template v-slot:sub-title>
          当前版本 {{ setting.currentVersion }}
        </template>
        <template v-slot:action="{ color }">
          <v-btn :color="color" @click="setting.checkUpdate">
            检查更新
          </v-btn>
        </template>
      </SettingItem>
      <SettingItem title="缓存">
        <template v-slot:sub-title>
          当前缓存: {{ setting.cacheSize }}
        </template>
        <template v-slot:action="{ color }">
          <v-btn v-if="cacheClearManager.status.status === 'Done'" color="success" @click="setting.getCacheSize">
            清理完成
            <v-tooltip activator="parent" location="top">已清理 {{ cacheClearManager.status.data }} 个文件</v-tooltip>
          </v-btn>
          <v-btn v-else-if="cacheClearManager.status.status === 'Error'" color="error">
            错误发生
            <v-tooltip activator="parent" location="top">清理缓存时出现异常，无法正常清理</v-tooltip>
          </v-btn>
          <v-btn v-else v-bind="props" :color="color" :loading="cacheClearManager.status.status === 'Clearing'" :aria-disabled="cacheClearManager.status.status === 'Clearing'"
            @click="cacheClearManager.clearCacheDir">
            立即清理
            <v-tooltip activator="parent" location="top">超过 3 天的缓存将被清除</v-tooltip>
          </v-btn>
        </template>
      </SettingItem>
      <SettingItem v-if="!isDebug" title="测试弹窗">
        <template v-slot:action>
          <v-btn @click="sen_d">
            弹窗
          </v-btn>
        </template>
      </SettingItem>
      <SettingItem>
        <template v-slot:fill-action>
          <v-select v-model="setting.notify_mode" :hint='setting.notify_mode.tip' :items="allNotifyMode"
            item-title="value" label="通知设置" persistent-hint return-object @update:model-value="setting.setNotifyMode()">
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

<script lang="ts" name="setting" setup>
import { computed, onMounted, reactive } from "vue";
import operate from "@/api/operations/operate";
import SettingItem from "@/components/SettingItem/SettingItem.vue";
import notification, { allNotifyMode, NotifyMode } from "@/api/operations/notification";
import { app, invoke } from "@tauri-apps/api";
import { VersionStateType } from "@/api/operations/updater";

import type { ClearStatus } from "@/api/operations/operate";

const emits = defineEmits<{
  (e: "close"): void,
  (e: "checkUpdate"): void
}>()

const props = withDefaults(defineProps<{
  versionState: VersionStateType
}>(), {
  versionState: VersionStateType.Unknown
})

const isDebug = computed(() => {
  return invoke("is_debug")
})

// test send notification
const sen_d = () => {
  setTimeout(
    () => {

      operate.openNotificationWindow({
        item: {
          "id": "114514",
          "url": "https://www.bilibili.com",
        },
        datasource: 'kkwd',
        default_cookie: {
          images: [{ compress_url: null, origin_url: 'https://i0.hdslb.com/bfs/new_dyn/2956e376fb056cf79cc95bcf585dbbc0161775300.jpg' }],
          text: '欸嘿嘿，桃金娘的脚小小的~香香的~.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        },
        icon: '/assets/icon/anime.png',
        source: { data: '123', type: 'nn' },
        timestamp: { fetcher: 114514, platform: 114514, platform_precision: 'minute' }
      })
    }, 5000)
}

const showDownload = computed(() => props.versionState === VersionStateType.UpdateAvailable)
const showAlreadyNewest = computed(() => props.versionState === VersionStateType.Newest)

const setting = reactive<{
  // auto boot setting
  autoBoot: boolean,
  initAutoBoot: () => void,
  setAutoBoot: () => void,
  // quit 
  close: () => void,
  checkUpdate: () => void
  // notification
  notify_mode: { idx: number, tip: string, value: string },
  initNotifyMode: () => void
  setNotifyMode: () => void
  //version
  currentVersion: string,
  getAppVersion: () => void
  // cache
  cacheSize: string,
  getCacheSize: () => void
}>({
  currentVersion: "",
  getAppVersion: () => {
    app.getVersion().then((version) => {
      setting.currentVersion = version
    })
  },
  notify_mode: NotifyMode.PopUpAndBeep,
  initNotifyMode: () => {
    notification.getNotificationMode()
      .then((v) => setting.notify_mode = v)
  },
  setNotifyMode: () => {

    notification.setNotificationMode(setting.notify_mode.idx)
  },
  autoBoot: false,
  setAutoBoot() {
    operate.bootSetting(setting.autoBoot).then(() => {
    });
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

  cacheSize: "Unknown",
  getCacheSize() {
    setting.cacheSize = "Calculating...";
    operate.getCacheDirSize().then((res) => {
      setting.cacheSize = res;
    });
  }

});

type ClearStatusPlus = ClearStatus | { status: "Error", data: string } | { status: "Unset" };

const cacheClearManager = reactive({
  status: {
    status: "Unset",
  } as ClearStatusPlus,

  clearCacheDir() {
    cacheClearManager.status = {
      status: "Clearing"
    };
    operate.clearCacheDir().then((status: ClearStatus) => {
      switch (status.status) {
        case "Done":
          setting.getCacheSize();
          // cacheClearManager.status = status;
          // 等个1s再更改状态
          setTimeout(() => {
            cacheClearManager.status = status;
          }, 1000);
          break;

        case "Clearing":
          cacheClearManager.status = status;
          // 等个0.5s再继续查询
          setTimeout(() => {
            cacheClearManager.clearCacheDir();
          }, 500);
          break;

        default:
          throw new Error("Unknown status");
      }
    })
      .catch((e) => {
        cacheClearManager.status = {
          status: "Error",
          data: e.toString()
        };
      });
  }
})

onMounted(async () => {
  setting.initAutoBoot();
  setting.initNotifyMode();
  setting.getAppVersion();
  setting.getCacheSize();
});
</script>

<style lang="scss" rel="stylesheet/scss"></style>

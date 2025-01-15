<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

import updateManager from "@/api/managers/UpdateManager";
import { getDatasourceComb } from "@/api/resourceFetcher/datasourceCombine";
import {
  DatasourceItem,
  getConfigDatasourceList,
} from "@/api/resourceFetcher/datasourceList";

import datasourceConfigOperate from "../api/operations/datasourceConfig";
import storage from "../api/operations/localStorage";
import operate from "../api/operations/operate";
import searchWordEvent from "../api/operations/searchWordEvent";
import updater, { VersionStateType } from "../api/operations/updater";

import DonatePage from "./DonatePage.vue";
import SettingPage from "./SettingPage.vue";
import VersionPage from "./VersionPage.vue";
import { ReleasePlatform, ReleaseVersion } from "@/api/resourceFetcher/version";

const winMax = ref(false);

interface ViewDatasourceItem extends DatasourceItem {
  check: boolean;
}

// APP顶端菜单
const menuShow = reactive<{
  notOpened: boolean;
  show: boolean;
  datasourceList: ViewDatasourceItem[];
  changeSelectSource: (data: ViewDatasourceItem) => void;
  changeDatasourceOpen: (value: boolean) => void;
}>({
  notOpened: true, // 没有打开过
  show: false,
  datasourceList: [],
  changeSelectSource(data: ViewDatasourceItem) {
    data.check = !data.check;
  },
  async changeDatasourceOpen(value: boolean) {
    if (value) {
      if (menuShow.notOpened) {
        menuShow.notOpened = false;
      }
      const datasourceConfig =
        await storage.getItem<string[]>("datasource-config");
      // 打开列表
      getConfigDatasourceList().then((data) => {
        if (data.status === 200) {
          menuShow.datasourceList = data.data.data.map(
            (data: DatasourceItem) => {
              return {
                ...data,
                check: false,
              };
            },
          );
          if (datasourceConfig) {
            const datasourceConfigUuidMap: Record<string, boolean> = {};
            for (const datasource of datasourceConfig) {
              datasourceConfigUuidMap[datasource] = true;
            }
            for (const element of menuShow.datasourceList) {
              if (datasourceConfigUuidMap[element.unique_id]) {
                element.check = true;
              }
            }
          } else {
            for (const element of menuShow.datasourceList) {
              element.check = true;
            }
          }
        }
      });
    } else {
      if (menuShow.notOpened) {
        return;
      }
      // 关闭列表
      const datasourceConfig = menuShow.datasourceList
        .filter((element) => {
          return element.check;
        })
        .map((element) => {
          return element.unique_id;
        });
      const comb_resp = await getDatasourceComb(datasourceConfig);
      const comb_id = comb_resp.data.data.datasource_comb_id;
      const datasourceComb = await storage.getItem<string>("datasource-comb");
      // 如果组合id和之前一样，不进行刷新
      if (datasourceComb === comb_id) {
        return;
      }
      await storage.setItem("datasource-config", datasourceConfig);
      await storage.setItem("datasource-comb", comb_id);
      await datasourceConfigOperate.updateDatasourceComb();
    }
  },
});
// 搜索功能
const search = reactive({
  show: false,
  wordShow: "",
  searchWord: null,
  searching() {
    if (search.searchWord) {
      // 将搜索词发送给timeline进行处理
      searchWordEvent.sendSearchWord(search.searchWord);
      search.wordShow = search.searchWord;
    }
  },
  searchChange() {
    // 如果为空 同步到timeline
    if (search.searchWord === "" || !search.searchWord) {
      search.wordShow = "";
      searchWordEvent.sendSearchWord("");
    }
  },
});

// 窗口事件控制
const handleWindow = reactive({
  // 最小化
  minus() {
    operate.minus();
  },
  // 最大化 重置大小
  maximize() {
    winMax.value = !winMax.value;
    operate.maximize();
  },
  // 关闭
  close() {
    operate.close();
  },
});

// 捐赠窗口控制
const donate = reactive({
  show: false,
});

// 设置界面窗口控制
const setting = reactive({
  show: false,
  // updater setting
  versionState: VersionStateType.Unknown,
  close() {
    setting.show = false;
    setting.versionState = VersionStateType.Unknown;
  },
});

const ErrVersionInfo: ReleaseVersion = {
  deleted: false,
  download_source: [],
  platform: ReleasePlatform.Desktop,
  previous_mandatory_version: "",
  version: "0.0.0",
};

const version = reactive<{
  show: boolean;
  version_info: ReleaseVersion;
  force: boolean;
  getNewestVersion(): void;
}>({
  show: true,
  force: false,
  version_info: ErrVersionInfo,
  async getNewestVersion() {
    try {
      if (setting.show) {
        setting.versionState = VersionStateType.Newest;
      }
      const currentVersion = await updateManager.latestVersion();
      if (currentVersion) version.version_info = currentVersion;
      // version.force = await updater.judgmentVersion(version.version_info.last_force_version)
      version.show = await updater.judgmentVersion(
        version.version_info.version,
      );
      if (version.show) {
        setting.versionState = VersionStateType.UpdateAvailable;
      }
    } catch (error: any) {
      console.log("Failure loading New Version");
      if (!(await isPermissionGranted())) {
        await requestPermission();
      }
      sendNotification({
        title: "小刻出错了！",
        icon: "/asserts/icon.png",
        body: error.toString(),
      });
    }
  },
});

onMounted(() => {
  version.getNewestVersion();
});
</script>

<template>
  <div
    class="app-top d-flex justify-space-between align-center w-100 pa-2"
    data-tauri-drag-region
  >
    <div class="h-100 d-flex align-center">
      <v-img src="icon.png" width="40"></v-img>
      <span class="title ml-2 mt-1">小刻食堂</span>
    </div>

    <div class="h-100 no-drag">
      <v-menu
        v-model="search.show"
        :close-on-content-click="false"
        location="bottom"
        transition="slide-y-transition"
      >
        <template #activator="{ props }">
          <v-btn
            icon="fas fa-magnifying-glass"
            v-bind="props"
            variant="text"
          ></v-btn>
        </template>
        <v-card class="mx-auto" color="grey-lighten-3" min-width="400">
          <v-text-field
            v-model="search.searchWord"
            append-inner-icon="fa fa-magnifying-glass"
            autofocus
            class="pa-2"
            clearable
            color="grey-lighten-1"
            density="compact"
            hide-details
            label="查找饼仓"
            variant="outlined"
            @click:append-inner="search.searching"
            @update:model-value="search.searchChange"
          ></v-text-field>
        </v-card>
      </v-menu>
      <span v-if="search.wordShow !== ''">{{ search.wordShow }}</span>
      <v-menu
        v-model="menuShow.show"
        :close-on-content-click="false"
        location="right"
        transition="slide-y-transition"
      >
        <template #activator="{ props }">
          <v-btn
            icon="fa fa-filter"
            v-bind="props"
            variant="text"
            @click="menuShow.changeDatasourceOpen(menuShow.show)"
          ></v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="(item, i) in menuShow.datasourceList"
            :key="i"
            :class="item.check ? '' : 'not'"
            :prepend-avatar="item.avatar"
            :title="item.nickname"
            :value="item"
            class="menuShow-item"
            color="primary"
            @click="menuShow.changeSelectSource(item)"
          >
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <!-- right control panel -->
    <div class="h-100 no-drag">
      <v-btn
        icon="fas fa-comments-dollar"
        variant="text"
        @click="donate.show = true"
      ></v-btn>
      <v-btn
        icon="fas fa-gear"
        variant="text"
        @click="setting.show = true"
      ></v-btn>
      <v-btn
        icon="fas fa-minus"
        variant="text"
        @click="handleWindow.minus"
      ></v-btn>
      <v-btn
        :icon="winMax ? 'fas fa-minimize' : 'fas fa-maximize'"
        variant="text"
        @click="handleWindow.maximize"
      ></v-btn>
      <v-btn
        color="error"
        icon="fas fa-circle-xmark "
        variant="text"
        @click="handleWindow.close"
      ></v-btn>
    </div>
  </div>

  <v-dialog
    v-model="donate.show"
    persistent
    transition="dialog-top-transition"
    width="800"
  >
    <donate-page @close="donate.show = false"></donate-page>
  </v-dialog>

  <v-dialog
    v-model="setting.show"
    persistent
    transition="dialog-top-transition"
    width="400"
  >
    <setting-page
      :version-state="setting.versionState"
      @check-update="version.getNewestVersion"
      @close="setting.close"
    ></setting-page>
  </v-dialog>
  <v-dialog
    v-model="version.show"
    persistent
    transition="dialog-top-transition"
    width="600"
  >
    <version-page
      :force="version.force"
      :version-info="version.version_info"
      @close="version.show = false"
    ></version-page>
  </v-dialog>
</template>

<style lang="scss" rel="stylesheet/scss">
.app-top {
  position: relative;
  height: 60px;
  background: #fdba4b;
  -webkit-app-region: drag;

  .no-drag {
    -webkit-app-region: no-drag;
  }

  .title {
    font-size: 26px;
    font-family: "DOUYUfont", sans-serif;
    color: #707070;
  }
}

.menuShow-item {
  position: relative;
  transition: all 0.3s;

  &.not {
    filter: grayscale(100%) opacity(25%);
  }
}
</style>

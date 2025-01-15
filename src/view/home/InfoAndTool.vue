<script setup name="infoAndTool" lang="ts">
import operate from "@/api/operations/operate";
import {
  DatasourceItem,
  getResourceList,
} from "@/api/resourceFetcher/datasourceList";
import { getToolsLinks } from "@/api/resourceFetcher/toolkits.js";
import Announcement from "@/components/InfoAndTool/Announcement.vue";
import ToolOrSource from "@/components/InfoAndTool/ToolOrSource.vue";
import VideoList from "@/components/InfoAndTool/VideoList.vue";
import WeeklyQuest from "@/components/InfoAndTool/WeeklyQuest.vue";

const cookieSourceLoader = async () => {
  const resp = await getResourceList();
  const sourceList = resp.data.data;
  const list = sourceList
    .filter((datasource: DatasourceItem) => {
      return datasource.jump_url != null;
    })
    .map((datasource: DatasourceItem) => {
      return {
        jump_url: datasource.jump_url ?? "",
        nickname: datasource.nickname,
        avatar: datasource.avatar,
      };
    });
  console.log(list);
  return list;
};

const toolListLoader = async () => {
  const resp = await getToolsLinks();
  return resp.data.data;
};
</script>

<template>
  <div class="info-and-tool">
    <!--常用信息-->
    <weekly-quest></weekly-quest>
    <!--公告-->
    <announcement></announcement>
    <!--广告-->
    <!--快捷工具-->
    <tool-or-source
      title="快捷工具"
      :get-list="toolListLoader"
    ></tool-or-source>
    <!--发源地-->
    <tool-or-source
      title="饼的发源地"
      :img-local="false"
      :get-list="cookieSourceLoader"
    ></tool-or-source>
    <!--推荐视频-->
    <video-list></video-list>
    <div class="d-flex justify-center ma-2">
      Powered By &nbsp;<v-btn
        class="pl-0"
        variant="plain"
        density="compact"
        @click="
          operate.openUrlInBrowser('https://www.ceobecanteen.top/#about-us')
        "
        >CeobeCanteen
      </v-btn>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.info-and-tool {
  overflow: auto;
  padding: 10px 16px 0;
  min-width: 600px;
  user-select: none;
}

a {
  text-decoration: none;
}
</style>

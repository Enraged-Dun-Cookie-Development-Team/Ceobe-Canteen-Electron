<script lang="ts" name="timeLine" setup>
import { nextTick, onMounted, reactive, ref } from "vue";

import { type, OsType } from "@tauri-apps/api/os";
import * as htmlToImage from "html-to-image";
import { useRouter } from "vue-router";

import logger from "@/api/operations/logger";
import newestTimeline, { Timeline } from "@/api/operations/newestTimeline";
import operate from "@/api/operations/operate";
import searchWordEvent from "@/api/operations/searchWordEvent";
import { getCookieList } from "@/api/resourceFetcher/cookieList";
import { getCookieSearchList } from "@/api/resourceFetcher/searchCookie";
import Common from "@/components/Card/Common.vue";
import { getImage } from "@/utils/imageUtil";
import { previewUrl } from "@/utils/previewUtil";

const router = useRouter();

const timeLineRef = ref<HTMLElement | null>(null);

const setTimeLineRef = (ref: any) => {
  timeLineRef.value = ref;
};

// 卡片数据
const timeline = reactive<Timeline>({
  combId: null,
  nextPageId: null,
  refreshCombId: null,
  refreshNextPageId: null,
  refreshTimelineData: null,
  refreshUpdateCookieId: null,
  searchWord: null,
  tempNextPageId: null,
  tempTimelineData: null,
  timelineData: null,
  updateCookieId: null,
  searchStatus: false,
});

const _backTopTimeLine = () => {
  if (timeLineRef.value) {
    timeLineRef.value.scrollTop = 0;
  }
};

async function getData() {
  console.log("await newestTimeline.getTimeline");
  await newestTimeline.getTimeline((_, arg) => {
    logger.debug("TimeLine.vue", { cookie: arg });
    console.log(arg);
    if (arg == null) {
      console.warn("no data");
      return;
    }
    if (timeline.searchStatus) {
      // 搜索状态直接更新临时
      timeline.tempTimelineData = arg.cookies;
      timeline.combId = arg.comb_id;
      timeline.updateCookieId = arg.update_cookie_id;
      timeline.tempNextPageId = arg.next_page_id ?? null;
    } else if (!timeline.timelineData || !scroll.scrollShow) {
      timeline.timelineData = arg.cookies;
      timeline.combId = arg.comb_id;
      timeline.updateCookieId = arg.update_cookie_id;
      timeline.nextPageId = arg.next_page_id ?? null;
      _backTopTimeLine();
    } else {
      timeline.refreshTimelineData = arg.cookies;
      timeline.refreshCombId = arg.comb_id;
      timeline.refreshUpdateCookieId = arg.update_cookie_id;
      timeline.refreshNextPageId = arg.next_page_id ?? null;
    }
  });
}

function refreshTimeline() {
  if (!timeline.refreshTimelineData) {
    return;
  }
  timeline.timelineData = timeline.refreshTimelineData.slice(0);
  timeline.refreshTimelineData = null;
  timeline.combId = timeline.refreshCombId;
  timeline.refreshCombId = null;
  timeline.updateCookieId = timeline.refreshUpdateCookieId;
  timeline.refreshUpdateCookieId = null;
  timeline.nextPageId = timeline.refreshNextPageId;
  timeline.refreshNextPageId = null;
  _backTopTimeLine();
}

function searchTimeline() {
  searchWordEvent.getSearchWord((_, searchWord) => {
    timeline.searchWord = searchWord;
    if (searchWord !== "" && searchWord !== null) {
      // 先确保数据更新到显示
      refreshTimeline();
      // 如果之前不是在搜索状态，才转移列表
      if (!timeline.searchStatus) {
        // 把列表存到临时列表
        timeline.tempTimelineData = timeline.timelineData?.slice(0) ?? null;
        timeline.tempNextPageId = timeline.nextPageId;
        timeline.timelineData = null;
        timeline.nextPageId = null;
        timeline.searchStatus = true;
        _backTopTimeLine();
      }
      getCookieSearchList({
        datasource_comb_id: timeline.combId?.toString() ?? "",
        search_word: searchWord,
      }).then((data) => {
        if (data.status === 200) {
          const respData = data.data.data;
          timeline.timelineData = respData.cookies;
          timeline.nextPageId = respData.next_page_id ?? null;
        }
      });
    } else if (timeline.searchStatus) {
      // 如果之前是在搜索状态，才需要回归
      // 回归普通列表
      timeline.searchStatus = false;
      timeline.timelineData = timeline.tempTimelineData?.slice(0) ?? null;
      timeline.nextPageId = timeline.tempNextPageId;
      _backTopTimeLine();
    }
  });
}

// 卡片操作
const card = reactive({
  osType: "",
  isCopyImage: false, // 当前是否在截图
  copyImageId: "",
  openUrlInThis(data: { url: string; icon: string; source: string }) {
    previewUrl(data.url, data.source);
    router.push({
      path: "/home/Browser",
      query: data,
    });
  },
  copyImage(id: string) {
    card.copyImageId = id;
    card.isCopyImage = true;
    setTimeout(() => {
      nextTick(async () => {
        // 包的问题，非windows多截图一次，详见：https://github.com/bubkoo/html-to-image/issues/147
        const elem = document.querySelector(id) as HTMLElement;
        if (!elem) {
          return;
        }
        if (card.osType !== "Windows_NT") {
          await htmlToImage.toJpeg(elem, { quality: 0.95, pixelRatio: 3 });
        }

        htmlToImage
          .toJpeg(elem, { quality: 0.95, pixelRatio: 3 })
          .then(function (dataUrl) {
            card.isCopyImage = false;
            operate.copy({ type: "img", data: dataUrl });
          });
      });
    }, 500);
  },
  copy(url: string) {
    // show.value = true;
    operate.copy({ type: "text", data: url });
  },
  openUrlInBrowser(url: string) {
    operate.openUrlInBrowser(url);
  },
});

// 滚动操作
const scroll = reactive({
  scrollShow: false,

  bindHandleScroll(e: any) {
    // FIXME：看不出来是什么类型，先any
    if (document.querySelector(".time-line") !== e.target) {
      return;
    }
    scroll.scrollShow = e.target.scrollTop > 600;

    // 如果有数据，向上滚动小于600过程自动刷新
    if (!scroll.scrollShow && timeline.refreshTimelineData != null) {
      refreshTimeline();
    }

    // 因为有些情况会导致高度不能正好相等，给个差值小于5来扩大判断范围
    if (
      Math.abs(
        e.target.scrollTop + e.target.clientHeight - e.target.scrollHeight,
      ) < 5
    ) {
      if (!timeline.nextPageId) {
        return;
      }
      if (!timeline.combId || !timeline.searchWord) {
        return;
      }
      if (timeline.searchStatus) {
        getCookieSearchList({
          cookie_id: timeline.nextPageId,
          datasource_comb_id: timeline.combId.toString(),
          search_word: timeline.searchWord.toString(),
        }).then((data) => {
          if (data.status === 200) {
            const respData = data.data.data;
            timeline.timelineData?.push(...respData.cookies);
            timeline.nextPageId = respData.next_page_id ?? null;
          }
        });
      } else {
        getCookieList(
          timeline.combId.toString(),
          timeline.nextPageId,
          timeline.updateCookieId ?? undefined,
        )
          .then((resp) => {
            const cookies_info = resp.data.data;
            timeline.timelineData?.push(...cookies_info.cookies);
            timeline.nextPageId = cookies_info.next_page_id ?? null;
          })
          .catch(() => {
            // TODO：弹窗处理一下
          });
      }
    }
  },
  scrollToTop() {
    const elem = document.querySelector(".time-line");
    if (!elem) {
      return;
    }
    let top = elem.scrollTop;
    const changeTop = top / 10;
    const timeTop = setInterval(() => {
      if (!elem) {
        clearInterval(timeTop);
        return;
      }
      elem.scrollTop = top -= changeTop;
      if (top <= 0) {
        clearInterval(timeTop);
      }
    }, 10);
  },
});

// 简单的节流函数
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const throttle = (fn: Function, t: number = 500) => {
  let last: number;
  let timer: NodeJS.Timeout;
  const interval = t;
  return function (...args: any[]) {
    const now = Date.now();
    if (last && now - last < interval) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = now;
        fn.apply(fn, args);
      }, interval);
    } else {
      last = now;
      fn.apply(fn, args);
    }
  };
};

const component = reactive({
  getComponentName() {
    return Common;
  },
});
onMounted(() => {
  getData();
  // 如果没有数据，让后台发一份过来
  if (!timeline.timelineData) {
    console.warn("no data, needTimeline");
    newestTimeline.needTimeline();
  }
  window.addEventListener(
    "scroll",
    throttle(scroll.bindHandleScroll, 500),
    true,
  );
  searchTimeline();
  type().then((osType: OsType) => {
    card.osType = osType;
  });
});
</script>

<template>
  <div :ref="setTimeLineRef" class="time-line">
    <div class="fix-btn">
      <v-btn
        :class="
          scroll.scrollShow && timeline.refreshTimelineData
            ? 'refresh-btn-show'
            : ''
        "
        :ripple="false"
        class="refresh-btn"
        color="#ffba4b"
        density="default"
        elevation="0"
        prepend-icon="fas fa-arrows-rotate"
        rounded="xl"
        @click.stop="refreshTimeline"
      >
        <template #prepend>
          <v-icon color="#fff"></v-icon>
        </template>
        <span style="color: #fff">有新饼</span>
      </v-btn>
      <v-btn
        :class="scroll.scrollShow ? 'top-btn-show' : ''"
        class="top-btn"
        color="#ffba4b"
        density="default"
        elevation="0"
        icon="fas fa-arrow-up"
        size="small"
        style="color: #fff"
        @click.stop="scroll.scrollToTop"
      ></v-btn>
    </div>
    <div v-if="!timeline.timelineData" class="loading-image">
      <img :src="getImage('/assets/image/load/list-load.gif')" alt="" />
    </div>
    <v-timeline v-else align="start" side="end" truncate-line="start">
      <v-timeline-item
        v-for="cookie in timeline.timelineData"
        :key="`${cookie.source.type}:${cookie.source.data}:${cookie.item.id}`"
        :left="true"
        dot-color="#fff"
        :fill-dot="true"
        size="50"
      >
        <template #icon>
          <v-avatar :image="cookie.icon" rounded></v-avatar>
        </template>
        <component
          :is="component.getComponentName()"
          :id="`${cookie.source.type}:${cookie.source.data}:${cookie.item.id}`"
          :info="cookie"
          @open-url="card.openUrlInThis"
        >
          <template
            v-if="
              card.isCopyImage &&
              `${cookie.source.type}:${cookie.source.data}:${cookie.item.id}` ===
                card.copyImageId
            "
            #default="info"
          >
            <div class="h-100 w-100 d-flex flex-column">
              <v-divider class="my-2"></v-divider>
              <div
                class="h-100 w-100 d-flex justify-space-between align-center print px-2"
              >
                <div class="d-flex flex-column">
                  <div class="font-weight-bold title">
                    {{ info.info.datasource }}
                  </div>
                  <div class="font-weight-light subtitle">
                    {{
                      new Date(
                        info.info.timestamp.platform ?? 0,
                      ).toLocaleString()
                    }}
                  </div>
                </div>
                <div class="d-flex align-center">
                  <img
                    :src="getImage('/assets/image/logo/icon.png')"
                    width="35"
                    alt=""
                  />
                  <v-divider class="mx-2" vertical></v-divider>
                  <div>
                    <div class="font-weight-bold title">小刻终于吃到饼啦！</div>
                    <div class="font-weight-light subtitle">
                      分享来自小刻食堂
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else #default="info">
            <span class="font-weight-bold pl-2">{{
              new Date(
                info.info.timestamp?.platform ??
                  info.info.timestamp?.fetcher ??
                  "",
              ).toLocaleString()
            }}</span>
            <v-spacer></v-spacer>
            <v-btn
              icon="fas fa-copy"
              size="small"
              title="复制链接"
              @click.stop="card.copy(info.info.item.url ?? '')"
            ></v-btn>
            <v-btn
              icon="fas fa-share-nodes"
              size="small"
              title="生成卡片"
              @click.stop="
                card.copyImage(
                  `${cookie.source.type}:${cookie.source.data}:${cookie.item.id}`,
                )
              "
            ></v-btn>
            <v-btn
              icon="fas fa-link"
              size="small"
              title="使用浏览器打开"
              @click.stop="card.openUrlInBrowser(info.info.item.url)"
            ></v-btn>
          </template>
        </component>
      </v-timeline-item>
    </v-timeline>
    <div v-if="timeline.nextPageId" class="loading-more">
      这是精美的加载动画
    </div>
    <div v-else class="loading-more">没有更多饼了，小刻很满足！！！</div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
.time-line {
  overflow: auto;
  width: 500px;
  min-width: 500px;

  .fix-btn {
    .refresh-btn {
      position: fixed;
      bottom: -40px;
      left: 300px;
      z-index: 1;
      opacity: 1;
      transition: 0.3s all;

      &.refresh-btn-show {
        bottom: 20px;
        opacity: 0.4;

        &:hover {
          opacity: 1;
        }
      }
    }

    .top-btn {
      position: fixed;
      bottom: -40px;
      left: 410px;
      z-index: 1;
      opacity: 1;
      transition: 0.3s all;

      &.top-btn-show {
        bottom: 18px;
        opacity: 0.4;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .loading-image {
    height: calc(100vh - 70px);
    line-height: calc(100vh - 70px);

    img {
      width: 100%;
    }
  }

  .v-timeline {
    grid-template-columns: 8px min-content 8px;

    .v-timeline-item {
      .v-timeline-item__body {
        -webkit-padding-start: 8px !important;
        padding-inline-start: 8px !important;

        .print {
          .title {
            font-size: 16px;
          }

          .subtitle {
            font-size: 12px;
            opacity: var(--v-medium-emphasis-opacity);
          }
        }

        .v-card-title {
          text-shadow: 0 0 5px black;
        }
      }
    }
  }

  .v-timeline--vertical.v-timeline {
    height: auto;
  }

  .loading-more {
    margin-top: 20px;
    margin-bottom: 20px;
    width: 100%;
    text-align: center;
  }
}
</style>

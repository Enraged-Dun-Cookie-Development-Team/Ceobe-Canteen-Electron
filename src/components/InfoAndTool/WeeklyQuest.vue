<script setup name="weeklyQuest" lang="ts">
import { ref, onMounted } from "vue";

import { DateTime } from "luxon";

import ceobeRequest from "@/api/operations/ceobeRequest";
import type { ResourceInfo, Countdown } from "@/api/resourceFetcher/resource";
import { dayInfo, type DayInfo } from "@/constant";
import { getImage } from "@/utils/imageUtil";
import { calcDiff, changeToCCT, numberToWeek } from "@/utils/timeUtil";

const openResources = ref(false);
const resourceInfo = ref<ResourceInfo | null>(null);
const resources = ref<(DayInfo & { notToday?: boolean })[]>([]);
const countdowns = ref<Countdown[]>([]);

const getResourceInfo = () => {
  ceobeRequest.getResourceInfo().then((res) => {
    resourceInfo.value = res.data.data;
    resourcesNotToday();
    calcCountdown();
  });
};

const calcCountdown = () => {
  // 倒计时
  if (!resourceInfo.value) return;
  countdowns.value = resourceInfo.value.countdown.filter(
    (x) =>
      DateTime.fromSQL(x.start_time, { zone: "Asia/Shanghai" }) <=
        DateTime.local() &&
      DateTime.fromSQL(x.over_time, { zone: "Asia/Shanghai" }) >=
        DateTime.local(),
  );
};

// 今天有没有该资源可以刷
const resourcesNotToday = () => {
  const date = changeToCCT(new Date());
  // 如果日期在里面
  if (resourceInfo.value) {
    const starTime = new Date(resourceInfo.value.resources.start_time);
    const overTime = new Date(resourceInfo.value.resources.over_time);
    if (date >= starTime && date <= overTime) {
      resources.value = dayInfo.map((item) => {
        return {
          ...item,
          notToday: false,
        };
      });
      openResources.value = true;
      return;
    }
  }
  // 如果不在里面
  let week = date.getDay();
  // 判断4点更新
  week = date.getHours() >= 4 ? week : week - 1;
  week = week === -1 ? 6 : week;
  resources.value = dayInfo.map((item) => {
    return {
      ...item,
      notToday: !item.day.includes(week),
    };
  });
  openResources.value = false;
};

const calcActivityDiff = (endDate: string) => {
  const diff = calcDiff(
    DateTime.fromSQL(endDate, { zone: "Asia/Shanghai" }).toMillis(),
  );
  return diff ? `剩${diff}` : "已结束";
};

const calcResourceOpenDay = (days: number[]) => {
  return openResources.value
    ? "活动期间，“资源收集”限时全天开放"
    : days.map((x) => numberToWeek(x)).join(",");
};

onMounted(() => {
  getResourceInfo();
});
</script>

<template>
  <div class="weekly-quest flex-column">
    <v-card>
      <v-card-text>
        <div class="d-flex flex-row">
          <div>
            <div v-for="(item, index) in countdowns" :key="index">
              <div>
                距离
                <v-tooltip
                  v-if="item.remark"
                  location="bottom"
                  :text="item.remark"
                >
                  <template #activator="{ props }">
                    <span v-bind="props" class="online-orange cursor-pointer">{{
                      item.text
                    }}</span>
                  </template>
                </v-tooltip>
                <span v-else class="online-orange">{{ item.text }}</span>
                <span title="国服 UTC-8">{{
                  ` ${calcActivityDiff(item.time)}`
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex flex-row justify-space-around mt-2">
          <span v-for="item in resources" :key="item.name">
            <v-tooltip
              location="bottom"
              :text="`${item.name} - 开放日期： ${calcResourceOpenDay(
                item.day,
              )}`"
            >
              <template #activator="{ props }">
                <v-img
                  class="cursor-pointer"
                  :aspect-ratio="1"
                  v-bind="props"
                  :src="getImage(item.src)"
                  width="40"
                  :class="item.notToday ? 'opacity-2' : ''"
                />
              </template>
            </v-tooltip>
          </span>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.weekly-quest {
  width: 100%;
}
</style>

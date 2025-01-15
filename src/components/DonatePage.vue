<script setup name="donate" lang="ts">
import { ref } from "vue";

import operate from "@/api/operations/operate";
import { getImage } from "@/utils/imageUtil";
const emits = defineEmits({
  close: null,
});
const donate = ref<{
  show: boolean;
  list: { img: string; text: string; link?: string }[];
  openUrl(url: string): void;
  close(): void;
}>({
  show: false,
  list: [
    {
      img: "/assets/image/donate/qq.png",
      text: "加群聊天",
      link: "https://jq.qq.com/?_wv=1027&k=EOxqu7FL",
    },
    {
      img: "/assets/image/donate/bilibili.png",
      text: "B站关注/充电",
      link: "https://space.bilibili.com/1723599428",
    },
    {
      img: "/assets/image/donate/wechat.png",
      text: "微信捐助",
    },
    {
      img: "/assets/image/donate/zfb.jpg",
      text: "支付宝捐助",
    },
  ],
  // 查看收支一览表
  openUrl(url: string) {
    if (!url) {
      return;
    }
    operate.openUrlInBrowser(url);
  },
  close() {
    emits("close");
  },
});
</script>

<template>
  <div class="donate">
    <v-card>
      <v-toolbar color="#e6a23c">
        <v-toolbar-title>朴实无华的捐助界面</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          icon="fa-solid fa-xmark"
          @click="donate.close"
        ></v-btn>
      </v-toolbar>
      <v-card-text>
        <div class="text-h5 pa-6">感谢大家对小刻食堂的支持</div>
        未成年刀客塔请勿捐款，三连我们的账号就可以啦。<br />
        如果在收支一览表内没有发现自己的捐助，那就是我们理智涣散，来群里面找我们添加！
        <div class="text-h5">
          由于捐助列表是程序自动生成，捐助的备注一定要以
          <span class="online-yellow">刻</span>
          字开头哦！
        </div>
      </v-card-text>
      <v-card-item>
        <div class="d-flex justify-space-between px-2 pt-2 pb-6">
          <v-hover
            v-for="item in donate.list"
            v-slot="{ isHovering, props }"
            :key="item.text"
          >
            <v-card
              max-width="160"
              v-bind="props"
              :elevation="isHovering ? 12 : 6"
              class="pa-2"
            >
              <v-img width="150px" :src="getImage(item.img)" cover></v-img>
              <v-card-title class="text-center">
                <span v-if="!item.link">{{ item.text }}</span>
                <v-btn
                  v-else
                  variant="text"
                  style="color: #e6a23c"
                  @click="donate.openUrl(item.link)"
                  >{{ item.text }}
                </v-btn>
              </v-card-title>
            </v-card>
          </v-hover>
        </div>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn
          color="#e6a23c"
          @click="donate.openUrl('https://shimo.im/sheets/NJkbEgRmQRtpQ7qR')"
          >查看收支一览表
        </v-btn>
        <v-btn @click="donate.close">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss"></style>

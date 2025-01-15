<script lang="ts" setup>
import { onMounted, ref } from "vue";

import storage from "@/api/operations/localStorage";
import AppMain from "@/view/AppMain.vue";

import AppTop from "./AppTop.vue";

const loadApp = ref(false);

onMounted(async () => {
  const result = await storage.getItem<boolean>("agreeApp");
  if (result) {
    loadApp.value = true;
    return;
  }
  loadApp.value = false;
});
</script>

<template>
  <div class="index">
    <div>
      <app-top></app-top>
      <app-main></app-main>
    </div>
  </div>
</template>

<style lang="scss">
.read-me {
  overflow: auto;
  margin: 0 auto;
  padding: 20px;
  width: 100vw;
  height: 100vh;
  font-family: Arial, sans-serif;
  line-height: 1.6;

  h1,
  h2 {
    text-align: center;
  }

  p {
    margin-bottom: 10px;
  }

  strong {
    font-weight: bold;
  }
}
</style>

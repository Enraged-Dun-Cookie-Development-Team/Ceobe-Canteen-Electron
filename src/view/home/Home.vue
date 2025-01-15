<script setup name="home" lang="ts">
import TimeLine from "./TimeLine.vue";
</script>

<template>
  <div class="home d-flex">
    <time-line class="pt-2"></time-line>
    <keep-alive>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </keep-alive>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.home {
  overflow: hidden;
  min-width: 100vw;
  height: calc(100vh - 60px);

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>

<script setup name="AppMain" lang="ts"></script>

<template>
  <div class="app-main d-flex">
    <keep-alive>
      <transition>
        <router-view />
      </transition>
    </keep-alive>
  </div>
</template>

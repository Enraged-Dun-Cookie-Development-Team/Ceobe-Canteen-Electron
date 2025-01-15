<script lang="ts" setup>
import { ref } from "vue";

const property = defineProps<{
  title?: string;
  subTitle?: string;
}>();

const color = ref("#ffba4b");
</script>

<template>
  <v-card-item>
    <div class="d-flex justify-space-between align-center w-100 pb-2 pr-3 pt-2">
      <slot name="fill-action" :color="color">
        <div>
          <v-card-title>
            <slot name="title">
              {{ property.title }}
            </slot>
          </v-card-title>
          <v-card-subtitle>
            <slot class="" name="sub-title">
              {{ property.subTitle }}
            </slot>
          </v-card-subtitle>
        </div>
        <div>
          <slot id="action-slot" name="action" :color="color">
            <v-checkbox></v-checkbox>
          </slot>
        </div>
      </slot>
    </div>
  </v-card-item>
  <v-divider />
</template>

<style lang="scss" scoped></style>

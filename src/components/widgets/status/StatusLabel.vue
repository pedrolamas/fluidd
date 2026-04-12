<template>
  <v-layout align-center>
    <span
      v-safe-html="label"
      class="label body-2 secondary--text"
      :style="{
        width: $filters.getPixelsString(labelWidth),
        'min-width': $filters.getPixelsString(labelWidth)
      }"
    />
    <span class="value"><slot /></span>
    <span
      v-if="!$slots.default"
      class="value"
    >--</span>
  </v-layout>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  labelWidth?: string | number
}>(), {
  labelWidth: 80
})
</script>

<style lang="scss" scoped>
  .layout {
    margin: 0 0 2px 0;
  }

  span.value {
    > span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>

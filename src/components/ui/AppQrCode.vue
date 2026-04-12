<template>
  <qrcode-vue
    :value="value"
    :size="size"
    level="L"
  />
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

withDefaults(defineProps<{
  value?: string
  size?: number
}>(), {
  value: '',
  size: 260
})
</script>

<style lang="scss" scoped>
  :deep(canvas, svg) {
    display: block;
    padding: 10px;
    background: #fff;
  }
</style>

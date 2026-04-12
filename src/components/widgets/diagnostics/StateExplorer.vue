<template>
  <json-viewer
    :value="state"
    :expand-depth="2"
    :class="$vuetify.theme.dark ? 'jv-dark' : ''"
    sort
    @keyclick="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonViewer from 'vue-json-viewer'
import { useStore } from '@/composables/useStore'

const { typedState } = useStore()

const emit = defineEmits<{ (e: 'input', path: string): void }>()

const state = computed(() => ({ printer: typedState.printer.printer }))

function handleClick (path: string) {
  const sanitizedPath = path
    .replace('$.', '')
    .replace(/\.(\w*\s+\w*)/g, (_, match) => {
      if (isNaN(match)) return `['${match}']`
      return `[${match}]`
    })
  emit('input', sanitizedPath)
}
</script>

<style lang="scss">
.jv-container>.jv-code {
  padding: 0 !important;
}

.jv-container.jv-dark {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;

  .jv-item.jv-object { color: rgba(255, 255, 255, 0.8) !important; }
  .jv-item.jv-array { color: rgba(255, 255, 255, 0.8) !important; }
  .jv-key { color: rgba(255, 255, 255, 0.8) !important; }

  .jv-ellipsis {
    color: rgba(255, 255, 255, 0.5) !important;
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}
</style>

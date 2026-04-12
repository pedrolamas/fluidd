<template>
  <v-snackbar
    v-model="open"
    :color="type"
    :timeout="timeout"
    elevation="24"
    multi-line
    top
    centered
  >
    <span v-safe-html="text" />

    <template #action="{ attrs }">
      <app-btn
        dark
        v-bind="attrs"
        @click="open = false"
      >
        {{ $t('app.general.btn.close') }}
      </app-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  value?: boolean
  type?: string
  text?: string
  timeout?: number
}>(), {
  type: 'dark',
  text: 'Saved!',
  timeout: 1500
})

const emit = defineEmits<{
  (e: 'input', value: boolean | undefined): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v)
})
</script>

<style lang="scss" scoped>
  :deep(.v-snack__wrapper .v-snack__content) {
    overflow: hidden;
    overflow-wrap: break-word;
  }
</style>

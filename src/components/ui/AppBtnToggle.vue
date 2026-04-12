<template>
  <v-btn-toggle
    v-model="inputValue"
    :class="{
      'elevation-2': !disabled
    }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </v-btn-toggle>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  value?: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: unknown): void
}>()

const inputValue = computed({
  get: () => props.value,
  set: (v: unknown) => emit('input', v)
})
</script>

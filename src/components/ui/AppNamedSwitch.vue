<template>
  <v-layout
    justify-space-between
    align-center
  >
    <div
      v-safe-html="label"
      class="text-body-1"
      :class="{ 'text--disabled': disabled }"
    />
    <v-switch
      v-model="inputValue"
      class="mt-0"
      :disabled="disabled || loading"
      hide-details
      v-bind="$attrs"
      v-on="$listeners"
    />
  </v-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  value?: boolean
  label: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean | undefined): void
}>()

const inputValue = computed({
  get: () => props.value,
  set: (v: boolean | undefined) => emit('input', v)
})
</script>

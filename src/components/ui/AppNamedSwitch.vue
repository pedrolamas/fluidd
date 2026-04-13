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

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
  disabled?: boolean
  loading?: boolean
}>()

const { modelValue: inputValue } = defineModels<{ modelValue?: boolean }>()
</script>

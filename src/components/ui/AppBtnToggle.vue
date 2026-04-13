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

defineOptions({ inheritAttrs: false })

defineProps<{
  disabled?: boolean
}>()

const { modelValue: inputValue } = defineModels<{ modelValue?: unknown }>()
</script>

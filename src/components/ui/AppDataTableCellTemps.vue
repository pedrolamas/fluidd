<template>
  <div>
    <v-chip
      v-for="(temp, index) in temps"
      :key="index"
      :class="{
        'ms-1': index > 0
      }"
      small
      v-bind="$attrs"
      v-on="$listeners"
    >
      {{ temp }}<small>°C</small>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  temps: string[]
}>()
</script>

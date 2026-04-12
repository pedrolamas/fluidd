<template>
  <div>
    <v-tooltip
      v-for="(color, index) in colors"
      :key="index"
      top
    >
      <template #activator="{ on, attrs }">
        <app-chip-color
          :color="color"
          :class="{
            'ms-1': index > 0
          }"
          v-bind="{...$attrs, ...attrs}"
          v-on="{...$listeners, ...on }"
        />
      </template>
      <span>{{ color }}</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  colors: string[]
}>()
</script>

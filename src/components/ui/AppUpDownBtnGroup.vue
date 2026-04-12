<template>
  <app-btn-group>
    <app-btn
      v-for="value in valuesDown"
      :key="`l${value}`"
      :color="color"
      :disabled="disabled"
      class="value"
      @click="$emit('click', -value)"
    >
      -{{ value }}
    </app-btn>

    <slot />

    <app-btn
      v-for="value in valuesUp"
      :key="`r${value}`"
      :color="color"
      :disabled="disabled"
      class="value"
      @click="$emit('click', value)"
    >
      +{{ value }}
    </app-btn>
  </app-btn-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  values: number[]
  color?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click', value: number): void
}>()

const valuesDown = computed(() => [...props.values].sort((a, b) => b - a))
const valuesUp = computed(() => [...props.values].sort((a, b) => a - b))
</script>

<style lang="scss" scoped>
  .v-btn.value {
    min-width: 44px;
    padding: 0px;
  }
</style>

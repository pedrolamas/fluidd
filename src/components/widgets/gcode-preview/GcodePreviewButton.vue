<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        icon
        small
        tabindex="-1"
        :disabled="disabled"
        :color="inputValue ? 'primary' : undefined"
        :retain-focus-on-click="!isMobileViewport"
        v-on="on"
        @click="inputValue = !inputValue"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'

const props = defineProps<{
  modelValue?: boolean
  icon: string
  tooltip: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const { isMobileViewport } = useBrowserMixin()

const inputValue = computed({
  get: () => props.modelValue ?? false,
  set: (v) => emit('input', v)
})
</script>

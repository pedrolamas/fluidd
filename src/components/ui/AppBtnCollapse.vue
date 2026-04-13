<template>
  <div>
    <!-- Expand / Contract -->
    <app-btn
      v-if="!inLayout"
      icon
      @click="collapsedModel = !collapsedModel"
    >
      <v-icon
        dense
        :class="{ 'rotate-180': collapsedModel }"
      >
        $chevronUp
      </v-icon>
    </app-btn>

    <!-- In layout -->
    <v-layout v-if="inLayout">
      <v-checkbox
        v-model="enabledModel"
        hide-details
        class="mt-0 pt-0"
      />
      <app-drag-icon class="ms-1" />
    </v-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  enabled?: boolean
  inLayout?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:enabled', value: boolean | undefined): void
}>()

const { collapsed: collapsedModel } = defineModels<{
  collapsed?: boolean
}>()

const enabledModel = computed({
  get: () => props.enabled ?? true,
  set: (v) => emit('update:enabled', v)
})
</script>

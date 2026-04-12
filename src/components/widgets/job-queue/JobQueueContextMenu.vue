<template>
  <v-menu
    v-model="open"
    transition="slide-y-transition"
    :position-x="positionX"
    :position-y="positionY"
    min-width="180"
    absolute
    right
  >
    <v-list dense>
      <v-list-item @click="$emit('multiply', job)">
        <v-list-item-icon>
          <v-icon>
            $duplicate
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.btn.multiply') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="$emit('remove', job)">
        <v-list-item-icon>
          <v-icon>
            $delete
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.btn.remove') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value?: boolean
  positionX: number
  positionY: number
  job: Moonraker.JobQueue.QueuedJob | Moonraker.JobQueue.QueuedJob[]
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'multiply', job: Moonraker.JobQueue.QueuedJob | Moonraker.JobQueue.QueuedJob[]): void
  (e: 'remove', job: Moonraker.JobQueue.QueuedJob | Moonraker.JobQueue.QueuedJob[]): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v ?? false)
})
</script>

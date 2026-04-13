<template>
  <v-tooltip top>
    <template #activator="{ on, attrs }">
      <v-icon
        v-bind="attrs"
        small
        :color="(job.exists) ? state : 'secondary'"
        class="mr-1"
        v-on="on"
      >
        {{ icon }}
      </v-icon>
    </template>
    <span>{{ $filters.prettyCase(job.status) }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HistoryItem } from '@/store/history/types'

type JobHistoryItemState = 'error' | 'warning' | 'success' | 'info'

const props = defineProps<{
  job: HistoryItem
}>()

const icon = computed(() => {
  switch (props.job.status) {
    case 'completed':
      return '$checkedCircle'

    case 'printing':
    case 'in_progress':
      return '$inProgress'

    case 'cancelled':
    case 'interrupted':
      return '$cancelled'

    default:
      return '$warning'
  }
})

const state = computed((): JobHistoryItemState => {
  switch (props.job.status) {
    case 'cancelled':
    case 'error':
    case 'interrupted':
    case 'server_exit':
      return 'error'

    case 'klippy_shutdown':
    case 'klippy_disconnect':
      return 'warning'

    case 'completed':
      return 'success'

    case 'printing':
    case 'in_progress':
      return 'info'

    default:
      return 'success'
  }
})
</script>

<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col
      cols="12"
      :lg="hasQueuedJobs ? 8 : undefined"
    >
      <jobs-card fullscreen />
    </v-col>
    <v-col
      v-if="hasQueuedJobs"
      cols="12"
      lg="4"
    >
      <job-queue-card fullscreen />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JobsCard from '@/components/widgets/jobs/JobsCard.vue'
import JobQueueCard from '@/components/widgets/job-queue/JobQueueCard.vue'
import { useStore } from '@/composables/useStore'

const { typedState, typedGetters } = useStore()

const supportsJobQueue = computed<boolean>(() => typedGetters['server/componentSupport']('job_queue'))

const hasQueuedJobs = computed(() =>
  supportsJobQueue.value && typedState.jobQueue.queuedJobs.length > 0
)
</script>

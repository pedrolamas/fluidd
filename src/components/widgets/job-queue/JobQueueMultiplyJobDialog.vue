<template>
  <app-dialog
    v-model="open"
    :title="$tc('app.job_queue.title.multiply_job', jobCount)"
    max-width="320"
    @save="handleSave"
  >
    <v-card-text>
      <v-text-field
        v-model.number="copies"
        autofocus
        outlined
        :label="$t('app.job_queue.label.number_of_copies')"
        :rules="[
          $rules.required,
          $rules.numberValid,
          $rules.numberGreaterThanOrEqual(1)
        ]"
        required
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  value?: boolean
  job: Moonraker.JobQueue.QueuedJob | Moonraker.JobQueue.QueuedJob[]
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'save', job: Moonraker.JobQueue.QueuedJob | Moonraker.JobQueue.QueuedJob[], copies: number): void
}>()

const copies = ref(1)

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v ?? false)
})

const jobCount = computed(() =>
  Array.isArray(props.job) ? props.job.length : 1
)

const handleSave = () => {
  emit('save', props.job, copies.value)
  open.value = false
}
</script>

<template>
  <div class="file-system">
    <app-draggable
      v-model="jobsWithKey"
      :options="{
        group: 'jobQueue',
      }"
      target="tbody"
    >
      <v-data-table
        v-model="selected"
        item-key="key"
        :headers="headers"
        :items="jobsWithKey"
        :dense="dense"
        :loading="hasWait($waits.onJobQueue)"
        :show-select="bulkActions"
        :no-data-text="$t('app.file_system.msg.not_found')"
        :no-results-text="$t('app.file_system.msg.not_found')"
        height="100%"
        mobile-breakpoint="0"
        hide-default-footer
        disable-pagination
        disable-sort
        fixed-header
      >
        <template #item="{ headers: rowHeaders, item, isSelected, select }">
          <app-data-table-row
            :key="item.key"
            :headers="rowHeaders"
            :item="item"
            :is-selected="isSelected"
            :class="{
              'v-data-table__inactive': item.file == null
            }"
            @click.prevent="$emit('row-click', item, $event)"
            @contextmenu.prevent="$emit('row-click', item, $event)"
          >
            <template #[`item.data-table-select`]>
              <v-simple-checkbox
                :value="isSelected"
                class="mt-1"
                @click.stop="select(!isSelected)"
              />
            </template>

            <template #[`item.handle`]>
              <app-drag-icon :disabled="jobTotals.withoutFile > 0" />
            </template>

            <template #[`item.data-table-icons`]>
              <v-layout
                justify-center
                class="no-pointer-events"
              >
                <v-icon
                  v-if="item.file == null"
                  :small="dense"
                  color="grey"
                >
                  $fileCancel
                </v-icon>
                <v-icon
                  v-else-if="!item.file.thumbnails?.length"
                  :small="dense"
                  color="grey"
                >
                  $file
                </v-icon>
                <img
                  v-else
                  class="file-icon-thumb"
                  :style="{
                    'max-width': `${thumbnailSize}px`,
                    'max-height': `${thumbnailSize}px`
                  }"
                  :src="getThumbUrl(item.file, 'gcodes', getFilePaths(item.filename).path, thumbnailSize > 16, item.file.modified)"
                >
              </v-layout>
            </template>

            <template #[`item.filename`]="{ value }">
              {{ value }}
            </template>

            <template #[`item.time_added`]="{ value }">
              {{ $filters.formatAbsoluteDateTime(value * 1000) }}
            </template>

            <template #[`item.time_in_queue`]="{ value }">
              {{ $filters.formatCounterSeconds(value) }}
            </template>
          </app-data-table-row>
        </template>

        <template #footer>
          <div class="v-data-footer px-3 py-1">
            <v-chip
              v-if="jobTotals.withoutFile > 0"
              small
              class="ma-1"
              color="warning"
            >
              {{ $t('app.job_queue.label.unknown_jobs') }}: {{ jobTotals.withoutFile }}
            </v-chip>

            <v-chip
              small
              class="ma-1"
            >
              {{ $t('app.job_queue.label.filament') }}: {{ $filters.getReadableLengthString(jobTotals.filamentLength) }} / {{ $filters.getReadableWeightString(jobTotals.filamentWeight) }}
            </v-chip>
            <v-chip
              small
              class="ma-1"
            >
              {{ $t('app.job_queue.label.print_time') }}: {{ $filters.formatCounterSeconds(jobTotals.time) }}
            </v-chip>

            <v-chip
              small
              class="ma-1"
            >
              {{ $t('app.job_queue.label.eta') }}: {{ $filters.formatAbsoluteDateTime(eta) }}
            </v-chip>
          </div>
        </template>
      </v-data-table>
    </app-draggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QueuedJobWithAppFile } from '@/store/jobQueue/types'
import { SocketActions } from '@/api/socketActions'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useStore } from '@/composables/useStore'
import type { DataTableHeader } from 'vuetify'
import getFilePathsUtil from '@/util/get-file-paths'
import type { TimeEstimates } from '@/store/printer/types'

type JobTotals = {
  filamentLength: number,
  filamentWeight: number,
  time: number,
  withoutFile: number
}

type QueueJobWithKey = QueuedJobWithAppFile & {
  key: string
}

const props = defineProps<{
  modelValue?: QueuedJobWithAppFile[]
  jobs: QueuedJobWithAppFile[]
  dense?: boolean
  bulkActions?: boolean
  headers: DataTableHeader[]
}>()

const emit = defineEmits<{
  (e: 'input', value: QueuedJobWithAppFile[]): void
  (e: 'row-click', item: QueuedJobWithAppFile, event: MouseEvent): void
}>()

const { printerPrinting, printerPaused, hasWait } = useStateMixin()
const { getThumbUrl } = useFilesMixin()
const { typedState, typedGetters } = useStore()

const selected = computed({
  get: () => props.modelValue ?? [],
  set: (v) => emit('input', v)
})

const jobsWithKey = computed({
  get: (): QueueJobWithKey[] => {
    const refresh = Date.now()

    return props.jobs
      .map(job => ({
        ...job,
        key: `${job.job_id}-${refresh}`
      }))
  },
  set: (value: QueueJobWithKey[]) => {
    const filenames = value
      .map(job => job.filename)

    if (typedGetters['server/getIsMinApiVersion']('1.1.0')) {
      SocketActions.serverJobQueuePostJob(filenames, true)
    } else {
      SocketActions.serverJobQueueDeleteJobs(['all'])
      SocketActions.serverJobQueuePostJob(filenames)
    }
  }
})

const jobTotals = computed((): JobTotals => {
  return props.jobs.reduce<JobTotals>((totals, job) => {
    if (job.file) {
      if ('filament_total' in job.file) {
        totals.filamentLength += job.file.filament_total ?? 0
      }

      if ('filament_weight_total' in job.file) {
        totals.filamentWeight += job.file.filament_weight_total ?? 0
      }

      if ('estimated_time' in job.file) {
        totals.time += job.file.estimated_time ?? 0
      }
    } else {
      totals.withoutFile++
    }

    return totals
  }, { filamentLength: 0, filamentWeight: 0, time: 0, withoutFile: 0 })
})

const thumbnailSize = computed(() => {
  const size: number = typedState.config.uiSettings.thumbnailSizes.jobQueue ?? 32

  return props.dense ? size / 2 : size
})

const estimates = computed((): TimeEstimates => typedGetters['printer/getTimeEstimates'])

const eta = computed(() => {
  const base = printerPrinting.value || printerPaused.value
    ? estimates.value.eta
    : Date.now()

  return base + jobTotals.value.time * 1000
})

function getFilePaths (filename: string) {
  return getFilePathsUtil(filename, 'gcodes')
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  // Lighten up dark mode checkboxes.
  .theme--dark :deep(.v-simple-checkbox .v-icon) {
    color: rgba(map-deep-get($material-dark, 'inputs', 'box'), 0.25);
  }
</style>

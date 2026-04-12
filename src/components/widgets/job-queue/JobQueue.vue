<template>
  <v-card
    class="filesystem-wrapper"
    :class="{ 'no-pointer-events': overlay }"
    flat
    @dragover="handleDragOver"
    @dragenter.self.prevent
    @dragleave.self.prevent="handleDragLeave"
    @drop.self.prevent="handleDrop"
  >
    <job-queue-toolbar
      v-if="selected.length === 0"
      :headers="configurableHeaders"
      @remove-all="handleRemoveAll"
      @refresh="handleRefresh"
    />

    <job-queue-bulk-actions
      v-else
      @remove="handleRemove(selected)"
      @multiply="handleMultiplyDialog(selected)"
    />

    <job-queue-browser
      v-model="selected"
      :jobs="jobs"
      :headers="headers"
      :dense="dense"
      :bulk-actions="bulkActions"
      @row-click="handleRowClick"
    />

    <app-drag-overlay
      v-model="overlay"
      :message="$t('app.file_system.overlay.drag_files_enqueue')"
      icon="$enqueueJob"
      absolute
    />

    <job-queue-context-menu
      v-if="contextMenuState.open"
      v-model="contextMenuState.open"
      :job="contextMenuState.job"
      :position-x="contextMenuState.x"
      :position-y="contextMenuState.y"
      @remove="handleRemove"
      @multiply="handleMultiplyDialog"
    />

    <job-queue-multiply-job-dialog
      v-if="multiplyJobDialogState.open"
      v-model="multiplyJobDialogState.open"
      :job="multiplyJobDialogState.job"
      @save="handleMultiply"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { SocketActions } from '@/api/socketActions'
import type { QueuedJobWithAppFile } from '@/store/jobQueue/types'
import JobQueueToolbar from './JobQueueToolbar.vue'
import JobQueueBulkActions from './JobQueueBulkActions.vue'
import JobQueueBrowser from './JobQueueBrowser.vue'
import JobQueueContextMenu from './JobQueueContextMenu.vue'
import JobQueueMultiplyJobDialog from './JobQueueMultiplyJobDialog.vue'
import type { AppDataTableHeader } from '@/types'
import { getFileDataTransferDataFromDataTransfer, hasFileDataTransferTypeInDataTransfer } from '@/util/file-data-transfer'
import type { DataTableHeader } from 'vuetify'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  dense?: boolean
  bulkActions?: boolean
}>()

const { typedGetters } = useStore()
const confirm = useConfirm()
const { tc } = useI18n()

const contextMenuState = ref<any>({
  open: false,
  x: 0,
  y: 0,
  job: null
})

const multiplyJobDialogState = ref<any>({
  open: false,
  job: null
})

const selected = ref<QueuedJobWithAppFile[]>([])
const overlay = ref(false)

const jobs = computed((): QueuedJobWithAppFile[] => typedGetters['jobQueue/getQueuedJobsWithFiles'])

watch(jobs, () => {
  selected.value = []
})

const configurableHeaders = computed((): AppDataTableHeader[] => {
  const headers: AppDataTableHeader[] = [
    {
      text: tc('app.general.table.header.time_added'),
      value: 'time_added',
      sortable: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.general.table.header.time_in_queue'),
      value: 'time_in_queue',
      visible: false,
      sortable: false,
      cellClass: 'text-no-wrap'
    }
  ]

  const mergedTableHeaders: AppDataTableHeader[] = typedGetters['config/getMergedTableHeaders'](headers, 'job_queue')

  return mergedTableHeaders
})

const headers = computed((): DataTableHeader[] => [
  {
    text: '',
    value: 'handle',
    sortable: false,
    width: 24
  },
  {
    text: '',
    value: 'data-table-icons',
    sortable: false,
    width: props.dense ? 28 : 56
  },
  {
    text: tc('app.general.table.header.name'),
    value: 'filename',
    sortable: false
  },
  ...configurableHeaders.value
    .filter(header => header.visible !== false)
])

function handleRowClick (item: QueuedJobWithAppFile, event: MouseEvent) {
  if (contextMenuState.value.open) {
    contextMenuState.value.open = false

    if (event.type !== 'contextmenu') {
      return
    }
  }

  if (
    selected.value.length !== 0 &&
    !selected.value.some(x => x.filename === item.filename)
  ) {
    return
  }

  // Open the context menu
  contextMenuState.value.x = event.clientX
  contextMenuState.value.y = event.clientY
  contextMenuState.value.job = selected.value.length > 1
    ? selected.value
    : item
  nextTick(() => {
    contextMenuState.value.open = true
  })
}

async function handleRemoveAll () {
  const result = await confirm(
    tc('app.job_queue.msg.confirm'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    SocketActions.serverJobQueueDeleteJobs(['all'])
  }
}

function handleRefresh () {
  SocketActions.serverJobQueueStatus()
}

function handleRemove (jobs: QueuedJobWithAppFile | QueuedJobWithAppFile[]) {
  const jobIds = Array.isArray(jobs)
    ? jobs.map(job => job.job_id)
    : [jobs.job_id]

  SocketActions.serverJobQueueDeleteJobs(jobIds)
}

function handleMultiplyDialog (jobs: QueuedJobWithAppFile | QueuedJobWithAppFile[]) {
  multiplyJobDialogState.value = {
    open: true,
    job: jobs
  }
}

function handleMultiply (jobs: QueuedJobWithAppFile | QueuedJobWithAppFile[], copies: number) {
  const filenames = Array.isArray(jobs)
    ? jobs.map(job => job.filename)
    : [jobs.filename]

  const multipliedFilenames = Array.from({ length: copies })
    .flatMap(() => filenames)

  SocketActions.serverJobQueuePostJob(multipliedFilenames)
}

function handleDragOver (event: DragEvent) {
  if (
    event.dataTransfer &&
    hasFileDataTransferTypeInDataTransfer(event.dataTransfer, 'jobs')
  ) {
    event.preventDefault()

    event.dataTransfer.dropEffect = 'link'

    overlay.value = true
  }
}

function handleDragLeave () {
  overlay.value = false
}

function handleDrop (event: DragEvent) {
  overlay.value = false

  if (
    event.dataTransfer &&
    hasFileDataTransferTypeInDataTransfer(event.dataTransfer, 'jobs')
  ) {
    const files = getFileDataTransferDataFromDataTransfer(event.dataTransfer, 'jobs')
    const filePath = files.path ? `${files.path}/` : ''
    const filenames = files.items
      .map(file => `${filePath}${file}`)

    SocketActions.serverJobQueuePostJob(filenames)
  }
}
</script>

<style lang="scss" scoped>
  .filesystem-wrapper,
  .file-system,
  .file-system :deep(.app-draggable),
  .file-system :deep(.v-data-table) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
</style>

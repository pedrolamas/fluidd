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
    <v-card>
      <v-row
        align="center"
        justify="center"
        no-gutters
      >
        <v-col>
          <v-list dense>
            <v-list-item
              v-if="canPrint"
              :disabled="!printerReady"
              @click="$emit('print', file)"
            >
              <v-list-item-icon>
                <v-icon>
                  $printer
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.print') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canAddToQueue"
              @click="$emit('enqueue', file)"
            >
              <v-list-item-icon>
                <v-icon>$enqueueJob</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t("app.general.btn.add_to_queue") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canPreheat"
              :disabled="!printerReady"
              @click="$emit('preheat', file)"
            >
              <v-list-item-icon>
                <v-icon>
                  $fire
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.preheat') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canView"
              @click="$emit('view', file)"
            >
              <v-list-item-icon>
                <v-icon>$open</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.view') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canEdit"
              @click="$emit('edit', file)"
            >
              <v-list-item-icon>
                <v-icon>$pencil</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.edit') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canRefreshMetadata"
              @click="$emit('refresh-metadata', file)"
            >
              <v-list-item-icon>
                <v-icon>$sync</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.refresh_metadata') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canPerformTimeAnalysys"
              @click="$emit('perform-time-analysis', file)"
            >
              <v-list-item-icon>
                <v-icon>$stopwatch</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.perform_time_analysis') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canPreviewGcode"
              @click="$emit('preview-gcode', file)"
            >
              <v-list-item-icon>
                <v-icon>$cubeScan</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.preview_gcode') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="canCreateZip"
              @click="$emit('create-zip', file)"
            >
              <v-list-item-icon>
                <v-icon>$fileZipAdd</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.create_zip_archive') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="!Array.isArray(file) && file.type !== 'directory'"
              @click="$emit('download', file)"
            >
              <v-list-item-icon>
                <v-icon>$download</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.download') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="!Array.isArray(file) && !rootProperties.readonly"
              @click="$emit('rename', file)"
            >
              <v-list-item-icon>
                <v-icon>$rename</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.rename') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="!Array.isArray(file) && !rootProperties.readonly"
              @click="$emit('duplicate', file)"
            >
              <v-list-item-icon>
                <v-icon>$duplicate</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.duplicate') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="!rootProperties.readonly"
              @click="$emit('remove', file)"
            >
              <v-list-item-icon>
                <v-icon>$delete</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ $t('app.general.btn.remove') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col
          v-if="'thumbnails' in file && file.thumbnails && file.thumbnails.length"
          class="px-2 d-none d-sm-flex"
        >
          <v-btn
            text
            height="100%"
            class="no-pointer-events"
            @click="$emit('view-thumbnail', file)"
          >
            <img
              class="mx-2"
              :src="getThumbUrl(file, root, file.path, true, file.modified)"
              :height="150"
            >
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import type { FileBrowserEntry, RootProperties } from '@/store/files/types'

/**
 * NOTE: Generally, moonraker expects the paths to include the root.
 */
const props = defineProps<{
  root: string
  file: FileBrowserEntry | FileBrowserEntry[]
  positionX: number
  positionY: number
}>()

defineEmits<{
  (e: 'print', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'enqueue', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'preheat', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'view', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'edit', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'refresh-metadata', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'perform-time-analysis', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'preview-gcode', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'create-zip', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'download', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'rename', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'duplicate', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'remove', file: FileBrowserEntry | FileBrowserEntry[]): void
  (e: 'view-thumbnail', file: FileBrowserEntry | FileBrowserEntry[]): void
}>()

const { printerPrinting, printerPaused, klippyReady } = useStateMixin()
const { getThumbUrl } = useFilesMixin()
const { typedGetters } = useStore()

const { modelValue: open } = defineModels<{ modelValue: boolean }>()

const rootProperties = computed<RootProperties>(() =>
  typedGetters['files/getRootProperties'](props.root)
)

const canPrint = computed(() =>
  props.root === 'gcodes' &&
  !Array.isArray(props.file) &&
  props.file.type !== 'directory' &&
  rootProperties.value.accepts.includes(props.file.extension)
)

const canEdit = computed(() =>
  !Array.isArray(props.file) &&
  props.file.type !== 'directory' &&
  (
    props.file.permissions === undefined ||
    props.file.permissions.includes('r')
  )
)

const canView = computed(() =>
  !Array.isArray(props.file) &&
  props.file.type !== 'directory' &&
  rootProperties.value.canView.includes(props.file.extension) &&
  (
    props.file.permissions === undefined ||
    props.file.permissions.includes('r')
  )
)

const canPreheat = computed(() =>
  props.root === 'gcodes' &&
  !Array.isArray(props.file) &&
  'first_layer_extr_temp' in props.file &&
  'first_layer_bed_temp' in props.file
)

const printerReady = computed(() =>
  !printerPrinting.value &&
  !printerPaused.value &&
  klippyReady.value
)

const canPreviewGcode = computed(() =>
  props.root === 'gcodes' &&
  !Array.isArray(props.file) &&
  props.file.type === 'file' &&
  props.file.extension === '.gcode'
)

const canCreateZip = computed(() =>
  (
    Array.isArray(props.file) ||
    props.file.type !== 'file' ||
    props.file.extension !== '.zip'
  ) &&
  !rootProperties.value.readonly &&
  typedGetters['server/getIsMinApiVersion']('1.1.0')
)

const isGcodesRootWithAcceptedFiles = computed(() => {
  const files = Array.isArray(props.file) ? props.file : [props.file]

  return (
    props.root === 'gcodes' &&
    files.some(x =>
      x.type !== 'directory' &&
      rootProperties.value.accepts.includes(x.extension)
    )
  )
})

const canAddToQueue = computed(() =>
  isGcodesRootWithAcceptedFiles.value &&
  typedGetters['server/componentSupport']('job_queue')
)

const canRefreshMetadata = computed(() =>
  isGcodesRootWithAcceptedFiles.value
)

const canPerformTimeAnalysys = computed(() =>
  isGcodesRootWithAcceptedFiles.value &&
  typedGetters['server/componentSupport']('analysis')
)
</script>

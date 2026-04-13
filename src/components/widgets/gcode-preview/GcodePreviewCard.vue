<template>
  <collapsable-card
    :title="$tc('app.general.title.gcode_preview')"
    icon="$cubeScan"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.gcode-preview-card"
  >
    <template #menu>
      <app-btn-collapse-group :collapsed="narrow">
        <app-btn
          :disabled="!printerFile || printerFileLoaded"
          small
          class="my-1"
          :class="{
            'me-1': !fullscreen
          }"
          @click="loadCurrent"
        >
          {{ $t('app.gcode.btn.load_current_file') }}
        </app-btn>

        <app-btn
          v-if="!fullscreen"
          icon
          @click="$filters.routeTo({ name: 'gcode_preview' })"
        >
          <v-icon dense>
            $fullScreen
          </v-icon>
        </app-btn>
      </app-btn-collapse-group>
    </template>

    <v-card-text
      :class="{ 'no-pointer-events': overlay }"
      @dragover="handleDragOver"
      @dragenter.self.prevent
      @dragleave.self.prevent="handleDragLeave"
      @drop.self.prevent="handleDrop"
    >
      <gcode-preview-parser-progress-dialog
        v-if="showParserProgressDialog"
        :value="showParserProgressDialog"
        :progress="parserProgress"
        :file="parserFile"
        @cancel="abortParser"
      />

      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-row>
            <v-col>
              <app-named-slider
                :label="$t('app.gcode.label.layer')"
                :value="(!fileLoaded) ? 0 : currentLayer + 1"
                :min="(!fileLoaded) ? 0 : 1"
                :max="layerCount"
                :disabled="!fileLoaded"
                @input="setCurrentLayer($event - 1)"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <app-named-slider
                :label="$t('app.general.label.progress')"
                :value="moveProgress - currentLayerMoveRange.min"
                :min="0"
                :max="currentLayerMoveRange.max - currentLayerMoveRange.min"
                :disabled="!fileLoaded"
                @input="setMoveProgress($event + currentLayerMoveRange.min)"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-row>
            <v-col>
              <v-card
                outlined
                class="px-2 py-1 text-center stat-square justify-center"
                :class="{ 'text--disabled': !fileLoaded }"
              >
                <div class="">
                  {{ $t('app.gcode.label.layers') }}
                </div>
                <div class="focus--text">
                  {{ layerCount }}
                </div>
                <div class="">
                  {{ $t('app.gcode.label.current_layer_height') }}
                </div>
                <div class="focus--text">
                  {{ currentLayerHeight }}
                </div>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <app-btn
                :disabled="!fileLoaded"
                block
                @click="resetFile"
              >
                {{ $t('app.general.btn.reset_file') }}
              </app-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <gcode-preview
            ref="preview"
            :layer="currentLayer"
            :progress="moveProgress"
            :disabled="!fileLoaded"
            @cancelObject="cancelObject($event)"
          />
        </v-col>
      </v-row>

      <app-drag-overlay
        v-model="overlay"
        :message="$t('app.gcode.overlay.drag_file_load')"
        icon="$cubeScan"
        absolute
      />
    </v-card-text>
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import GcodePreview from './GcodePreview.vue'
import GcodePreviewParserProgressDialog from './GcodePreviewParserProgressDialog.vue'
import type { AppFile, AppFileWithMeta } from '@/store/files/types'
import type { Layer, MinMax, Move } from '@/store/gcodePreview/types'
import { getFileDataTransferDataFromDataTransfer, hasFileDataTransferTypeInDataTransfer } from '@/util/file-data-transfer'
import { consola } from 'consola'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

defineProps<{
  narrow?: boolean
  fullscreen?: boolean
}>()

const { printerState, sendGcode } = useStateMixin()
const { getGcode } = useFilesMixin()
const { isMobileViewport } = useBrowserMixin()
const { typedState, typedGetters, typedDispatch } = useStore()
const confirm = useConfirm()
const { tc } = useI18n()

const preview = ref<InstanceType<typeof GcodePreview>>()
const currentLayer = ref(0)
const moveProgress = ref(0)
const overlay = ref(false)

const file = computed((): AppFile | AppFileWithMeta | null => typedState.gcodePreview.file)
// Non-null version used for dialog (only rendered when file != null via v-if guard)
const parserFile = computed<AppFile>(() => file.value as AppFile)
const moves = computed((): readonly Move[] => typedState.gcodePreview.moves)
const fileLoaded = computed(() => moves.value.length > 0)
const parserProgress = computed(() => typedState.gcodePreview.parserProgress)
const showParserProgressDialog = computed(() => file.value != null && parserProgress.value !== file.value.size)
const filePosition = computed(() => typedState.printer.printer.virtual_sdcard?.file_position ?? 0)
const fileProgressLayerNr = computed(() => typedGetters['gcodePreview/getLayerNrByFilePosition'](filePosition.value))
const layerCount = computed(() => typedGetters['gcodePreview/getLayers'].length)
const currentLayerHeight = computed(() => typedGetters['gcodePreview/getLayers'][currentLayer.value]?.z ?? 0)

const followProgress = computed({
  get: () => typedState.config.uiSettings.gcodePreview.followProgress,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.gcodePreview.followProgress',
      value,
      server: true
    })
  }
})

const currentLayerMoveRange = computed((): MinMax => {
  const m = moves.value

  if (m.length === 0) {
    return { min: 0, max: 0 }
  }

  const layers: readonly Layer[] = typedGetters['gcodePreview/getLayers']

  return {
    min: layers[currentLayer.value].move,
    max: layers[currentLayer.value + 1]?.move ?? m.length - 1
  }
})

const printerFile = computed((): AppFileWithMeta | undefined => typedGetters['printer/getPrinterFile'])

const printerFileLoaded = computed(() => {
  const f = file.value
  const pf = printerFile.value

  return !(
    f == null ||
    pf == null ||
    f.path !== pf.path ||
    f.filename !== pf.filename
  )
})

watch(printerFileLoaded, (loaded) => {
  if (!loaded && followProgress.value) {
    followProgress.value = false
  }
})

const autoLoadOnPrintStart = computed(() => {
  if (isMobileViewport.value) {
    return typedState.config.uiSettings.gcodePreview.autoLoadMobileOnPrintStart
  }

  return typedState.config.uiSettings.gcodePreview.autoLoadOnPrintStart
})

watch(layerCount, () => {
  currentLayer.value = 0
})

watch(followProgress, (value) => {
  if (value) {
    currentLayer.value = fileProgressLayerNr.value
    syncMoveProgress()
  }
})

watch(currentLayer, () => {
  if (followProgress.value && currentLayer.value !== fileProgressLayerNr.value) {
    followProgress.value = false
  }

  if (!followProgress.value) {
    moveProgress.value = currentLayerMoveRange.value.max
  }
})

watch(filePosition, () => {
  if (followProgress.value) {
    const m = moves.value

    if (m.length === 0) {
      return
    }

    syncMoveProgress()

    const { min, max } = currentLayerMoveRange.value

    if (filePosition.value < m[min].filePosition || filePosition.value > m[max].filePosition) {
      currentLayer.value = fileProgressLayerNr.value
    }
  }
})

watch(moveProgress, () => {
  if (followProgress.value) {
    const fileMovePosition: number = typedGetters['gcodePreview/getMoveIndexByFilePosition'](filePosition.value)

    if (fileMovePosition !== moveProgress.value) {
      syncMoveProgress()
    }
  }
})

watch(printerFile, (value, oldValue) => {
  if (autoLoadOnPrintStart.value &&
    value != null &&
    (
      oldValue == null ||
      value.path !== oldValue.path ||
      value.filename !== oldValue.filename
    ) &&
    ['paused', 'printing'].includes(printerState.value) &&
    !printerFileLoaded.value
  ) {
    loadCurrent()
  }
})

watch(fileLoaded, () => {
  if (
    fileLoaded.value &&
    typedState.config.uiSettings.gcodePreview.autoFollowOnFileLoad &&
    printerFileLoaded.value
  ) {
    followProgress.value = true
  }
})

// created equivalent
if (followProgress.value) {
  currentLayer.value = fileProgressLayerNr.value
  syncMoveProgress()
} else {
  moveProgress.value = currentLayerMoveRange.value.min
}

function setCurrentLayer (value: number) {
  if (value >= 0) currentLayer.value = value
}

function setMoveProgress (value: number) {
  if (value >= 0) moveProgress.value = value
}

function syncMoveProgress () {
  moveProgress.value = typedGetters['gcodePreview/getMoveIndexByFilePosition'](filePosition.value)
}

function abortParser () {
  typedDispatch('gcodePreview/terminateParserWorker')
}

function resetFile () {
  typedDispatch('gcodePreview/reset')
}

async function loadCurrent () {
  const pf = printerFile.value

  if (pf) {
    loadFile(pf)
  }
}

async function loadFile (f: AppFile | AppFileWithMeta) {
  try {
    const response = await getGcode(f)

    const gcode = response?.data

    if (!gcode) return

    typedDispatch('gcodePreview/loadGcode', {
      file: f,
      gcode
    })
  } catch (error: unknown) {
    consola.error('[GcodePreview] load', error)
  }
}

async function cancelObject (id: string) {
  const result = await confirm(
    tc('app.general.simple_form.msg.confirm_exclude_object'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    const reqId = id.toUpperCase().replace(/\s/g, '_')

    sendGcode(`EXCLUDE_OBJECT NAME=${encodeGcodeParamValue(reqId)}`)
  }
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
    const path = files.path ? `gcodes/${files.path}` : 'gcodes'

    const f: AppFile | undefined = typedGetters['files/getFile'](path, files.items[0])

    if (f) {
      loadFile(f)
    }
  }
}
</script>

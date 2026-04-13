<template>
  <app-focusable-container
    ref="container"
    :disabled="disabled"
    @focus="focused = true"
    @blur="focused = false"
  >
    <svg
      ref="svg"
      :viewBox="svgViewBox"
      height="100%"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <pattern
          id="backgroundPattern"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <rect
            width="10"
            height="10"
            stroke-width=".1"
            :stroke="themeIsDark ? 'black' : 'white'"
            :fill="themeIsDark ? '#555' : 'lightgrey'"
            :fill-opacity="disabled ? 0.6 : undefined"
          />
        </pattern>
        <clipPath
          v-if="hasRoundBed"
          id="clipCircle"
        >
          <circle
            :r="bedSize.maxX"
            cx="0"
            cy="0"
          />
        </clipPath>
        <svg
          id="retraction"
          :width="retractionIconSize"
          :height="retractionIconSize"
          viewBox="0 0 10 10"
        >
          <path
            v-if="flipY"
            d="m0 0 5 10 5-10Z"
            fill="red"
            fill-opacity="0.9"
            :shape-rendering="shapeRendering"
          />
          <path
            v-else
            d="M10 10 5 0 0 10Z"
            fill="red"
            fill-opacity="0.9"
            :shape-rendering="shapeRendering"
          />
        </svg>
        <svg
          id="unretraction"
          :width="retractionIconSize"
          :height="retractionIconSize"
          viewBox="0 0 10 10"
        >
          <path
            v-if="flipY"
            d="M10 10 5 0 0 10Z"
            fill="green"
            fill-opacity="0.9"
            :shape-rendering="shapeRendering"
          />
          <path
            v-else
            d="m0 0 5 10 5-10Z"
            fill="green"
            fill-opacity="0.9"
            :shape-rendering="shapeRendering"
          />
        </svg>
        <svg
          id="origin"
          width="12"
          height="12"
          viewBox="-2 -2 12 12"
        >
          <path
            fill="#ff0000"
            fill-opacity="0.4"
            d="m8.586-1.414-.354.353.811.811H.969A1 1 0 0 1 1 0a1 1 0 0 1-.033.25h8.076l-.81.81.353.354L10 0z"
            :shape-rendering="shapeRendering"
          />
          <path
            fill="#00ff00"
            fill-opacity="0.4"
            d="M-.25.967v8.076l-.81-.81-.354.353L0 10l1.414-1.414-.353-.354-.811.811V.967A1 1 0 0 1 0 1 1 1 0 0 1-.25.967"
            :shape-rendering="shapeRendering"
          />
          <circle
            fill="#0000ff"
            fill-opacity="0.4"
            cx="0"
            cy="0"
            r="1"
            :shape-rendering="shapeRendering"
          />
        </svg>
      </defs>
      <g :transform="flipTransform">
        <g
          v-if="drawBackground"
          id="background"
        >
          <rect
            :height="bedSize.maxY - bedSize.minY"
            :width="bedSize.maxX - bedSize.minX"
            fill="url(#backgroundPattern)"
            :clip-path="hasRoundBed ? 'url(#clipCircle)' : undefined"
            :x="bedSize.minX"
            :y="bedSize.minY"
          />
        </g>
        <g v-if="drawOrigin">
          <use
            xlink:href="#origin"
            x="-2"
            y="-2"
          />
        </g>
        <g
          v-if="showParts && !showExcludeObjects && svgPathParts.length > 0"
          id="parts"
        >
          <path
            v-for="(part, index) of svgPathParts"
            :key="`part-${index + 1}`"
            fill-opacity="0.2"
            :d="part"
            :shape-rendering="shapeRendering"
          />
        </g>
        <g
          v-if="showPreviousLayer"
          id="previousLayer"
          class="layer"
        >
          <path
            v-for="(extrusion, tool) in svgPathPrevious.extrusions"
            :key="tool"
            :stroke="themeIsDark ? 'lightgrey' : '#555'"
            :stroke-width="extrusionLineWidth"
            stroke-opacity="0.6"
            :d="extrusion"
            :shape-rendering="shapeRendering"
          />
        </g>
        <g
          v-if="showCurrentLayer"
          id="activeLayer"
          class="layer"
        >
          <path
            v-for="(extrusion, tool) in svgPathActive.extrusions"
            :key="tool"
            :stroke="themeIsDark ? 'lightgrey' : '#555'"
            :stroke-width="extrusionLineWidth"
            stroke-opacity="0.6"
            :d="extrusion"
            :shape-rendering="shapeRendering"
          />
        </g>
        <g
          id="currentLayer"
          class="layer"
        >
          <template v-if="showExtrusions">
            <path
              v-for="(extrusion, tool) in svgPathCurrent.extrusions"
              :key="tool"
              :d="extrusion"
              :stroke="toolColors[tool]"
              :stroke-width="extrusionLineWidth"
              :shape-rendering="shapeRendering"
            />
          </template>
          <path
            v-if="showMoves"
            :d="svgPathCurrent.moves"
            stroke="gray"
            :stroke-width="moveLineWidth"
            :shape-rendering="shapeRendering"
          />

          <circle
            id="toolhead"
            fill="green"
            r=".6"
            :cx="svgPathCurrent.toolhead.x"
            :cy="svgPathCurrent.toolhead.y"
          />

          <g
            v-if="showRetractions && svgPathCurrent.retractions.length > 0"
            id="retractions"
          >
            <use
              v-for="({x, y}, index) of svgPathCurrent.retractions"
              :key="`retraction-${index + 1}`"
              xlink:href="#retraction"
              :x="x - (retractionIconSize / 2)"
              :y="flipY ? y : y - retractionIconSize"
            />
            <!-- Calculate anchor to be bottom-center of the triangle -->
          </g>

          <g
            v-if="showRetractions && svgPathCurrent.unretractions.length > 0"
            id="unretractions"
          >
            <use
              v-for="({x, y}, index) of svgPathCurrent.unretractions"
              :key="`unretraction-${index + 1}`"
              xlink:href="#unretraction"
              :x="x - (retractionIconSize / 2)"
              :y="flipY ? y : y - retractionIconSize"
            />
            <!-- Calculate anchor to be bottom-center of the triangle -->
          </g>
        </g>
        <g
          v-if="showNextLayer"
          id="nextLayer"
          class="layer"
        >
          <path
            v-for="(extrusion, key) in svgPathNext.extrusions"
            :key="key"
            stroke="lightgrey"
            stroke-opacity="0.6"
            :d="extrusion"
            :stroke-width="extrusionLineWidth"
            :shape-rendering="shapeRendering"
          />
        </g>
        <exclude-objects
          v-if="showParts && showExcludeObjects"
          :shape-rendering="shapeRendering"
          @cancel="$emit('cancelObject', $event)"
        />
      </g>
    </svg>
    <div
      v-if="file"
      class="preview-options"
      @mousedown.stop=""
      @mouseup="keepFocus"
      @dblclick.stop=""
      @touchstart="panzoomInstance?.pause()"
      @touchend="panzoomInstance?.resume()"
    >
      <div>
        <gcode-preview-button
          v-model="followProgress"
          icon="$play"
          :tooltip="$t('app.gcode.label.follow_progress')"
        />

        <gcode-preview-button
          v-model="showPreviousLayer"
          icon="$previousLayer"
          :tooltip="$t('app.gcode.label.show_previous_layer')"
        />

        <gcode-preview-button
          v-model="showCurrentLayer"
          icon="$currentLayer"
          :tooltip="$t('app.gcode.label.show_current_layer')"
        />

        <gcode-preview-button
          v-model="showNextLayer"
          icon="$nextLayer"
          :tooltip="$t('app.gcode.label.show_next_layer')"
        />

        <gcode-preview-button
          v-model="showMoves"
          icon="$moves"
          :tooltip="$t('app.gcode.label.show_moves')"
        />

        <gcode-preview-button
          v-model="showExtrusions"
          icon="$extrusions"
          :tooltip="$t('app.gcode.label.show_extrusions')"
        />

        <gcode-preview-button
          v-model="showRetractions"
          icon="$retractions"
          :tooltip="$t('app.gcode.label.show_retractions')"
        />

        <gcode-preview-button
          v-model="showParts"
          icon="$parts"
          :tooltip="$t('app.gcode.label.show_parts')"
        />

        <v-btn
          icon
          small
          @click="autoZoom = !autoZoom"
        >
          <v-icon>{{ autoZoom ? '$magnifyMinus' : '$magnifyPlus' }}</v-icon>
        </v-btn>
      </div>
      <div
        v-if="tools.length > 0"
        class="mt-1"
      >
        <gcode-preview-tool
          v-for="(color, tool) in toolColors"
          :key="tool"
          :tool="tool"
          :color="color"
          :active="svgPathCurrent.tool === tool"
        />
      </div>
    </div>
    <div
      v-if="file"
      class="preview-name"
    >
      {{ file.filename }}
    </div>
  </app-focusable-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import panzoom, { type PanZoom } from 'panzoom'
import type { BBox, Layer, LayerPaths, Tool } from '@/store/gcodePreview/types'
import AppFocusableContainerVue from '@/components/ui/AppFocusableContainer.vue'
type AppFocusableContainer = InstanceType<typeof AppFocusableContainerVue>
import ExcludeObjects from '@/components/widgets/exclude-objects/ExcludeObjects.vue'
import GcodePreviewButton from './GcodePreviewButton.vue'
import GcodePreviewTool from './GcodePreviewTool.vue'
import type { AppFile, AppFileWithMeta } from '@/store/files/types'
import type { BedSize } from '@/store/printer/types'

const props = withDefaults(defineProps<{
  disabled?: boolean
  progress?: number
  layer?: number
}>(), {
  progress: Number.POSITIVE_INFINITY,
  layer: 0
})

defineEmits<{
  (e: 'cancelObject', id: string): void
}>()

const { klippyReady } = useStateMixin()
const { isMobileViewport } = useBrowserMixin()
const { typedState, typedGetters, typedDispatch } = useStore()

const container = ref<AppFocusableContainer>()
const svg = ref<SVGElement>()
const focused = ref(false)
const panzoomInstance = ref<PanZoom>()
const panning = ref(false)

const themeIsDark = computed(() => typedState.config.uiSettings.theme.isDark)
const filePosition = computed(() => typedState.printer.printer.virtual_sdcard?.file_position ?? 0)
const extrusionLineWidth = computed(() => typedState.config.uiSettings.gcodePreview.extrusionLineWidth)
const moveLineWidth = computed(() => typedState.config.uiSettings.gcodePreview.moveLineWidth)
const retractionIconSize = computed(() => typedState.config.uiSettings.gcodePreview.retractionIconSize)
const drawBackground = computed(() => typedState.config.uiSettings.gcodePreview.drawBackground)
const drawOrigin = computed(() => typedState.config.uiSettings.gcodePreview.drawOrigin)
const showAnimations = computed(() => typedState.config.uiSettings.gcodePreview.showAnimations)

const autoZoom = computed({
  get: () => typedState.config.uiSettings.gcodePreview.autoZoom,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.gcodePreview.autoZoom',
      value,
      server: true
    })
    reset()
  }
})

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

const showPreviousLayer = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showPreviousLayer,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showPreviousLayer', value, server: true })
  }
})

const showCurrentLayer = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showCurrentLayer,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showCurrentLayer', value, server: true })
  }
})

const showNextLayer = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showNextLayer,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showNextLayer', value, server: true })
  }
})

const showMoves = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showMoves,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showMoves', value, server: true })
  }
})

const showExtrusions = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showExtrusions,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showExtrusions', value, server: true })
  }
})

const showRetractions = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showRetractions,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showRetractions', value, server: true })
  }
})

const showParts = computed({
  get: () => typedState.config.uiSettings.gcodePreview.showParts,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', { path: 'uiSettings.gcodePreview.showParts', value, server: true })
  }
})

const shapeRendering = computed(() => panning.value ? 'optimizeSpeed' : 'geometricPrecision')

const hasExcludeObjectParts = computed(() => typedGetters['printer/getHasExcludeObjectParts'])
const printerFile = computed(() => typedGetters['printer/getPrinterFile'])

const showExcludeObjects = computed(() => {
  if (!klippyReady.value || !hasExcludeObjectParts.value) {
    return false
  }

  const f = file.value

  if (!f) {
    return true
  }

  const pf = printerFile.value

  return (
    pf != null &&
    f.path === pf.path &&
    f.filename === pf.filename
  )
})

const flipX = computed(() => typedState.config.uiSettings.gcodePreview.flip.horizontal)
const flipY = computed(() => typedState.config.uiSettings.gcodePreview.flip.vertical)

const flipTransform = computed(() => {
  const { x, y } = viewBox.value

  const scale = [
    flipX.value ? -1 : 1,
    flipY.value ? -1 : 1
  ]

  const transform = [
    flipX.value ? -(x.max + x.min) : 0,
    flipY.value ? -(y.max + y.min) : 0
  ]

  return `scale(${scale.join()}) translate(${transform.join()})`
})

const hasRoundBed = computed(() => typedGetters['printer/getHasRoundBed'])
const bedSize = computed((): BedSize => typedGetters['printer/getBedSize'])

const viewBox = computed((): BBox => {
  const b = bounds.value

  if (autoZoom.value) {
    const padding = Math.min(b.x.max - b.x.min, b.y.max - b.y.min) * 0.05

    return {
      x: {
        min: b.x.min - padding,
        max: b.x.max + padding
      },
      y: {
        min: b.y.min - padding,
        max: b.y.max + padding
      }
    }
  }

  const bs = bedSize.value

  return {
    x: {
      min: Math.min(bs.minX, b.x.min) - 2,
      max: Math.max(bs.maxX, b.x.max) + 2
    },
    y: {
      min: Math.min(bs.minY, b.y.min) - 2,
      max: Math.max(bs.maxY, b.y.max) + 2
    }
  }
})

const svgViewBox = computed(() => {
  const { x, y } = viewBox.value

  return `${x.min} ${y.min} ${x.max - x.min} ${y.max - y.min}`
})

const defaultLayerPaths = computed((): Readonly<LayerPaths> => Object.freeze({
  extrusions: {},
  moves: '',
  retractions: [],
  unretractions: [],
  toolhead: {
    x: 0,
    y: 0
  },
  tool: 'T0'
}))

const svgPathCurrent = computed((): Readonly<LayerPaths> => {
  if (props.disabled) {
    return defaultLayerPaths.value
  }

  const layer: Layer | undefined = typedGetters['gcodePreview/getLayers'][props.layer ?? 0]

  if (followProgress.value) {
    const end: number = typedGetters['gcodePreview/getMoveIndexByFilePosition'](filePosition.value)

    return typedGetters['gcodePreview/getPaths'](layer?.move ?? 0, end)
  }

  return typedGetters['gcodePreview/getPaths'](layer?.move ?? 0, props.progress ?? Number.POSITIVE_INFINITY)
})

const svgPathActive = computed((): Readonly<LayerPaths> => {
  if (props.disabled) {
    return defaultLayerPaths.value
  }

  return typedGetters['gcodePreview/getLayerPaths'](props.layer ?? 0)
})

const svgPathPrevious = computed((): Readonly<LayerPaths> => {
  if (props.disabled || (props.layer ?? 0) <= 0) {
    return defaultLayerPaths.value
  }

  return typedGetters['gcodePreview/getLayerPaths']((props.layer ?? 0) - 1)
})

const svgPathNext = computed((): Readonly<LayerPaths> => {
  const layers: readonly Layer[] = typedGetters['gcodePreview/getLayers']

  if (props.disabled || (props.layer ?? 0) >= layers.length) {
    return defaultLayerPaths.value
  }

  return typedGetters['gcodePreview/getLayerPaths']((props.layer ?? 0) + 1)
})

const svgPathParts = computed((): readonly string[] => typedGetters['gcodePreview/getPartPaths'])
const file = computed((): AppFile | AppFileWithMeta | null => typedState.gcodePreview.file)
const tools = computed((): readonly number[] => typedState.gcodePreview.tools)
const toolColors = computed((): Record<Tool, string> => typedGetters['gcodePreview/getToolColors'])
const bounds = computed((): BBox => typedGetters['gcodePreview/getBounds'])

watch(focused, (value) => {
  if (panzoomInstance.value && !isMobileViewport.value) {
    if (value) {
      panzoomInstance.value.resume()
    } else {
      panzoomInstance.value.pause()
    }
  }
})

onMounted(() => {
  panzoomInstance.value = panzoom(svg.value!, {
    maxZoom: 20,
    minZoom: 0.95,
    smoothScroll: showAnimations.value,

    beforeMouseDown: () => props.disabled ?? false,
    beforeWheel: () => !focused.value || (props.disabled ?? false),
    onClick: () => props.disabled ?? false,
    onDoubleClick: () => props.disabled ?? false
  })

  panzoomInstance.value.on('panstart', () => {
    panning.value = true
  })

  panzoomInstance.value.on('panend', () => {
    panning.value = false
  })
})

onBeforeUnmount(() => {
  panzoomInstance.value?.dispose()
})

function reset () {
  panzoomInstance.value?.moveTo(0, 0)
  panzoomInstance.value?.zoomAbs(0, 0, 1)
}

function keepFocus () {
  if (!isMobileViewport.value) {
    container.value?.focus()
  }
}

function focus () {
  container.value?.focus()
}

function showCommandPalette () {
  // no-op placeholder for interface compatibility
}

defineExpose({ focus, showCommandPalette })
</script>

<style lang="scss" scoped>
  .preview-options,
  .preview-name {
    position: absolute;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.75);
    font-weight: 100;
  }

  .preview-options {
    top: 0;
    border-bottom-right-radius: 4px;
  }
  .preview-name {
    bottom: 0;
    border-top-right-radius: 4px;
  }

  .theme--light {
    .preview-options,
    .preview-name {
      background: rgba(255, 255, 255, 0.75);
    }
  }

  :deep(.v-input__slot) {
    overflow: hidden;
    max-height: calc(100vh - 398px);
    max-height: calc(100svh - 398px);
    min-height: 250px !important;
    aspect-ratio: 1;

    svg {
      shape-rendering: geometricPrecision;

      .layer > path {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }
  }
</style>

<template>
  <svg
    ref="mmuSpoolSvg"
    viewBox="0 0 248 500"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <path
        id="oval"
        d="M0-63c35 0 63 28 63 63S35 63 0 63-63 35-63 0s28-63 63-63"
        vector-effect="non-scaling-stroke"
      />
      <path
        id="center"
        d="M0-63c35 0 63 28 63 63S35 63 0 63h-624V-63z"
        vector-effect="non-scaling-stroke"
      />
      <path
        id="espool"
        d="M89.561 35.5 60.333 15.734a.999.999 0 0 0-1.56.828v7.987c-12.038.262-26.306 5.201-37.501 13.023C7.554 47.155 0 59.894 0 73.438a1.001 1.001 0 0 0 1.911.412c7.823-17.312 26.952-26.183 56.861-26.376v8.62a.999.999 0 0 0 1.56.828L89.56 37.156c.275-.185.44-.495.44-.827s-.165-.643-.439-.829"
        stroke-width="3"
        stroke="#CCCCCC"
        fill="#808080"
        opacity="0.7"
      />
    </defs>

    <filter
      id="blur_wheel2"
      width="1.3"
      height="1.16"
    >
      <feGaussianBlur
        in="SourceAlpha"
        stdDeviation="3"
      />
      <feOffset
        dx="18"
        dy="0"
        result="oBlur"
      />
      <feFlood
        flood-color="#000"
        flood-opacity=".67"
      />
      <feComposite
        in2="oBlur"
        operator="in"
      />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <g transform="matrix(0.59,0,0,3.95,197,250)">
      <use
        href="#oval"
        style="filter: url(#blur_wheel2)"
        :fill="spoolWheelColor"
      />
      <use
        href="#oval"
        transform="scale(0.41)"
        style="filter: url(#blur_wheel2)"
        :fill="spoolWheelColor"
      />
      <use
        href="#center"
        transform="scale(0.41)"
        :fill="spoolWheelColor"
      />
    </g>
    <path
      v-if="filamentAmount !== 0 || spoolStatus !== GATE_EMPTY"
      ref="filament"
      d="M0-63c35 0 63 28 63 63S35 63 0 63h-424V-63z"
      vector-effect="non-scaling-stroke"
      :fill="filamentColor"
      :transform="'matrix(' + computedScale(0.28, 0.4) + ',0,0,' + computedScale(1.65, 3.5) + ',197,250)'"
    />
    <g transform="matrix(0.59,0,0,3.95,37,250)">
      <use
        href="#oval"
        style="filter: url(#blur_wheel2)"
        :fill="spoolWheelColor"
      />
      <use
        href="#oval"
        transform="scale(0.41)"
        style="fill: #111111"
      />
    </g>

    <g v-if="!editGateMap">
      <text
        v-if="filamentAmount > 0"
        x="152"
        y="270"
        text-anchor="middle"
        font-weight="bold"
        font-size="56px"
        :fill="contrastColor"
      >
        {{ filamentAmount }}%
      </text>
      <text
        v-else-if="filamentAmount === 0 && spoolStatus !== GATE_EMPTY"
        x="140"
        y="310"
        text-anchor="middle"
        font-weight="bold"
        font-size="160px"
        style="fill: red; stroke: #111111; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round"
      >
        !
      </text>
      <use
        v-if="isEspoolerRewind"
        href="#espool"
        transform="translate(225,0) rotate(90) scale(2,2)"
      />
      <use
        v-if="isEspoolerAssist"
        href="#espool"
        transform="translate(225,480) rotate(270) scale(2,-2)"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin, TOOL_GATE_BYPASS, FILAMENT_POS_LOADED, GATE_AVAILABLE, GATE_EMPTY, NO_FILAMENT_COLOR, ESPOOLER_REWIND, ESPOOLER_ASSIST } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import type { MmuGateDetails } from '@/types'
import { TinyColor } from '@ctrl/tinycolor'

const props = withDefaults(defineProps<{
  gateIndex: number
  spoolWheelColor?: string
  editGateMap?: MmuGateDetails[] | null
  editGateSelected?: number
  showPercent?: boolean
}>(), {
  gateIndex: -1,
  spoolWheelColor: '#AD8762',
  editGateMap: null,
  editGateSelected: -1,
  showPercent: true,
})

const { gateDetails, mmuState, filamentPos, spoolmanSpool, spoolmanSupport } = useMmuMixin()
const { typedState } = useStore()

const details = computed<MmuGateDetails>(() => {
  if (props.editGateMap) return props.editGateMap[props.gateIndex]
  return gateDetails(props.gateIndex)
})

const showUnavailableSpoolColor = computed(() =>
  typedState.config.uiSettings.mmu.showUnavailableSpoolColor
)

const spoolStatus = computed(() => {
  if (props.gateIndex === TOOL_GATE_BYPASS) {
    return filamentPos.value === FILAMENT_POS_LOADED ? GATE_AVAILABLE : GATE_EMPTY
  }
  return details.value.status
})

const filamentAmount = computed(() => {
  if (props.editGateMap) return 100
  if (spoolStatus.value === GATE_EMPTY && !(showUnavailableSpoolColor.value && details.value.color !== NO_FILAMENT_COLOR)) return 0

  const spool = spoolmanSpool(details.value.spoolId)
  if (!spool) return -1
  if (!details.value.spoolId || details.value.spoolId <= 0 || spoolmanSupport.value === 'off') return -1

  const remaining = spool.remaining_weight ?? null
  const total = spool.filament?.weight ?? null
  if (remaining === null || total === null) return -1
  return Math.ceil(Math.max(0, Math.min(100, (remaining / total) * 100)))
})

const filamentColor = computed(() => details.value.color)

function computedScale (start: number, end: number) {
  if (props.editGateMap || filamentAmount.value < 0) return end
  return start + (end - start) * (filamentAmount.value / 100)
}

const contrastColor = computed(() =>
  new TinyColor(filamentColor.value).getLuminance() > 0.5 ? 'black' : 'white'
)

function getEspoolerForGate (gateIndex: number): string | undefined {
  const espoolers = mmuState.value?.espooler
  if (espoolers) return espoolers[gateIndex]
  if (gateIndex === mmuState.value?.gate) return mmuState.value?.espooler_active
  return undefined
}

const isEspoolerRewind = computed(() => getEspoolerForGate(props.gateIndex) === ESPOOLER_REWIND)
const isEspoolerAssist = computed(() => getEspoolerForGate(props.gateIndex) === ESPOOLER_ASSIST)
</script>

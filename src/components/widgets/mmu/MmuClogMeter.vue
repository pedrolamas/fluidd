<template>
  <svg
    ref="clogMeter"
    viewBox="0 0 140 140"
    preserveAspectRatio="xMidYMid meet"
    :class="{ 'disabled-clog': encoderDetectionMode === 0 || encoderEnabled === false }"
  >
    <g transform="rotate(120 70 70)">
      <circle
        cx="70"
        cy="70"
        r="50"
        class="v-progress-circular__underlay"
        fill="transparent"
        stroke-width="18"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dialArc"
      />
      <circle
        ref="dialCircle"
        cx="70"
        cy="70"
        r="50"
        class="primary-color"
        fill="transparent"
        stroke-width="18"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </g>
    <g :transform="'rotate(' + headroomRotate + ' 70 70)'">
      <circle
        cx="70"
        cy="70"
        r="50"
        class="warning-color"
        fill="transparent"
        stroke-width="18"
        opacity="0.3"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="headroomArc"
      />
    </g>

    <line
      ref="minHeadroomLine"
      :x1="x1MinHeadroom"
      :y1="y1MinHeadroom"
      x2="70"
      y2="70"
      :class="{ 'warning-color': headroomWarning, 'primary-color': !headroomWarning }"
      stroke-width="4"
      stroke-dashoffset="0"
      stroke-dasharray="23,63"
    />
    <line
      :x1="x1Start"
      :y1="y1Start"
      x2="70"
      y2="70"
      stroke="white"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="22,63"
    />
    <line
      :x1="x1End"
      :y1="y1End"
      x2="70"
      y2="70"
      class="warning-color"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="22,63"
    />

    <text
      x="70"
      y="56"
      text-anchor="middle"
      class="small-text-color"
      font-size="11px"
    >FLOW</text>
    <text
      x="70"
      y="80"
      text-anchor="middle"
      class="small-text-color"
      font-size="20px"
    >{{ encoderFlowRate }}%</text>
    <text
      v-if="encoderDetectionMode === 2"
      x="70"
      y="122"
      text-anchor="middle"
      class="small-text-color"
      font-size="12px"
    >
      Auto
    </text>
    <text
      x="32"
      y="139"
      text-anchor="end"
      class="small-text-color"
      font-size="12px"
    >
      {{ encoderDetectionLength }}
    </text>
    <text
      x="106"
      y="139"
      class="small-text-color"
      font-size="12px"
    >0</text>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMmuMixin } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'

withDefaults(defineProps<{
  rotationTime?: number
}>(), {
  rotationTime: 1,
})

const {
  encoderDesiredHeadroom,
  encoderDetectionLength,
  encoderDetectionMode,
  encoderEnabled,
  encoderFlowRate,
} = useMmuMixin()
const { typedState } = useStore()

const dialCircle = ref<SVGElement | null>(null)

const circumference = 2 * Math.PI * 50
const dialArc = circumference * (60 / 360)
const dashOffset = ref(circumference)

const x1Start = 70 + 63 * Math.cos((120 * Math.PI) / 180)
const y1Start = 70 + 63 * Math.sin((120 * Math.PI) / 180)
const x1End = 70 + 63 * Math.cos((60 * Math.PI) / 180)
const y1End = 70 + 63 * Math.sin((60 * Math.PI) / 180)

const x1MinHeadroom = ref(70 + 64 * Math.cos(((120 + 0) * Math.PI) / 180))
const y1MinHeadroom = ref(70 + 64 * Math.sin(((120 + 0) * Math.PI) / 180))
const headroomWarning = ref(false)

const headroomArc = computed(() =>
  circumference * (1 - (encoderDesiredHeadroom.value / encoderDetectionLength.value) * (300 / 360))
)

const headroomRotate = computed(() =>
  420 - (encoderDesiredHeadroom.value / encoderDetectionLength.value) * 300
)

function animateMeter (newOffset: number, rotationTime: number) {
  if (!dialCircle.value) return
  const currentOffset = parseFloat(getComputedStyle(dialCircle.value).strokeDashoffset) ?? circumference
  const difference = Math.abs(currentOffset - newOffset)
  const duration = (difference / circumference) * rotationTime
  dialCircle.value.style.transition = `stroke-dashoffset ${duration}s ease-out`
  dashOffset.value = newOffset
}

watch(() => typedState.printer.printer.mmu?.encoder?.headroom, (newHeadroom) => {
  if (newHeadroom == null) return
  const clogPercent =
    (Math.min(Math.max(0, encoderDetectionLength.value - newHeadroom), encoderDetectionLength.value) /
      encoderDetectionLength.value) * 100
  const offset = ((100 - (clogPercent * 300) / 360) / 100) * circumference
  animateMeter(offset, 1)
})

watch(() => typedState.printer.printer.mmu?.encoder?.min_headroom, (newMinHeadroom) => {
  if (newMinHeadroom == null) return
  const clogPercent =
    (Math.min(Math.max(0, encoderDetectionLength.value - newMinHeadroom), encoderDetectionLength.value) /
      encoderDetectionLength.value) * 100
  const angle = clogPercent * 3
  x1MinHeadroom.value = 70 + 66 * Math.cos(((120 + angle) * Math.PI) / 180)
  y1MinHeadroom.value = 70 + 66 * Math.sin(((120 + angle) * Math.PI) / 180)
  headroomWarning.value = newMinHeadroom < encoderDesiredHeadroom.value
})
</script>

<style scoped>
.disabled-clog {
    opacity: 0.5;
    cursor: not-allowed;
}
.primary-color {
    stroke: var(--v-primary-lighten1, #2ca9bc);
}
.warning-color {
    stroke: var(--v-error-base, #ff0000);
}
.small-text-color {
    fill: var(--v-primary-lighten1, #2ca9bc);
}
</style>

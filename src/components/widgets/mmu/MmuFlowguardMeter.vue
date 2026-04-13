<template>
  <svg
    ref="flowguardMeter"
    viewBox="0 0 140 140"
    preserveAspectRatio="xMidYMid meet"
    :class="svgClasses"
  >
    <g transform="rotate(120 70 70)">
      <circle
        cx="70"
        cy="70"
        r="50"
        class="v-progress-circular__underlay"
        fill="transparent"
        stroke-width="18"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="DIAL_ARC"
      />
    </g>
    <g transform="rotate(270 70 70)">
      <circle
        ref="dialCircle"
        cx="70"
        cy="70"
        r="50"
        class="primary-color"
        fill="transparent"
        stroke-width="18"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="meterDashOffset"
      />
    </g>
    <g transform="rotate(60 70 70)">
      <circle
        cx="70"
        cy="70"
        r="50"
        class="warning-color"
        fill="transparent"
        stroke-width="18"
        opacity="0.3"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="clogHeadroomDashOffset"
      />
    </g>
    <g transform="rotate(120 70 70)">
      <circle
        cx="70"
        cy="70"
        r="50"
        class="warning-color"
        fill="transparent"
        stroke-width="18"
        opacity="0.3"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="tangleHeadroomDashOffset"
      />
    </g>
    <line
      ref="minHeadroomLine"
      :x1="x1MaxClog"
      :y1="y1MaxClog"
      x2="70"
      y2="70"
      style="opacity: 0.6"
      :class="maxClogLineClasses"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="18,63"
    />
    <line
      ref="minHeadroomLine"
      :x1="x1MaxTangle"
      :y1="y1MaxTangle"
      x2="70"
      y2="70"
      style="opacity: 0.6"
      :class="maxTangleLineClasses"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="18,63"
    />
    <line
      :x1="X1_TANGLE"
      :y1="Y1_TANGLE"
      x2="70"
      y2="70"
      class="warning-color"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="22,63"
    />
    <line
      :x1="X1_CLOG"
      :y1="Y1_CLOG"
      x2="70"
      y2="70"
      class="warning-color"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="22,63"
    />
    <line
      :x1="X1_ZERO"
      :y1="Y1_ZERO"
      x2="70"
      y2="70"
      stroke="white"
      stroke-width="2"
      stroke-dashoffset="0"
      stroke-dasharray="18,63"
    />
    <text
      x="70"
      y="56"
      text-anchor="middle"
      class="small-text-color"
      font-size="12px"
    >
      FLOW
    </text>
    <text
      x="70"
      y="69"
      text-anchor="middle"
      class="small-text-color"
      font-size="12px"
    >
      GUARD
    </text>
    <text
      v-if="flowguardActive && !flowguardTrigger"
      x="70"
      y="90"
      text-anchor="middle"
      class="small-text-color"
      :font-size="flowrateTextSize"
      font-weight="bold"
    >
      {{ flowrateText }}
    </text>
    <text
      v-if="flowguardTrigger"
      x="70"
      y="90"
      text-anchor="middle"
      class="small-text-warning"
      font-size="16px"
    >
      {{ flowguardTrigger }}
    </text>
    <text
      x="58"
      y="139"
      text-anchor="end"
      class="small-text-color"
      font-size="12px"
    >
      TANGLE
    </text>
    <text
      x="86"
      y="139"
      class="small-text-color"
      font-size="12px"
    >
      CLOG
    </text>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMmuMixin } from '@/composables/useMmuMixin'

const { mmuState, sensors } = useMmuMixin()

const dialCircle = ref<SVGCircleElement | null>(null)

const ROTATION_TIME = 1
const CIRCUMFERENCE = 2 * Math.PI * 50
const DIAL_ARC = CIRCUMFERENCE * (60 / 360)
const X1_TANGLE = 70 + 63 * Math.cos((120 * Math.PI) / 180)
const Y1_TANGLE = 70 + 63 * Math.sin((120 * Math.PI) / 180)
const X1_CLOG = 70 + 63 * Math.cos((60 * Math.PI) / 180)
const Y1_CLOG = 70 + 63 * Math.sin((60 * Math.PI) / 180)
const X1_ZERO = 70 + 59 * Math.cos((270 * Math.PI) / 180)
const Y1_ZERO = 70 + 59 * Math.sin((270 * Math.PI) / 180)
const DANGER = 0.8

const flowguardEnabled = computed(() => mmuState.value?.flowguard?.enabled ?? false)
const flowguardActive = computed(() => mmuState.value?.flowguard?.active ?? false)
const flowguardTrigger = computed(() => (mmuState.value?.flowguard?.trigger ?? '').toUpperCase())

const flowrateText = computed(() => {
  if ('filament_proportional' in sensors.value) {
    return `${Math.round(mmuState.value?.sync_feedback_flow_rate ?? 100.0)}%`
  }
  return 'ACTIVE'
})

const flowrateTextSize = computed(() =>
  'filament_proportional' in sensors.value ? '18px' : '14px'
)

const maxClog = computed(() => Math.abs(mmuState.value?.flowguard?.max_clog ?? 0.0))
const maxTangle = computed(() => -Math.abs(mmuState.value?.flowguard?.max_tangle ?? 0.0))
const flowguardLevel = computed(() => mmuState.value?.flowguard?.level ?? 0.0)

const svgClasses = computed<Record<string, boolean>>(() => ({
  'disabled-flowguard': !flowguardEnabled.value,
}))

const clogWarning = computed(() => Math.abs(maxClog.value) > DANGER)

const maxClogLineClasses = computed<Record<string, boolean>>(() => ({
  'warning-color': clogWarning.value,
  'primary-color': !clogWarning.value,
}))

const clogHeadroomDashOffset = computed(() => CIRCUMFERENCE * (1 + (1 - DANGER) * (150 / 360)))

const tangleWarning = computed(() => Math.abs(maxTangle.value) > DANGER)

const maxTangleLineClasses = computed<Record<string, boolean>>(() => ({
  'warning-color': tangleWarning.value,
  'primary-color': !tangleWarning.value,
}))

const tangleHeadroomDashOffset = computed(() => CIRCUMFERENCE * (1 - (1 - DANGER) * (150 / 360)))

const flowguardPercent = computed(() => Math.max(Math.min(1, flowguardLevel.value), -1) * 100)

const meterDashOffset = computed(() =>
  CIRCUMFERENCE * ((100 - (flowguardPercent.value * 150) / 360) / 100)
)

const maxClogAngle = computed(() => maxClog.value * 150 + 150)
const maxTangleAngle = computed(() => maxTangle.value * 150 + 150)

function calcX1 (angle: number) { return 70 + 59 * Math.cos(((120 + angle) * Math.PI) / 180) }
function calcY1 (angle: number) { return 70 + 59 * Math.sin(((120 + angle) * Math.PI) / 180) }

const x1MaxClog = computed(() => calcX1(maxClogAngle.value))
const y1MaxClog = computed(() => calcY1(maxClogAngle.value))
const x1MaxTangle = computed(() => calcX1(maxTangleAngle.value))
const y1MaxTangle = computed(() => calcY1(maxTangleAngle.value))

watch(meterDashOffset, (newValue) => {
  if (!dialCircle.value) return
  const currentOffset = parseFloat(dialCircle.value.style.strokeDashoffset) || CIRCUMFERENCE
  const difference = Math.abs(currentOffset - newValue)
  const duration = (difference / CIRCUMFERENCE) * ROTATION_TIME
  dialCircle.value.style.transition = `stroke-dashoffset ${duration}s ease-out`
}, { immediate: true })
</script>

<style scoped>
.disabled-flowguard {
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
.small-text-warning {
    fill: var(--v-error-base, #ff0000);
}
</style>

<template>
  <svg
    ref="mmuGateStatusSvg"
    viewBox="0 0 120 60"
    xml:space="preserve"
    preserveAspectRatio="xMidYMid meet"
  >
    <rect
      x="15"
      y="14"
      width="90"
      height="39"
      rx="8"
      ry="8"
      stroke-width="5"
      :stroke="statusColor"
      :fill="selectedColor"
    />
    <text
      v-if="gateIndex >= 0"
      x="60"
      y="44"
      text-anchor="middle"
      font-weight="bold"
      font-size="30px"
      :fill="fontColor"
    >
      {{ gateIndex }}
    </text>
    <text
      v-if="gateIndex === TOOL_GATE_BYPASS"
      x="60"
      y="41"
      text-anchor="middle"
      font-weight="bold"
      font-size="20px"
      :fill="fontColor"
    >
      BYPASS
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin, TOOL_GATE_BYPASS } from '@/composables/useMmuMixin'
import { useVuetify } from '@/composables/useVuetify'
import type { MmuGateDetails } from '@/types'

const props = withDefaults(defineProps<{
  gateIndex: number
  editGateMap?: MmuGateDetails[] | null
  editGateSelected?: number
}>(), {
  editGateMap: null,
  editGateSelected: -1,
})

const { gate, gateStatus } = useMmuMixin()
const vuetify = useVuetify()

const statusColor = computed(() => {
  if (props.gateIndex < 0) return 'none'
  let status = gateStatus.value[props.gateIndex]
  if (props.editGateMap) status = props.editGateMap[props.gateIndex].status
  if (status >= 1) return 'green'
  if (status === 0) return '#808080'
  return 'orange'
})

const selectedColor = computed(() => {
  if (props.editGateMap) return 'none'
  return gate.value === props.gateIndex ? 'limegreen' : 'none'
})

const fontColor = computed(() => {
  if (!props.editGateMap && props.gateIndex === gate.value) return '#000000'
  return vuetify.theme.dark ? '#c0c0c0' : '#808080'
})
</script>

<style scoped>
</style>

<template>
  <v-list-item
    :lines="lines"
    :class="{ 'disabled-panel': details.status === 0 }"
  >
    <v-list-item-content :class="contentClass">
      <div :class="toplineClass">
        {{ title }}
      </div>
      <v-list-item-title :class="titleClass">
        {{ name }}
      </v-list-item-title>
      <v-list-item-subtitle :class="subtitleClass">
        {{ subtitle }}
      </v-list-item-subtitle>
      <v-list-item-subtitle
        v-if="showDetails"
        :class="detailsClass"
      >
        {{ extra }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin } from '@/composables/useMmuMixin'

const props = withDefaults(defineProps<{
  gateIndex: number
  compact?: boolean
  showDetails?: boolean
  showGate?: boolean
}>(), {
  gateIndex: -1,
  compact: false,
  showDetails: true,
  showGate: true,
})

const { gate, gateDetails, gateText, spoolmanSpool } = useMmuMixin()

const details = computed(() => gateDetails(props.gateIndex))

const lines = computed(() => props.showDetails ? 'three' : 'two')

const vendorText = computed(() => {
  const spool = spoolmanSpool(details.value.spoolId)
  return spool?.filament?.vendor?.name ?? 'Unknown'
})

const title = computed(() =>
  [props.showGate ? gateText(gate.value) : null, vendorText.value].filter((v) => v !== null).join(' | ')
)

const name = computed(() => details.value.filamentName)

const speedOverrideText = computed(() =>
  details.value.speedOverride === 100 ? null : 'Speed: ' + details.value.speedOverride + '%'
)

const temperatureText = computed(() =>
  details.value.temperature <= 0 ? null : details.value.temperature + '\u00B0' + 'C'
)

const spoolIdText = computed(() =>
  !details.value.spoolId || details.value.spoolId <= 0 ? null : 'Spool ID: #' + details.value.spoolId
)

const subtitle = computed(() =>
  [details.value.material, temperatureText.value, speedOverrideText.value].filter((v) => v !== null).join(' | ')
)

const weightText = computed(() => {
  const spool = spoolmanSpool(details.value.spoolId)
  const remaining = spool?.remaining_weight ?? null
  const total = spool?.filament?.weight ?? null
  if (remaining === null || total === null) return null
  if (total >= 1000) {
    let totalRound = Math.floor(total / 1000)
    if (totalRound !== total / 1000) totalRound = Math.round(total / 100) / 10
    return `${Math.round(remaining)}g / ${totalRound}kg`
  }
  return `${Math.round(remaining)} / ${Math.round(total)}g`
})

const lengthText = computed(() => {
  const spool = spoolmanSpool(details.value.spoolId)
  const remaining = spool?.remaining_length ?? null
  return remaining !== null ? `${Math.round(remaining / 1000)}m` : null
})

const extra = computed(() => {
  const text = [spoolIdText.value, weightText.value, lengthText.value].filter((v) => v !== null).join(' | ')
  return text || 'No spool ID'
})

const contentClass = computed(() => props.compact ? ['my-0', 'smaller-font'] : 'my-0')
const toplineClass = computed(() =>
  props.compact
    ? ['text-overline', 'mb-1', 'reduced-line-height', 'small-overline-font']
    : ['text-overline', 'reduced-line-height', 'mb-2']
)
const titleClass = computed(() => props.compact ? ['text-h7', 'mb-1'] : ['text-h6', 'mb-1'])
const subtitleClass = computed(() =>
  props.compact ? ['subtitle-container', ' smaller-font'] : ['subtitle-container']
)
const detailsClass = computed(() =>
  props.compact ? ['subtitle-container', ' smaller-font'] : ['subtitle-container', 'smaller-font']
)
</script>

<style scoped>
.reduced-line-height {
    line-height: 1em;
}

.subtitle-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.smaller-font {
    font-size: 0.8em;
}

.small-overline-font {
    line-height: 0.7em;
    font-size: 0.7em !important;
}

.disabled-panel {
    opacity: 0.5;
}
</style>

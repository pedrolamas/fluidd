<template>
  <div
    :class="footerClasses"
    class="d-flex flex-row align-center px-2 pb-1"
  >
    <div
      v-if="showFooter && showLogos"
      class="mmu-logo"
      :style="{
        height: `${logoHeight}px`
      }"
    >
      <inline-svg
        :src="vendorLogoUrl"
        height="100%"
        @error="logoError = true"
      />
    </div>
    <div
      v-if="showFooter"
      class="flex-grow-1 flex-shrink-1 min-width-0 text-caption"
    >
      <div
        v-if="showName"
        class="text-truncate"
      >
        {{ unitDisplayName }}
      </div>
      <v-tooltip
        v-if="showDetails && showClimate"
        v-model="isTooltipOpen"
        :disabled="!showPerGateReport"
        top
        open-delay="500"
      >
        <template #activator="{ on, attrs }">
          <div
            class="text-truncate d-flex"
            v-bind="attrs"
            v-on="on"
          >
            <span
              v-if="unitClimateHumidity"
              class="d-inline-flex align-center mr-1"
            >
              <v-icon
                v-if="showClimateIcons"
                size="18"
                class="blue--text ml-n1"
              >$mmuHumidity</v-icon>
              {{ unitClimateHumidity }}
            </span>
            <span
              v-if="unitClimateTemp"
              class="d-inline-flex align-center mr-2"
            >
              <v-icon
                v-if="showClimateIcons"
                size="18"
                class="deep-orange--text"
              >$mmuTemp</v-icon>
              {{ unitClimateTemp }}
            </span>
            <span
              v-if="unitHeaterIcon"
              class="d-inline-flex align-center ml-auto"
            >
              <v-icon
                size="22"
                class="red--text"
              >{{ unitHeaterIcon }}</v-icon>
              {{ unitHeaterTemp }}
            </span>
          </div>
        </template>
        <span style="white-space: pre-line">{{ perGateReportCached }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMmuMixin, DRYING_STATE_ACTIVE, DRYING_STATE_QUEUED, DRYING_STATE_COMPLETE, DRYING_STATE_CANCELLED } from '@/composables/useMmuMixin'
import { useVuetify } from '@/composables/useVuetify'
import { useI18n } from '@/composables/useI18n'
import { useStore } from '@/composables/useStore'
import type { Sensor } from '@/store/printer/types'

const props = withDefaults(defineProps<{
  unitIndex?: number
  showDetails?: boolean
  showFooter?: boolean
}>(), {
  unitIndex: 0,
  showDetails: true,
  showFooter: true,
})

const { t } = useI18n()
const vuetify = useVuetify()
const { typedState, typedGetters } = useStore()
const {
  gate,
  numGates,
  unitDetails,
  dryingState,
} = useMmuMixin()

const logoError = ref(false)
const isTooltipOpen = ref(false)
const perGateReportCached = ref('')

watch(() => props.unitIndex, () => { logoError.value = false })

watch(isTooltipOpen, (open) => {
  if (!open) return
  perGateReportCached.value = generatePerGateReport()
})

const mmuMachineUnit = computed(() => unitDetails(props.unitIndex))

const vendorLogo = computed(() =>
  logoError.value ? 'HappyHare' : mmuMachineUnit.value.vendor
)

const vendorLogoUrl = computed(() =>
  `${import.meta.env.BASE_URL}img/mmu/mmu_${vendorLogo.value}.svg`
)

const unitDisplayName = computed(() => `#${props.unitIndex + 1} ${mmuMachineUnit.value.name}`)

const logoHeight = computed(() => {
  if (numGates.value <= 8) return 44
  return 40
})

const showName = computed(() => typedState.config.uiSettings.mmu.showName)
const showLogos = computed(() => typedState.config.uiSettings.mmu.showLogos)
const showClimate = computed(() => typedState.config.uiSettings.mmu.showClimate)
const showClimateIcons = computed(() => mmuMachineUnit.value.numGates > 2)

const printerSensors = computed((): Sensor[] => typedGetters['printer/getSensors'])

const unitHeaterObj = computed(() => {
  const heaterKey = resolvePerGateName(
    mmuMachineUnit.value?.filamentHeaters,
    mmuMachineUnit.value?.filamentHeater
  )
  return heaterKey ? typedState.printer.printer[heaterKey] : undefined
})

const unitClimateSensorObj = computed(() => {
  const fullname = resolvePerGateName(
    mmuMachineUnit.value?.environmentSensors,
    mmuMachineUnit.value?.environmentSensor
  )
  return lookupSensorObj(fullname)
})

function lookupSensorObj (fullname: string | undefined) {
  if (!fullname) return undefined
  const parts = fullname.split(' ')
  if (parts.length !== 2) return undefined
  const name = parts[1]
  return printerSensors.value.find(s => s.name === name)
}

const hasPerGateClimateSensors = computed(() => !!mmuMachineUnit.value?.environmentSensors)
const hasPerGateHeaters = computed(() => !!mmuMachineUnit.value?.filamentHeaters)

const unitDryingCycle = computed(() => {
  const start = mmuMachineUnit.value.firstGate
  const end = mmuMachineUnit.value.firstGate + mmuMachineUnit.value.numGates
  return dryingState.value.slice(start, end).some(
    (state) => state === DRYING_STATE_ACTIVE || state === DRYING_STATE_QUEUED
  )
})

const showPerGateReport = computed(() => hasPerGateHeaters.value || hasPerGateClimateSensors.value)

function generatePerGateReport (): string {
  const sensors = mmuMachineUnit.value?.environmentSensors
  const heaters = mmuMachineUnit.value?.filamentHeaters
  const isDrying = unitDryingCycle.value

  const gateLabel = t('app.mmu.label.gate').toString()
  const dryingLabel = t('app.mmu.label.drying').toString()
  const heaterLabel = t('app.mmu.label.heater').toString()
  const queued = t('app.mmu.label.drying_queued').toString()
  const complete = t('app.mmu.label.drying_complete').toString()
  const cancelled = t('app.mmu.label.drying_cancelled').toString()

  const lines: string[] = []
  for (let i = 0; i < mmuMachineUnit.value.numGates; i++) {
    const g = mmuMachineUnit.value.firstGate + i
    const parts: string[] = []

    const fullname = sensors?.[i]
    const sensorObj = lookupSensorObj(stripQuotes(fullname))
    if (sensorObj) {
      const h = humidity(sensorObj)
      const temp = temperature(sensorObj)
      if (h || temp) parts.push([h, temp].filter(Boolean).join('/'))
    }

    const heaterName = heaters?.[i]
    const heaterKey = stripQuotes(heaterName) ?? ''
    const heaterObj = heaterKey ? typedState.printer.printer[heaterKey] : undefined
    if (heaterObj) {
      const state = dryingState.value?.[g]
      if (isDrying) {
        if (state === DRYING_STATE_ACTIVE) parts.push(`${dryingLabel}: ${target(heaterObj) ?? ''}`.trim())
        else if (state === DRYING_STATE_QUEUED) parts.push(queued)
        else if (state === DRYING_STATE_COMPLETE) parts.push(complete)
        else if (state === DRYING_STATE_CANCELLED) parts.push(cancelled)
        else parts.push(`${heaterLabel}: ${target(heaterObj) ?? ''}`.trim())
      } else {
        parts.push(`${heaterLabel}: ${target(heaterObj) ?? ''}`.trim())
      }
    }

    lines.push(`${gateLabel} ${g}: ${parts.join(', ')}`)
  }

  return lines.join('\n')
}

function formatMetric (obj: any, key: 'humidity' | 'temperature' | 'target', suffix: string) {
  const v = obj?.[key]
  return typeof v === 'number' ? `${v.toFixed(0)}${suffix}` : undefined
}

function humidity (obj: any) {
  return formatMetric(obj, 'humidity', '%')
}

function temperature (obj: any) {
  return formatMetric(obj, 'temperature', '°C')
}

function target (obj: any) {
  return formatMetric(obj, 'target', '°C')
}

function resolvePerGateName (perGate: string[] | undefined, single: string | undefined) {
  if (perGate) {
    const start = mmuMachineUnit.value.firstGate
    const end = start + mmuMachineUnit.value.numGates
    if (gate.value < start || gate.value >= end) return undefined
    return stripQuotes(perGate[gate.value - start])
  }
  return stripQuotes(single)
}

function stripQuotes (v?: string) {
  return v?.replace(/^"(.*)"$/, '$1')
}

const unitHeaterIcon = computed(() => {
  if (unitDryingCycle.value) return '$mmuDryer'

  if (hasPerGateHeaters.value) {
    const heaters = mmuMachineUnit.value?.filamentHeaters
    for (let i = 0; i < mmuMachineUnit.value.numGates; i++) {
      const heaterName = heaters?.[i]
      const heaterKey = stripQuotes(heaterName) ?? ''
      const heaterObj = heaterKey ? typedState.printer.printer[heaterKey] : undefined
      const raw = heaterObj?.target
      if (typeof raw === 'number' && raw > 0) return '$mmuHeater'
    }
  } else if (unitHeaterTemp.value) return '$mmuHeater'

  return undefined
})

const unitClimateHumidity = computed(() => {
  if (hasPerGateClimateSensors.value && !unitClimateSensorObj.value) return '...'
  if (!unitClimateSensorObj.value) return undefined
  return formatMetric(unitClimateSensorObj.value, 'humidity', '%')
})

const unitClimateTemp = computed(() => {
  if (hasPerGateClimateSensors.value && !unitClimateSensorObj.value) return '...'
  if (!unitClimateSensorObj.value) return undefined
  const value = formatMetric(unitClimateSensorObj.value, 'temperature', '°C')
  return value ? (hasPerGateClimateSensors.value ? `${value} ...` : value) : undefined
})

const unitHeaterTemp = computed(() => {
  if (!unitHeaterObj.value && gate.value >= 0) return undefined
  if (!unitHeaterObj.value && hasPerGateHeaters.value) return '...'
  const raw = unitHeaterObj.value?.target
  if (typeof raw !== 'number' || raw <= 0) return undefined
  const value = formatMetric(unitHeaterObj.value, 'target', '°C')
  return value ? (hasPerGateHeaters.value ? `${value} ...` : value) : undefined
})

const footerClasses = computed(() => ({
  'footer-row': true,
  'footer-dark-theme': vuetify.theme.dark,
  'footer-light-theme': !vuetify.theme.dark,
}))
</script>

<style scoped>
.footer-row {
   margin-left: -16px;
   margin-right: -16px;
}

.footer-light-theme {
    background: #f0f0f0;
}

.footer-dark-theme {
    background: #2c2c2c;
}

.mmu-logo {
    padding: 4px 12px 4px 0px;
    fill: currentColor;
    stroke: currentColor;
    opacity: 0.7;
}
</style>

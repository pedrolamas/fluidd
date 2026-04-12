<template>
  <div
    class="rounded-lg grey border-1"
    :class="containerClasses"
  >
    <v-row>
      <v-col
        class="pl-6 py-4 text-no-wrap"
      >
        <v-tooltip top>
          <template #activator="{ on, attr }">
            <span
              v-bind="attr"
              class="sensor-status rounded-circle d-inline-block mr-2"
              :class="preSensorClasses"
              v-on="on"
            />
          </template>
          <span>
            {{ preSensorOutput }}
          </span>
        </v-tooltip>
        <span>
          {{ $filters.prettyCase(name) }}
        </span>
        <v-tooltip
          v-if="hasPostSensor"
          top
        >
          <template #activator="{ on, attr }">
            <span
              v-bind="attr"
              class="sensor-status rounded-circle d-inline-block ml-2"
              :class="postSensorClasses"
              v-on="on"
            />
          </template>
          <span>
            {{ postSensorOutput }}
          </span>
        </v-tooltip>
      </v-col>
      <v-col class="py-4 text-center">
        {{ bufferOutput }}
      </v-col>
      <v-col class="py-4 pr-6 text-right">
        {{ state }}:
        <span :class="stateLaneClasses">
          {{ stateLane }}
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useVuetify } from '@/composables/useVuetify'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  name: string
}>()

const { printerPrinting } = useStateMixin()
const {
  afcCurrentLane, afcCurrentBuffer, afcCurrentState, afcErrorState,
  getAfcExtruderObject, getAfcExtruderSettings
} = useAfcMixin()
const vuetify = useVuetify()
const { t } = useI18n()

const afcExtruder = computed(() => getAfcExtruderObject(props.name))

const settings = computed(() => getAfcExtruderSettings(props.name))

const useRamming = computed(() => afcExtruder.value?.tool_start === 'buffer')

const hasActiveLane = computed(() => {
  const currentLane = afcCurrentLane.value
  if (currentLane == null) return false
  const lanes = afcExtruder.value?.lanes ?? []
  return lanes.includes(currentLane.name)
})

const containerClasses = computed(() => ({
  'border-primary': hasActiveLane.value,
  'border-error': hasActiveLane.value && afcErrorState.value,
  'darken-3': vuetify.theme.dark,
  'lighten-2': !vuetify.theme.dark,
}))

const rammingState = computed(() => {
  if (!useRamming.value) return false
  const extruder = afcCurrentLane.value?.extruder ?? ''
  const bufferState = (afcCurrentBuffer.value?.state ?? '').toLowerCase()
  return extruder === props.name && bufferState === 'trailing'
})

const laneLoaded = computed(() => afcExtruder.value?.lane_loaded ?? '')

const preSensorStatus = computed(() => afcExtruder.value?.tool_start_status === true)

const preSensorClasses = computed(() => {
  if (useRamming.value) {
    return {
      success: !laneLoaded.value && rammingState.value,
      error: !laneLoaded.value && !rammingState.value,
      'grey lighten4': laneLoaded.value,
    }
  }
  return {
    success: preSensorStatus.value,
    error: !preSensorStatus.value,
  }
})

const preSensorOutput = computed(() => {
  if (useRamming.value) {
    if (laneLoaded.value) return `${t('app.afc.RammingSensor')}`
    const status = rammingState.value ? t('app.afc.Detected') : t('app.afc.Empty')
    return `${t('app.afc.RammingSensor')} - ${status}`
  }
  const status = preSensorStatus.value ? t('app.afc.Detected') : t('app.afc.Empty')
  return `${t('app.afc.PreExtruderSensor')} - ${status}`
})

const hasPostSensor = computed(() =>
  settings.value != null && 'pin_tool_end' in settings.value
)

const postSensorStatus = computed(() => afcExtruder.value?.tool_end_status === true)

const postSensorClasses = computed(() => ({
  success: postSensorStatus.value,
  error: !postSensorStatus.value,
}))

const postSensorOutput = computed(() => {
  const status = postSensorStatus.value ? t('app.afc.Detected') : t('app.afc.Empty')
  return `${t('app.afc.PostExtruderSensor')} - ${status}`
})

const bufferOutput = computed(() => {
  const extruder = afcCurrentLane.value?.extruder
  if (extruder !== props.name) {
    return t('app.afc.BufferDisabled')
  }
  return `${afcCurrentLane.value?.buffer ?? '--'}: ${afcCurrentBuffer.value?.state ?? '--'}`
})

const state = computed(() => {
  const extruder = afcCurrentLane.value?.extruder
  if (extruder === props.name) {
    if (printerPrinting.value) {
      return t('app.afc.Printing')
    }
    return t(`app.afc.${afcCurrentState.value}`)
  }
  return t('app.afc.Idle')
})

const stateLane = computed(() => {
  if (afcExtruder.value?.lane_loaded) {
    return afcExtruder.value.lane_loaded
  }
  if (afcCurrentLane.value) {
    return afcCurrentLane.value.name
  }
  return t('app.afc.LaneLoadedNone')
})

const stateLaneClasses = computed(() => ({
  'primary--text': hasActiveLane.value,
  'error--text': hasActiveLane.value && afcErrorState.value,
}))
</script>

<style scoped>
.sensor-status {
  width: 10px;
  height: 10px;
}

.border-1 {
  border-width: 1px;
  border-style: solid;
}

.v-application .border-primary {
  border-color: var(--v-primary-base) !important;
}

.v-application .border-error {
  border-color: var(--v-error-base) !important;
}
</style>

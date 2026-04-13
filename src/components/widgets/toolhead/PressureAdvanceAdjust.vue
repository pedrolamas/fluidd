<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <app-named-slider
        :label="$t('app.general.label.pressure_advance')"
        suffix="s"
        :value="selectedExtruderStepper?.pressure_advance || 0"
        overridable
        :reset-value="selectedExtruderStepper?.config?.pressure_advance || 0"
        :disabled="!klippyReady"
        :locked="isMobileUserAgent"
        :loading="hasWait(`${Waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
        :min="0"
        :max="2"
        :step="0.0001"
        @submit="handleSetPressureAdvance"
      />
    </v-col>
    <v-col
      cols="12"
      sm="6"
    >
      <app-named-slider
        :label="$t('app.general.label.smooth_time')"
        suffix="s"
        :value="selectedExtruderStepper?.smooth_time || 0"
        :reset-value="selectedExtruderStepper?.config?.pressure_advance_smooth_time || 0"
        :disabled="!klippyReady"
        :locked="isMobileUserAgent"
        :loading="hasWait(`${Waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
        :min="0"
        :max="0.2"
        :step="0.001"
        @submit="handleSetSmoothTime"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { Waits } from '@/globals'
import type { ExtruderStepper } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  extruderStepper?: ExtruderStepper
}>()

const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { activeExtruder } = useToolheadMixin()
const { isMobileUserAgent } = useBrowserMixin()

const selectedExtruderStepper = computed(() => props.extruderStepper ?? activeExtruder.value)

function handleSetPressureAdvance (val: number) {
  sendSetPressureAdvance('ADVANCE', val)
}

function handleSetSmoothTime (val: number) {
  sendSetPressureAdvance('SMOOTH_TIME', val)
}

function sendSetPressureAdvance (arg: string, val: number) {
  if (props.extruderStepper) {
    const { name } = props.extruderStepper
    sendGcode(`SET_PRESSURE_ADVANCE ${arg}=${val} EXTRUDER=${encodeGcodeParamValue(name)}`, `${Waits.onSetPressureAdvance}${name}`)
  } else {
    sendGcode(`SET_PRESSURE_ADVANCE ${arg}=${val}`, Waits.onSetPressureAdvance)
  }
}
</script>

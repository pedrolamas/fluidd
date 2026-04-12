<template>
  <v-row
    no-gutters
    class="mb-2"
  >
    <v-col>
      <app-up-down-btn-group
        :values="values"
        color="error"
        class="d-flex"
        @click="sendForceMoveGcode($event)"
      >
        <div class="v-btn v-size--default btncolor flex-grow-1">
          {{ stepper.prettyName }}
        </div>
      </app-up-down-btn-group>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import type { Stepper } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  stepper: Stepper
}>()

const { sendGcode } = useStateMixin()
const { typedState, typedGetters } = useStore()

const values: number[] = [1, 10, 50]

const isStepperZ = computed((): boolean => props.stepper.key.startsWith('stepper_z'))

const printerSettings = computed((): Klipper.SettingsState => typedGetters['printer/getPrinterSettings'])

const rate = computed((): number =>
  isStepperZ.value
    ? typedState.config.uiSettings.general.defaultToolheadZSpeed
    : typedState.config.uiSettings.general.defaultToolheadXYSpeed
)

const accel = computed((): number =>
  isStepperZ.value
    ? printerSettings.value.printer?.max_z_accel ?? 100
    : typedState.printer.printer.toolhead.max_accel
)

function sendForceMoveGcode (distance: number) {
  sendGcode(`FORCE_MOVE STEPPER=${encodeGcodeParamValue(props.stepper.key)} DISTANCE=${distance} VELOCITY=${rate.value} ACCEL=${accel.value}`)
}
</script>

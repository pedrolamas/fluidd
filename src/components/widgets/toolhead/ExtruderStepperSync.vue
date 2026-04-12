<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <app-named-select
        :value="extruderStepper.motion_queue"
        :label="$t('app.general.label.synced_extruder')"
        :items="[
          { name: $t('app.setting.label.none'), key: null },
          ...availableExtruders
        ]"
        :disabled="!klippyReady || printerPrinting"
        :loading="hasWait(`${Waits.onSyncExtruder}${extruderStepper.name}`)"
        :reset-value="extruderStepper.config?.extruder"
        item-value="key"
        item-text="name"
        @change="sendSyncExtruderMotion"
      />
    </v-col><v-col
      v-if="extruderStepper.enabled !== undefined"
      cols="12"
      sm="6"
    >
      <app-named-switch
        :value="extruderStepper.enabled"
        :label="$t('app.general.label.stepper_enabled')"
        :disabled="!klippyReady || printerPrinting || extruderStepper.disconnected"
        :loading="hasWait(`${Waits.onStepperEnable}${extruderStepper.name}`)"
        @change="sendSetStepperEnable"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import type { KnownExtruder, ExtruderStepper } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  extruderStepper: ExtruderStepper
}>()

const { klippyReady, printerPrinting, hasWait, sendGcode } = useStateMixin()
const { typedGetters } = useStore()

const availableExtruders = computed((): KnownExtruder[] => typedGetters['printer/getExtruders'])

function sendSyncExtruderMotion (value: string | null) {
  sendGcode(`SYNC_EXTRUDER_MOTION EXTRUDER=${encodeGcodeParamValue(props.extruderStepper.name)} MOTION_QUEUE=${value ?? ''}`, `${Waits.onSyncExtruder}${props.extruderStepper.name}`)
}

function sendSetStepperEnable (value: boolean) {
  sendGcode(`SET_STEPPER_ENABLE STEPPER=${encodeGcodeParamValue(props.extruderStepper.key)} ENABLE=${+value}`, `${Waits.onStepperEnable}${props.extruderStepper.name}`)
}
</script>

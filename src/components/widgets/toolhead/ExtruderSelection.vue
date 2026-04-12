<template>
  <v-select
    v-model="extruder"
    :items="extruders"
    :readonly="printerPrinting"
    :disabled="!klippyReady || printerPrinting"
    item-value="key"
    item-text="name"
    hide-details
    outlined
    dense
    class="mb-2 v-input--x-dense"
    style="max-width: 256px;"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'
import type { KnownExtruder } from '@/store/printer/types'

const { klippyReady, printerPrinting, sendGcode } = useStateMixin()
const { typedState, typedGetters } = useStore()

const extruders = computed((): KnownExtruder[] => typedGetters['printer/getExtruders'])

const extruder = computed({
  get: (): string => typedState.printer.printer.toolhead.extruder,
  set: (value: string) => {
    sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${encodeGcodeParamValue(value)}`, Waits.onExtruderChange)
  }
})
</script>

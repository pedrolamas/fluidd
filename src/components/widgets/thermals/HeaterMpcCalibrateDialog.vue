<template>
  <app-dialog
    v-model="open"
    :title="$t('app.chart.title.mpc_calibrate', { name: heater.prettyName })"
    max-width="480"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="$t('app.chart.label.target_temperature')">
        <v-text-field
          v-model.number="targetTemperature"
          type="number"
          filled
          dense
          single-line
          hide-details="auto"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThan(0)
          ]"
          suffix="°C"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.chart.label.fan_breakpoints')">
        <v-text-field
          v-model.number="fanBreakpoints"
          type="number"
          filled
          dense
          single-line
          hide-details="auto"
          :rules="[
            $rules.numberValid,
            $rules.numberGreaterThan(0)
          ]"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Heater } from '@/store/printer/types'
import type { NullableOrEmpty } from '@/util/is-null-or-empty'

const props = defineProps<{
  heater: Heater
}>()

const emit = defineEmits<{
  (e: 'save', heater: Heater, targetTemperature: number, fanBreakpoints: NullableOrEmpty<number>): void
}>()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const targetTemperature = ref(100)
const fanBreakpoints = ref<NullableOrEmpty<number>>(null)

function handleSave () {
  emit('save', props.heater, targetTemperature.value, fanBreakpoints.value)
  open.value = false
}
</script>

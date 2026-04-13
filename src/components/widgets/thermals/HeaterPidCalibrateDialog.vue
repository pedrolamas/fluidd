<template>
  <app-dialog
    v-model="open"
    :title="$t('app.chart.title.pid_calibrate', { name: heater.prettyName })"
    max-width="480"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="$t('app.chart.label.target_temperature')">
        <app-text-field
          v-model.number="targetTemperature"
          type="number"
          autofocus
          dense
          filled
          hide-details="auto"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThan(0)
          ]"
          suffix="°C"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Heater } from '@/store/printer/types'

const props = defineProps<{
  heater: Heater
}>()

const emit = defineEmits<{
  (e: 'save', heater: Heater, targetTemperature: number): void
}>()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const targetTemperature = ref(100)

function handleSave () {
  emit('save', props.heater, targetTemperature.value)
  open.value = false
}
</script>

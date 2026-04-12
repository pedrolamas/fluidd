<template>
  <app-dialog
    v-model="open"
    :title="(preset.id != -1) ? t('app.general.label.edit_preset') : t('app.general.label.add_preset')"
    max-width="500"
    :save-button-text="(preset.id !== -1) ? t('app.general.btn.save') : t('app.general.btn.add')"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="t('app.setting.label.thermal_preset_name')">
        <v-text-field
          v-model="preset.name"
          :rules="[
            Rules.required
          ]"
          hide-details="auto"
          filled
          dense
        />
      </app-setting>

      <v-divider />

      <template v-for="(item, i) in heaters">
        <app-setting
          :key="`${i}heater`"
          :title="Filters.prettyCase(item.name)"
        >
          <v-checkbox
            v-model="preset.values[item.name].active"
            hide-details
          />

          <v-text-field
            v-model.number="preset.values[item.name].value"
            :disabled="!preset.values[item.name].active"
            :rules="preset.values[item.name].active ? [
              Rules.required,
              Rules.numberValid,
              Rules.numberGreaterThan(0)
            ] : undefined"
            hide-details="auto"
            type="number"
            suffix="°C"
            filled
            dense
          />
        </app-setting>

        <v-divider :key="i + 'heaterd'" />
      </template>

      <template v-for="(item, i) in fans">
        <app-setting
          :key="`${i}fan`"
          :title="Filters.prettyCase(item.name)"
        >
          <v-checkbox
            v-model="preset.values[item.name].active"
            hide-details
          />

          <v-text-field
            v-model.number="preset.values[item.name].value"
            :disabled="!preset.values[item.name].active"
            :rules="preset.values[item.name].active ? [
              Rules.required,
              Rules.numberValid,
              Rules.numberGreaterThan(0)
            ] : undefined"
            hide-details="auto"
            type="number"
            suffix="°C"
            filled
            dense
          />
        </app-setting>

        <v-divider :key="i + 'fand'" />
      </template>

      <app-setting :title="t('app.setting.label.thermal_preset_gcode')">
        <v-textarea
          v-model="preset.gcode"
          rows="2"
          hide-details="auto"
          filled
          spellcheck="false"
          class="console-command"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Filters, Rules } from '@/plugins/filters'
import type { TemperaturePreset } from '@/store/config/types'
import type { Fan, Heater } from '@/store/printer/types'

const props = defineProps<{
  value?: boolean
  preset: TemperaturePreset
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'save', preset: TemperaturePreset): void
}>()

const open = computed({
  get: () => props.value,
  set: (value) => emit('input', value ?? false)
})

const preset = reactive<TemperaturePreset>(JSON.parse(JSON.stringify(props.preset)))

watch(() => props.preset, (v) => Object.assign(preset, JSON.parse(JSON.stringify(v))), { deep: true })

const { typedGetters, store } = useStore()
const { t } = useI18n()

const heaters = computed((): Heater[] => typedGetters['printer/getHeaters'])

const fans = computed((): Fan[] => store.getters['printer/getOutputs'](['temperature_fan']))

function handleSave () {
  emit('save', { ...preset })
  open.value = false
}
</script>

<style lang="scss" scoped>
  .console-command {
    font-family: monospace;
  }
</style>

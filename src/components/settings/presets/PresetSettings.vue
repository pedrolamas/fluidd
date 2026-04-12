<template>
  <div>
    <v-subheader id="presets">
      {{ t('app.setting.title.thermal_presets') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          @click="openAddDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ t('app.setting.btn.add_thermal_preset') }}
        </app-btn>
      </app-setting>

      <v-divider v-if="presets.length > 0" />

      <template v-for="(preset, i) in presets">
        <app-setting
          :key="`preset${i}`"
          :title="preset.name"
          :r-cols="2"
        >
          <template #sub-title>
            <span
              v-for="(value, k) in preset.values"
              v-show="value.active"
              :key="k"
              class="mr-2"
            >
              {{ k }}: {{ value.value }}<small>°C</small>
            </span>
          </template>

          <app-btn
            icon
            @click.stop="openEditDialog(preset)"
          >
            <v-icon dense>
              $edit
            </v-icon>
          </app-btn>

          <app-btn
            icon
            @click.stop="handleRemovePreset(preset)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </app-setting>

        <v-divider
          v-if="i < presets.length - 1 && presets.length > 0"
          :key="preset.id"
        />
      </template>

      <preset-dialog
        v-if="dialogState.active"
        v-model="dialogState.active"
        :preset="dialogState.preset"
        @save="handleSavePreset"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import PresetDialog from './PresetDialog.vue'
import type { TemperaturePreset } from '@/store/config/types'
import type { Fan, Heater } from '@/store/printer/types'

const { store, typedGetters, typedDispatch } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()

const dialogState = reactive<{ active: boolean; preset: TemperaturePreset | null }>({
  active: false,
  preset: null
})

const heaters = computed((): Heater[] => typedGetters['printer/getHeaters'])

const fans = computed((): Fan[] => store.getters['printer/getOutputs'](['temperature_fan']))

const presets = computed((): TemperaturePreset[] => typedGetters['config/getTempPresets'])

function openEditDialog (preset: TemperaturePreset) {
  dialogState.active = true
  dialogState.preset = preset
}

function openAddDialog () {
  const preset: any = {
    id: -1,
    name: '',
    values: {}
  }
  for (const item of heaters.value) {
    preset.values[item.name] = { value: 0, type: 'heater', active: true }
  }
  for (const item of fans.value) {
    preset.values[item.name] = { value: 0, type: 'fan', active: true }
  }
  dialogState.active = true
  dialogState.preset = preset
}

function handleSavePreset (preset: TemperaturePreset) {
  typedDispatch('config/updatePreset', preset)
}

async function handleRemovePreset (preset: TemperaturePreset) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_thermal_preset', { name: preset.name }),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    typedDispatch('config/removePreset', preset)
  }
}
</script>

<style lang="scss" scoped>
  .presets-table table > tbody > tr > td {
    padding-top: 8px;
    padding-bottom: 8px;
    vertical-align: top;
  }
</style>

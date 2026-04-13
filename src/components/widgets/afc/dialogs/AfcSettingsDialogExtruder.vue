<template>
  <v-card outlined>
    <v-card-title>{{ $t('app.afc.SettingsDialog.SettingsForTitle', { name: $filters.prettyCase(name) }) }}</v-card-title>

    <v-card-text>
      <app-setting
        :title="$t('app.afc.SettingsDialog.LoadUnloadLane')"
        :sub-title="$t('app.afc.SettingsDialog.LoadUnloadLaneDescription')"
      >
        <div class="d-flex flex-wrap">
          <v-btn
            v-for="lane in lanes"
            :key="lane"
            :disabled="!filledLanes.includes(lane)"
            small
            class="ma-1"
            :color="lane_loaded === lane ? 'primary' : ''"
            @click="toggleLane(lane)"
          >
            {{ lane }}
          </v-btn>
        </div>
      </app-setting>
      <v-divider />
      <app-setting
        :title="$t('app.afc.SettingsDialog.ToolStn')"
        :sub-title="toolStnSubTitle"
      >
        <app-named-text-field
          label="tool_stn"
          :value="currentToolStn"
          :reset-value="settingsToolStn"
          suffix="mm"
          submit-on-change
          @submit="updateToolheadSensors('TOOL_STN', Number($event))"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.afc.SettingsDialog.ToolStnUnload')"
        :sub-title="$t('app.afc.SettingsDialog.ToolStnUnloadDescription')"
      >
        <app-named-text-field
          label="tool_stn_unload"
          :value="currentToolStnUnload"
          :reset-value="settingsToolStnUnload"
          suffix="mm"
          submit-on-change
          @submit="updateToolheadSensors('TOOL_STN_UNLOAD', Number($event))"
        />
      </app-setting>

      <template v-if="existsToolEndSensor">
        <v-divider />

        <app-setting
          :title="$t('app.afc.SettingsDialog.ToolSensorAfterExtruder')"
          :sub-title="$t('app.afc.SettingsDialog.ToolSensorAfterExtruderDescription')"
        >
          <app-named-text-field
            label="tool_sensor_after_extruder"
            :value="currentToolSensorAfterExtruder"
            :reset-value="settingsToolSensorAfterExtruder"
            suffix="mm"
            submit-on-change
            @submit="updateToolheadSensors('TOOL_AFTER_EXTRUDER', Number($event))"
          />
        </app-setting>
      </template>

      <v-divider />

      <app-setting
        :title="$t('app.afc.SettingsDialog.SaveExtruderValues')"
        :sub-title="$t('app.afc.SettingsDialog.SaveExtruderValuesDescription')"
      >
        <v-btn
          :disabled="!enableSaveButton"
          color="primary"
          @click="saveExtruderValues"
        >
          {{ $t('app.afc.SettingsDialog.WriteToFile') }}
        </v-btn>
      </app-setting>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useI18n } from '@/composables/useI18n'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  name: string
}>()

const { sendGcode } = useStateMixin()
const { getAfcExtruderSettings, getAfcExtruderObject, getAfcLaneObject } = useAfcMixin()
const { t } = useI18n()

const changedValue = ref(false)

const afcSettingsExtruder = computed((): Klipper.AfcExtruderSettings | undefined =>
  getAfcExtruderSettings(props.name)
)

const settingsToolStn = computed(() => afcSettingsExtruder.value?.tool_stn || 0)

const settingsToolStnUnload = computed(() => afcSettingsExtruder.value?.tool_stn_unload || 0)

const settingsToolSensorAfterExtruder = computed(() =>
  afcSettingsExtruder.value?.tool_sensor_after_extruder || 0
)

const printerObject = computed((): Klipper.AfcExtruderState | undefined =>
  getAfcExtruderObject(props.name)
)

const currentToolStn = computed(() => printerObject.value?.tool_stn || 0)

const currentToolStnUnload = computed(() => printerObject.value?.tool_stn_unload || 0)

const currentToolSensorAfterExtruder = computed(() =>
  printerObject.value?.tool_sensor_after_extruder || 0
)

const lanes = computed(() => printerObject.value?.lanes ?? [])

const lane_loaded = computed(() => printerObject.value?.lane_loaded ?? '')

const filledLanes = computed(() => {
  const filled: string[] = []
  for (const lane of lanes.value) {
    const laneObject = getAfcLaneObject(lane)
    if (laneObject?.load && laneObject.prep) {
      filled.push(lane)
    }
  }
  return filled
})

const existsToolEndSensor = computed(() =>
  afcSettingsExtruder.value != null && 'pin_tool_end' in afcSettingsExtruder.value
)

const toolStnSubTitle = computed(() => {
  if (existsToolEndSensor.value) {
    return t('app.afc.SettingsDialog.ToolStnDescriptionWithEndSensor')
  }
  if (afcSettingsExtruder.value?.pin_tool_start === 'buffer') {
    return t('app.afc.SettingsDialog.ToolStnDescriptionWithRamming')
  }
  return t('app.afc.SettingsDialog.ToolStnDescriptionWithoutEndSensor')
})

const enableSaveButton = computed(() =>
  changedValue.value && (
    currentToolStn.value !== settingsToolStn.value ||
    currentToolStnUnload.value !== settingsToolStnUnload.value ||
    currentToolSensorAfterExtruder.value !== settingsToolSensorAfterExtruder.value
  )
)

function toggleLane (lane: string) {
  if (lane_loaded.value === lane) {
    sendGcode(`TOOL_UNLOAD LANE=${encodeGcodeParamValue(lane)}`)
    return
  }
  sendGcode(`CHANGE_TOOL LANE=${encodeGcodeParamValue(lane)}`)
}

function updateToolheadSensors (name: string, value: number) {
  changedValue.value = true
  sendGcode(`UPDATE_TOOLHEAD_SENSORS EXTRUDER=${encodeGcodeParamValue(props.name)} ${name}=${value}`)
}

function saveExtruderValues () {
  changedValue.value = false
  sendGcode(`SAVE_EXTRUDER_VALUES EXTRUDER=${encodeGcodeParamValue(props.name)}`)
}
</script>

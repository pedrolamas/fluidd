<template>
  <v-card outlined>
    <v-card-title>{{ $t('app.afc.SettingsDialog.SettingsForTitle', { name: $filters.prettyCase(name) }) }}</v-card-title>

    <v-card-text>
      <app-setting
        :title="$t('app.afc.SettingsDialog.DistHub')"
        :sub-title="$t('app.afc.SettingsDialog.DistHubDescription')"
      >
        <app-named-text-field
          label="dist_hub"
          :value="currentDistHub"
          :reset-value="settingsDistHub"
          suffix="mm"
          submit-on-change
          @submit="setHubDist"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.afc.SettingsDialog.SaveHubDist')"
        :sub-title="$t('app.afc.SettingsDialog.SaveHubDistDescription')"
      >
        <v-btn
          :disabled="!enableSaveButton"
          color="primary"
          @click="saveHubDist"
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
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  name: string
}>()

const { sendGcode } = useStateMixin()
const { getAfcLaneSettings, getAfcLaneObject } = useAfcMixin()

const changedValue = ref(false)

const afcSettingsLane = computed((): Klipper.AfcLaneSettings | Klipper.AfcStepperSettings | undefined =>
  getAfcLaneSettings(props.name)
)

const afcLane = computed((): Klipper.AfcLaneState | undefined =>
  getAfcLaneObject(props.name)
)

const settingsDistHub = computed(() =>
  (
    afcSettingsLane.value != null &&
    'dist_hub' in afcSettingsLane.value &&
    afcSettingsLane.value.dist_hub
  ) || 0
)

const currentDistHub = computed(() =>
  (
    afcLane.value != null &&
    'dist_hub' in afcLane.value &&
    afcLane.value.dist_hub
  ) || 0
)

const enableSaveButton = computed(() =>
  changedValue.value && currentDistHub.value !== settingsDistHub.value
)

function setHubDist (value: number) {
  changedValue.value = true
  sendGcode(`SET_HUB_DIST LANE=${encodeGcodeParamValue(props.name)} LENGTH=${value}`)
}

function saveHubDist () {
  changedValue.value = false
  sendGcode(`SAVE_HUB_DIST LANE=${encodeGcodeParamValue(props.name)}`)
}
</script>

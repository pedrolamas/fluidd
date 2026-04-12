<template>
  <div>
    <v-subheader id="timelapse">
      {{ $t('app.general.title.timelapse') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        :title="$tc('app.general.title.camera', 1)"
        :sub-title="subtitleIfBlocked(cameraBlocked)"
      >
        <v-select
          v-model="camera"
          filled
          dense
          single-line
          hide-details="auto"
          :items="cameras"
          :disabled="cameraBlocked"
        />
      </app-setting>
      <v-divider />

      <app-setting
        :title="$t('app.timelapse.setting.mode')"
        :sub-title="subtitleIfBlocked(modeBlocked)"
      >
        <v-select
          v-model="mode"
          filled
          dense
          single-line
          hide-details="auto"
          :items="supportedModes"
          :disabled="modeBlocked"
        />
      </app-setting>

      <hyperlapse-settings v-if="mode === 'hyperlapse'" />

      <toolhead-parking-settings />

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.stream_delay_compensation')"
        :sub-title="subtitleIfBlocked(delayCompBlocked)"
      >
        <app-text-field
          :value="delayComp"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="delayCompBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="ms"
          submit-on-change
          @submit="setDelayComp"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.gcode_verbose')"
        :sub-title="subtitleIfBlocked(verboseGcodeBlocked)"
      >
        <v-switch
          v-model="verboseGcode"
          hide-details
          :disabled="verboseGcodeBlocked"
          @click.native.stop
        />
      </app-setting>

      <v-divider />
      <app-setting :title="$tc('app.timelapse.title.render_settings')">
        <app-btn
          outlined
          small
          color="primary"
          @click="renderSettingsDialogOpen = true"
        >
          <v-icon
            small
            left
          >
            $pencil
          </v-icon>
          {{ $t('app.general.btn.edit') }}
        </app-btn>
      </app-setting>

      <v-divider />
      <app-setting :title="$t('app.setting.label.reset')">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleReset"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
      </app-setting>
    </v-card>

    <timelapse-render-settings-dialog
      v-if="renderSettingsDialogOpen"
      v-model="renderSettingsDialogOpen"
      :renderable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Rules } from '@/plugins/filters'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'
import HyperlapseSettings from '@/components/settings/timelapse/subsettings/modes/HyperlapseSettings.vue'
import ToolheadParkingSettings from '@/components/settings/timelapse/subsettings/ToolheadParkingSettings.vue'
import TimelapseRenderSettingsDialog from '@/components/widgets/timelapse/TimelapseRenderSettingsDialog.vue'

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

const renderSettingsDialogOpen = ref(false)

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const supportedModes = computed((): { text: string, value: Moonraker.Timelapse.TimelapseMode }[] => [
  { text: tc('app.timelapse.setting.mode_layermacro'), value: 'layermacro' },
  { text: tc('app.timelapse.setting.mode_hyperlapse'), value: 'hyperlapse' },
])

const cameras = computed((): Array<{ text?: string, value: string, disabled: boolean }> => {
  const webcams: Moonraker.Webcam.Entry[] = typedGetters['webcams/getWebcams']

  return webcams.map(cam => ({
    text: cam.name,
    value: cam.uid,
    disabled: !cam.enabled
  }))
})

const cameraBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('camera')
)

const camera = computed({
  get: (): string => settings.value.camera,
  set: (value: string) => {
    SocketActions.machineTimelapsePostSettings({ camera: value })
  }
})

const modeBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('mode')
)

const mode = computed({
  get: (): Moonraker.Timelapse.TimelapseMode => settings.value.mode,
  set: (value: Moonraker.Timelapse.TimelapseMode) => {
    SocketActions.machineTimelapsePostSettings({ mode: value })
  }
})

const delayCompBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('stream_delay_compensation')
)

const delayComp = computed((): number => settings.value.stream_delay_compensation * 1000)

function setDelayComp (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ stream_delay_compensation: Number(value) / 1000 })
}

const verboseGcodeBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('gcode_verbose')
)

const verboseGcode = computed({
  get: (): boolean => settings.value.gcode_verbose,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ gcode_verbose: value })
  }
})

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}

function handleReset () {
  const nonBlockedEntries = Object.entries(defaultWritableSettings)
    .filter(([key]) => !typedGetters['timelapse/isBlockedSetting'](key))

  SocketActions.machineTimelapsePostSettings(Object.fromEntries(nonBlockedEntries))
}
</script>

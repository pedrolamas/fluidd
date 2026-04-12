<template>
  <div>
    <v-subheader id="spoolman">
      {{ t('app.spoolman.title.spoolman') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        :title="t('app.spoolman.setting.show_spool_selection_dialog_on_print_start')"
      >
        <v-switch
          v-model="autoSpoolSelectionDialog"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="tc('app.spoolman.setting.auto_open_qr_camera')"
      >
        <v-select
          v-model="autoOpenQRDetectionCameraId"
          filled
          dense
          single-line
          hide-details="auto"
          :items="supportedCameras"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="t('app.spoolman.setting.prefer_device_camera')"
      >
        <v-switch
          v-model="preferDeviceCamera"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="t('app.spoolman.setting.auto_select_spool_on_match')"
      >
        <v-switch
          v-model="autoSelectSpoolOnMatch"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="t('app.spoolman.setting.warn_on_not_enough_filament')"
      >
        <v-switch
          v-model="warnOnNotEnoughFilament"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="t('app.spoolman.setting.warn_on_filament_type_mismatch')"
      >
        <v-switch
          v-model="warnOnFilamentTypeMismatch"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="tc('app.spoolman.setting.remaining_filament_unit')"
      >
        <v-select
          v-model="remainingFilamentUnit"
          filled
          dense
          single-line
          hide-details="auto"
          :items="[
            {text: tc('app.spoolman.label.weight'), value: 'weight'},
            {text: tc('app.spoolman.label.length'), value: 'length'}
          ]"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="t('app.spoolman.setting.card_fields')"
      >
        <v-select
          v-model="fieldsToShowInSpoolmanCard"
          multiple
          filled
          dense
          hide-details="auto"
          :rules="[
            Rules.lengthGreaterThanOrEqual(1),
          ]"
          :items="availableFieldsToShowInSpoolmanCard"
        />
      </app-setting>

      <v-divider />
      <app-setting :title="t('app.setting.label.reset')">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleReset"
        >
          {{ t('app.setting.btn.reset') }}
        </app-btn>
      </app-setting>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultState } from '@/store/config/state'
import { Rules } from '@/plugins/filters'
import type { SpoolmanRemainingFilamentUnit } from '@/store/config/types'

const { typedState, typedGetters, typedDispatch } = useStore()
const { t, tc } = useI18n()

const autoSpoolSelectionDialog = computed({
  get: (): boolean => typedState.config.uiSettings.spoolman.autoSpoolSelectionDialog,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.autoSpoolSelectionDialog',
      value,
      server: true
    })
  }
})

const enabledWebcams = computed((): Moonraker.Webcam.Entry[] => typedGetters['webcams/getEnabledWebcams'])

const supportedCameras = computed((): Array<{ text?: string; value: string | null; disabled?: boolean }> => [
  {
    text: tc('app.setting.label.none'),
    value: null
  },
  ...enabledWebcams.value
    .map(camera => ({
      text: camera.name,
      value: camera.uid,
      disabled: camera.service === 'iframe'
    }))
])

const autoOpenQRDetectionCameraId = computed({
  get: (): string | null => typedState.config.uiSettings.spoolman.autoOpenQRDetectionCamera,
  set: (value: string | null) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.autoOpenQRDetectionCamera',
      value,
      server: true
    })
  }
})

const preferDeviceCamera = computed({
  get: (): boolean => typedState.config.uiSettings.spoolman.preferDeviceCamera,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.preferDeviceCamera',
      value,
      server: true
    })
  }
})

const autoSelectSpoolOnMatch = computed({
  get: (): boolean => typedState.config.uiSettings.spoolman.autoSelectSpoolOnMatch,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.autoSelectSpoolOnMatch',
      value,
      server: true
    })
  }
})

const warnOnNotEnoughFilament = computed({
  get: (): boolean => typedState.config.uiSettings.spoolman.warnOnNotEnoughFilament,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.warnOnNotEnoughFilament',
      value,
      server: true
    })
  }
})

const warnOnFilamentTypeMismatch = computed({
  get: (): boolean => typedState.config.uiSettings.spoolman.warnOnFilamentTypeMismatch,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.warnOnFilamentTypeMismatch',
      value,
      server: true
    })
  }
})

const remainingFilamentUnit = computed({
  get: (): SpoolmanRemainingFilamentUnit => typedState.config.uiSettings.spoolman.remainingFilamentUnit,
  set: (value: SpoolmanRemainingFilamentUnit) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.remainingFilamentUnit',
      value,
      server: true
    })
  }
})

const availableFieldsToShowInSpoolmanCard = computed(() =>
  [
    'id',
    'vendor',
    'filament_name',
    'remaining_weight',
    'used_weight',
    'location',
    'material',
    'lot_nr',
    'price',
    'density',
    'diameter',
    'extruder_temp',
    'bed_temp',
    'first_used',
    'last_used',
    'comment'
  ].map(field => ({
    value: field,
    text: field === 'remaining_weight'
      ? t('app.spoolman.label.remaining')
      : field === 'used_weight'
        ? t('app.spoolman.label.used')
        : t(`app.spoolman.label.${field}`)
  }))
)

const fieldsToShowInSpoolmanCard = computed({
  get: (): string[] => typedState.config.uiSettings.spoolman.selectedCardFields,
  set: (value: string[]) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.spoolman.selectedCardFields',
      value,
      server: true
    })
  }
})

function handleReset () {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.spoolman',
    value: defaultState().uiSettings.spoolman,
    server: true
  })
}
</script>

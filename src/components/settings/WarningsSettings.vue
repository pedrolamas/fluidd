<template>
  <div>
    <v-subheader id="warnings">
      {{ t('app.setting.title.warnings') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        :title="t('app.setting.label.warn_on_cpu_throttled')"
        :sub-title="t('app.setting.tooltip.warn_on_cpu_throttled')"
      >
        <v-switch
          v-model="warnOnCpuThrottled"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="t('app.setting.label.warn_on_stepper_driver_overheating')"
        :sub-title="t('app.setting.tooltip.warn_on_stepper_driver_overheating')"
      >
        <v-switch
          v-model="warnOnStepperDriverOverheating"
          hide-details
          @click.native.stop
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

const { typedState, typedDispatch } = useStore()
const { t } = useI18n()

const warnOnCpuThrottled = computed({
  get: (): boolean => typedState.config.uiSettings.warnings.warnOnCpuThrottled,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.warnings.warnOnCpuThrottled',
      value,
      server: true
    })
  }
})

const warnOnStepperDriverOverheating = computed({
  get: (): boolean => typedState.config.uiSettings.warnings.warnOnStepperDriverOverheating,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.warnings.warnOnStepperDriverOverheating',
      value,
      server: true
    })
  }
})

function handleReset () {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.warnings',
    value: defaultState().uiSettings.warnings,
    server: true
  })
}
</script>

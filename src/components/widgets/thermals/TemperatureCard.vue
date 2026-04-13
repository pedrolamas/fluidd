<template>
  <collapsable-card
    :title="$t('app.general.title.temperature')"
    icon="$fire"
    :help-tooltip="$t('app.chart.tooltip.help')"
    :lazy="false"
    draggable
    layout-path="dashboard.temperature-card"
  >
    <template #menu>
      <app-btn-collapse-group :collapsed="narrow">
        <temperature-presets-menu
          @applyOff="handleApplyOff"
          @applyPreset="handleApplyPreset"
        />
      </app-btn-collapse-group>

      <v-menu
        bottom
        left
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="false"
      >
        <template #activator="{ on, attrs }">
          <app-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon dense>
              $cog
            </v-icon>
          </app-btn>
        </template>

        <v-list dense>
          <v-list-item @click="chartVisible = !chartVisible">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="chartVisible" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_chart') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showRateOfChange = !showRateOfChange">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showRateOfChange" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_rate_of_change') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showRelativeHumidity = !showRelativeHumidity">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showRelativeHumidity" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_relative_humidity') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showBarometricPressure = !showBarometricPressure">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showBarometricPressure" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_barometric_pressure') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showGasResistance = !showGasResistance">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showGasResistance" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_gas_resistance') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <temperature-targets
      @updateChartSelectedLegends="updateChartSelectedLegends"
    />

    <template v-if="chartReady && chartVisible">
      <v-divider />

      <thermal-chart
        ref="thermalChartElement"
        :narrow="narrow"
      />
    </template>
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'

import ThermalChart from '@/components/widgets/thermals/ThermalChart.vue'
import TemperatureTargets from '@/components/widgets/thermals/TemperatureTargets.vue'
import TemperaturePresetsMenu from './TemperaturePresetsMenu.vue'
import type { TemperaturePreset } from '@/store/config/types'
import type { ChartSelectedLegends } from '@/store/charts/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

defineProps<{
  narrow?: boolean
}>()

const { typedState, typedDispatch } = useStore()
const { klippyReady, printerState, sendGcode } = useStateMixin()
const confirm = useConfirm()
const { tc } = useI18n()

const thermalChartElement = ref<InstanceType<typeof ThermalChart>>()

const chartReady = computed(() =>
  typedState.socket.acceptingNotifications &&
  typedState.socket.ready &&
  typedState.charts.ready &&
  klippyReady.value
)

function updateChartSelectedLegends (chartSelectedLegends: ChartSelectedLegends) {
  if (chartVisible.value) {
    thermalChartElement.value?.updateChartSelectedLegends(chartSelectedLegends)
  }
}

const chartVisible = computed({
  get: () => typedState.config.uiSettings.general.chartVisible,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.chartVisible',
    value,
    server: true
  })
})

const showRateOfChange = computed({
  get: () => typedState.config.uiSettings.general.showRateOfChange,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showRateOfChange',
    value,
    server: true
  })
})

const showRelativeHumidity = computed({
  get: () => typedState.config.uiSettings.general.showRelativeHumidity,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showRelativeHumidity',
    value,
    server: true
  })
})

const showBarometricPressure = computed({
  get: () => typedState.config.uiSettings.general.showBarometricPressure,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showBarometricPressure',
    value,
    server: true
  })
})

const showGasResistance = computed({
  get: () => typedState.config.uiSettings.general.showGasResistance,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showGasResistance',
    value,
    server: true
  })
})

function handleApplyPreset (preset: TemperaturePreset) {
  if (preset) {
    if (preset.values) {
      for (const key in preset.values) {
        const item = preset.values[key]
        if (item.type === 'heater' && item.active && item.value > -1) {
          sendGcode(`SET_HEATER_TEMPERATURE HEATER=${encodeGcodeParamValue(key)} TARGET=${item.value}`)
        }
        if (item.type === 'fan' && item.active && item.value > -1) {
          sendGcode(`SET_TEMPERATURE_FAN_TARGET TEMPERATURE_FAN=${encodeGcodeParamValue(key)} TARGET=${item.value}`)
        }
      }
    }

    if (preset.gcode) {
      sendGcode(preset.gcode)
    }
  }
}

async function handleApplyOff () {
  const result = (
    !['printing', 'busy', 'paused'].includes(printerState.value) ||
    await confirm(
      tc('app.general.label.heaters_busy'),
      { title: tc('app.general.simple_form.msg.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    sendGcode('TURN_OFF_HEATERS')
  }
}
</script>

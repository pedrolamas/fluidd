<template>
  <div>
    <v-simple-table class="temperature-table">
      <thead>
        <tr>
          <th />
          <th width="100%">
            {{ $t('app.chart.label.item') }}
          </th>
          <th>
            {{ $t('app.chart.label.power') }}
          </th>
          <th
            v-if="showRateOfChange"
          >
            {{ $t('app.chart.label.rate_of_change') }}
          </th>
          <th>
            {{ $t('app.chart.label.current') }}
          </th>
          <th />
          <th>
            {{ $t('app.chart.label.target') }}
          </th>
        </tr>
      </thead>
      <tbody v-if="klippyReady">
        <tr
          v-for="item in heaters"
          :key="item.key"
          @contextmenu.prevent="handleHeaterRowClick(item, $event)"
        >
          <td>
            <v-icon
              small
              :color="item.color"
            >
              $fire
            </v-icon>
          </td>
          <td class="temp-name">
            <span
              :class="{ 'active': isLegendSelected(item) }"
              class="legend-item toggle"
              @click="legendClick(item)"
            >
              {{ item.prettyName }}
            </span>
          </td>
          <td class="temp-power">
            <span
              :class="{ 'active': isLegendSelected(item, '#power') }"
              class="legend-item toggle"
              @click="legendClick(item, '#power')"
            >
              <span v-if="item.power <= 0 && item.target <= 0">off</span>
              <span v-if="item.target > 0">
                {{ (item.power) ? (item.power * 100).toFixed() : 0 }}<small>%</small>
              </span>
            </span>
          </td>
          <td
            v-if="showRateOfChange"
            class="text-no-wrap"
          >
            <span
              :class="{ 'active': isLegendSelected(item, '#power') }"
              class="legend-item toggle"
              @click="legendClick(item, '#power')"
            >
              <span>{{ getRateOfChange(item) }}<small>&deg;C/s</small></span>
            </span>
          </td>
          <td class="temp-actual">
            <span v-if="item.temperature != null && !item.disconnected">
              {{ item.temperature.toFixed(1) }}<small>°C</small>
            </span>
            <span v-else>
              -
            </span>
          </td>
          <td>/</td>
          <td @contextmenu.stop>
            <app-text-field
              v-if="klippyReady"
              :disabled="item.disconnected"
              :value="item.target"
              :rules="[
                Rules.required,
                Rules.numberValid,
                Rules.numberGreaterThanOrEqualOrZero(item.minTemp),
                Rules.numberLessThanOrEqualOrZero(item.maxTemp)
              ]"
              type="number"
              outlined
              dense
              single-line
              hide-details="auto"
              suffix="°C"
              x-small
              @submit="setHeaterTargetTemp(item.name, Number($event))"
            />
          </td>
        </tr>
        <tr
          v-for="item in fans"
          :key="item.key"
        >
          <td>
            <v-icon
              small
              :class="{ 'spin': item.speed > 0 && item.target > 0 }"
              :color="item.color"
            >
              $fan
            </v-icon>
          </td>
          <td class="temp-name">
            <span
              :class="{ 'active': isLegendSelected(item) }"
              class="legend-item toggle"
              @click="legendClick(item)"
            >
              {{ item.prettyName }}
            </span>
          </td>
          <td class="temp-power">
            <span
              v-if="item.speed"
              :class="{ 'active':isLegendSelected(item, '#speed') }"
              class="legend-item toggle"
              @click="legendClick(item, '#speed')"
            >
              <span v-if="item.speed > 0 && (item.target > 0 || !item.target)">
                {{ (item.speed * 100).toFixed(0) }}<small>%</small>
              </span>
              <span v-if="item.speed <= 0 && item.target && item.target > 0">
                {{ $t('app.printer.state.standby') }}
              </span>
              <span v-if="item.speed <=0 && ((item.target && item.target <= 0) || !item.target)">off</span>
            </span>
          </td>
          <td
            v-if="showRateOfChange"
            class="text-no-wrap"
          >
            <span
              :class="{ 'active': isLegendSelected(item, '#power') }"
              class="legend-item toggle"
              @click="legendClick(item, '#power')"
            >
              <span>{{ getRateOfChange(item) }}<small>&deg;C/s</small></span>
            </span>
          </td>
          <td class="temp-actual">
            <span v-if="item.temperature != null && !item.disconnected">
              {{ item.temperature.toFixed(1) }}<small>°C</small>
              <small v-if="item.humidity != null && showRelativeHumidity"><br>{{ item.humidity.toFixed(1) }} %</small>
              <small v-if="item.pressure != null && showBarometricPressure"><br>{{ Filters.getReadableAtmosphericPressureString(item.pressure) }}</small>
              <small v-if="item.gas != null && showGasResistance"><br>{{ Filters.getReadableResistanceString(item.gas) }}</small>
            </span>
            <span v-else>
              -
            </span>
          </td>
          <td>/</td>
          <td @contextmenu.stop>
            <app-text-field
              v-if="klippyReady && item.type === 'temperature_fan'"
              :disabled="item.disconnected"
              :value="item.target"
              :rules="[
                Rules.required,
                Rules.numberValid,
                Rules.numberGreaterThanOrEqualOrZero(item.minTemp),
                Rules.numberLessThanOrEqualOrZero(item.maxTemp)
              ]"
              type="number"
              outlined
              dense
              single-line
              hide-details="auto"
              suffix="°C"
              x-small
              @submit="setFanTargetTemp(item.name, Number($event))"
            />
          </td>
        </tr>
        <tr
          v-for="item in sensors"
          :key="item.key"
        >
          <td>
            <v-icon
              small
              :color="item.color"
            >
              $thermometer
            </v-icon>
          </td>
          <td class="temp-name">
            <span
              :class="{ 'active': isLegendSelected(item) }"
              class="legend-item toggle"
              @click="legendClick(item)"
            >
              {{ item.prettyName }}
            </span>
          </td>
          <td class="temp-power">
            &nbsp;
          </td>
          <td
            v-if="showRateOfChange"
            class="text-no-wrap"
          >
            <span class="legend-item">
              {{ getRateOfChange(item) }}<small>&deg;C/s</small>
            </span>
          </td>
          <td class="temp-actual">
            <v-tooltip
              left
              :disabled="item.measured_max_temp == null && item.measured_min_temp == null"
            >
              <template #activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  v-on="on"
                >
                  <span v-if="item.temperature != null && !item.disconnected">
                    {{ item.temperature.toFixed(1) }}<small>°C</small>
                    <small v-if="item.humidity != null && showRelativeHumidity"><br>{{ item.humidity.toFixed(1) }} %</small>
                    <small v-if="item.pressure != null && showBarometricPressure"><br>{{ Filters.getReadableAtmosphericPressureString(item.pressure) }}</small>
                    <small v-if="item.gas != null && showGasResistance"><br>{{ Filters.getReadableResistanceString(item.gas) }}</small>
                    <small v-if="item.current_z_adjust != null"><br>{{ Filters.getReadableLengthString(item.current_z_adjust, { showMicrons: true }) }}</small>
                  </span>
                  <span v-else>
                    -
                  </span>
                </div>
              </template>
              <span>
                {{ $t('app.general.label.high') }}: {{ item.measured_max_temp?.toFixed(1) ?? '-' }}°C<br>
                {{ $t('app.general.label.low') }}: {{ item.measured_min_temp?.toFixed(1) ?? '-' }}°C
              </span>
            </v-tooltip>
          </td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr
          v-for="item in nevermore"
          :key="item.key"
        >
          <td>
            <v-icon
              small
              :color="item.color"
            >
              $fan
            </v-icon>
          </td>
          <td class="temp-name">
            <span class="legend-item">
              {{ item.prettyName }}
            </span>
          </td>
          <td
            class="temp-actual"
            :colspan="showRateOfChange ? 3 : 2"
          >
            <span>
              <template v-for="sensor in getNevermoreSensors(item)">
                <v-tooltip
                  :key="`${item.key}-${sensor.key}`"
                  left
                  :disabled="sensor.disableTooltip"
                >
                  <template #activator="{ on, attrs }">
                    <div
                      v-bind="attrs"
                      v-on="on"
                    >
                      <component :is="sensor.small ? 'small' : 'span'">
                        {{ sensor.intake ?? '-' }} &rarr; {{ sensor.exhaust ?? '-' }}{{ sensor.unit }}
                      </component>
                    </div>
                  </template>
                  <span>
                    {{ $t('app.general.label.high') }}: {{ sensor.intake_max ?? '-' }} &rarr; {{ sensor.exhaust_max ?? '-' }}{{ sensor.unit }}<br>
                    {{ $t('app.general.label.low') }}: {{ sensor.intake_min ?? '-' }} &rarr; {{ sensor.exhaust_min ?? '-' }}{{ sensor.unit }}
                  </span>
                </v-tooltip>
              </template>
              <small v-if="item.rpm != null">{{ item.rpm }} RPM</small>
            </span>
          </td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      </tbody>
    </v-simple-table>

    <heater-context-menu
      v-if="contextMenuState.open"
      v-model="contextMenuState.open"
      :heater="contextMenuState.heater"
      :position-x="contextMenuState.x"
      :position-y="contextMenuState.y"
      @pid-calibrate="handlePidCalibrateDialog"
      @mpc-calibrate="handleMpcCalibrateDialog"
      @turn-off="handleTurnOff"
    />

    <heater-pid-calibrate-dialog
      v-if="heaterPidCalibrateDialog.open"
      v-model="heaterPidCalibrateDialog.open"
      :heater="heaterPidCalibrateDialog.heater"
      @save="handlePidCalibrate"
    />

    <heater-mpc-calibrate-dialog
      v-if="heaterMpcCalibrateDialog.open"
      v-model="heaterMpcCalibrateDialog.open"
      :heater="heaterMpcCalibrateDialog.heater"
      @save="handleMpcCalibrate"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, nextTick } from 'vue'
import HeaterContextMenu from './HeaterContextMenu.vue'
import HeaterPidCalibrateDialog from './HeaterPidCalibrateDialog.vue'
import HeaterMpcCalibrateDialog from './HeaterMpcCalibrateDialog.vue'

// Explicit registration for ESLint to recognize template usage
defineOptions({ components: { HeaterPidCalibrateDialog, HeaterMpcCalibrateDialog } })
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Filters, Rules } from '@/plugins/filters'
import type { Fan, Heater, Sensor } from '@/store/printer/types'
import { takeRightWhile } from 'lodash-es'
import type { ChartData, ChartSelectedLegends } from '@/store/charts/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'
import isNullOrEmpty, { type NullableOrEmpty } from '@/util/is-null-or-empty'

const emit = defineEmits<{
  (e: 'updateChartSelectedLegends', legends: ChartSelectedLegends): void
}>()

const { klippyReady, sendGcode } = useStateMixin()
const { typedState, typedGetters, store } = useStore()

const contextMenuState = reactive<{
  open: boolean,
  x: number,
  y: number,
  heater: Heater | null
}>({
  open: false,
  x: 0,
  y: 0,
  heater: null
})

const heaterPidCalibrateDialog = reactive<{
  heater: Heater | null,
  open: boolean
}>({
  heater: null,
  open: false
})

const heaterMpcCalibrateDialog = reactive<{
  heater: Heater | null,
  open: boolean
}>({
  heater: null,
  open: false
})

const heaters = computed((): Heater[] => typedGetters['printer/getHeaters'])
const fans = computed(() => store.getters['printer/getOutputs'](['temperature_fan']))
const nevermore = computed(() => store.getters['printer/getOutputs'](['nevermore']))
const sensors = computed((): Sensor[] => typedGetters['printer/getSensors'])
const chartSelectedLegends = computed((): ChartSelectedLegends => typedState.charts.selectedLegends)
const chartData = computed((): Readonly<ChartData>[] => typedState.charts.chart)
const showRateOfChange = computed((): boolean => typedState.config.uiSettings.general.showRateOfChange)
const showRelativeHumidity = computed((): boolean => typedState.config.uiSettings.general.showRelativeHumidity)
const showBarometricPressure = computed((): boolean => typedState.config.uiSettings.general.showBarometricPressure)
const showGasResistance = computed((): boolean => typedState.config.uiSettings.general.showGasResistance)

function setHeaterTargetTemp (heater: string, target: number) {
  sendGcode(`SET_HEATER_TEMPERATURE HEATER=${encodeGcodeParamValue(heater)} TARGET=${target}`)
}

function setFanTargetTemp (fan: string, target: number) {
  sendGcode(`SET_TEMPERATURE_FAN_TARGET TEMPERATURE_FAN=${encodeGcodeParamValue(fan)} TARGET=${target}`)
}

function getRateOfChange (item: Heater | Sensor) {
  const recentChartData = chartData.value.slice(-5)
  const filteredChartData = takeRightWhile(recentChartData, x => x[item.key] != null)

  let rateOfChange = 0
  if (filteredChartData.length >= 2) {
    const curr = filteredChartData[filteredChartData.length - 1]
    const prev = filteredChartData[0]

    rateOfChange = (+curr[item.key] - +prev[item.key]) / (+curr.date - +prev.date) * 1000

    if (Math.abs(rateOfChange) < 0.05) {
      rateOfChange = 0 // prevent constant change of sign
    }
  }

  return `${rateOfChange < 0 ? '' : '+'}${rateOfChange.toFixed(1)}`
}

function isLegendSelected (item: Heater | Fan | Sensor, subKey?: string) {
  const key = `${item.key}${subKey ?? ''}`
  return chartSelectedLegends.value[key] ?? (subKey !== '#power' && subKey !== '#speed')
}

function legendClick (item: Heater | Fan | Sensor, subKey?: string) {
  const value = !isLegendSelected(item, subKey)
  const key = `${item.key}${subKey ?? ''}`

  const legends: ChartSelectedLegends = {
    [key]: value
  }

  // If this has a target, toggle that too.
  if (!subKey && 'target' in item) {
    legends[`${item.key}#target`] = value
  }

  emit('updateChartSelectedLegends', legends)
}

function getNevermoreSensors (item: Record<string, number | undefined>) {
  const sensorDefs = [
    { key: 'gas', unit: '', digits: 0, small: false },
    { key: 'temperature', unit: ' °C', digits: 1, small: true }
  ]

  if (showRelativeHumidity.value) {
    sensorDefs.push({ key: 'humidity', unit: ' %', digits: 1, small: true })
  }

  if (showBarometricPressure.value) {
    sensorDefs.push({ key: 'pressure', unit: ' hPa', digits: 0, small: true })
  }

  return sensorDefs.map(sensor => {
    const intake = item[`intake_${sensor.key}`]?.toFixed(sensor.digits)
    const intake_min = item[`intake_${sensor.key}_min`]?.toFixed(sensor.digits)
    const intake_max = item[`intake_${sensor.key}_max`]?.toFixed(sensor.digits)
    const exhaust = item[`exhaust_${sensor.key}`]?.toFixed(sensor.digits)
    const exhaust_min = item[`exhaust_${sensor.key}_min`]?.toFixed(sensor.digits)
    const exhaust_max = item[`exhaust_${sensor.key}_max`]?.toFixed(sensor.digits)

    return {
      ...sensor,
      intake,
      intake_min,
      intake_max,
      exhaust,
      exhaust_min,
      exhaust_max,
      disableTooltip: (
        intake_min == null &&
        intake_max == null &&
        exhaust_min == null &&
        exhaust_max == null
      )
    }
  })
}

function handleHeaterRowClick (item: Heater, event: MouseEvent) {
  if (contextMenuState.open) {
    contextMenuState.open = false

    if (event.type !== 'contextmenu') {
      return
    }
  }

  // Open the context menu
  contextMenuState.x = event.clientX
  contextMenuState.y = event.clientY
  contextMenuState.heater = item
  nextTick(() => {
    contextMenuState.open = true
  })
}

function handleTurnOff (heater: Heater) {
  setHeaterTargetTemp(heater.name, 0)
}

function handlePidCalibrateDialog (heater: Heater) {
  heaterPidCalibrateDialog.heater = heater
  heaterPidCalibrateDialog.open = true
}

function handlePidCalibrate (heater: Heater, targetTemperature: number) {
  sendGcode(`PID_CALIBRATE HEATER=${encodeGcodeParamValue(heater.name)} TARGET=${targetTemperature}`)
}

function handleMpcCalibrateDialog (heater: Heater) {
  heaterMpcCalibrateDialog.heater = heater
  heaterMpcCalibrateDialog.open = true
}

function handleMpcCalibrate (heater: Heater, targetTemperature: number, fanBreakpoints: NullableOrEmpty<number>) {
  sendGcode(`MPC_CALIBRATE HEATER=${encodeGcodeParamValue(heater.name)} TARGET=${targetTemperature}${!isNullOrEmpty(fanBreakpoints) ? ` FAN_BREAKPOINTS=${fanBreakpoints}` : ''}`)
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  .theme--light :deep(.v-data-table.temperature-table > .v-data-table__wrapper > table) {
    color: rgba(map-get($material-light, 'text-color'), 1);
    .temp-actual {
      color: rgba(map-get($material-light, 'text-color'), 1);
    }
  }

  .theme--dark :deep(.v-data-table.temperature-table > .v-data-table__wrapper > table) {
    color: rgba(map-get($material-dark, 'text-color'), 1);
    .temp-actual {
      color: rgba(map-get($material-dark, 'text-color'), 1);
    }
  }

  :deep(.v-data-table.temperature-table > .v-data-table__wrapper > table) {

    .temp-name,
    .temp-power {
      font-size: 1rem;
    }

    .temp-actual {
      font-weight: 300;
      font-size: 1.125rem;
      white-space: nowrap;
      text-align: right;
    }

    > thead > tr > th {
      height: 40px;
    }

    // The icon
    > thead > tr > th:first-child,
    > tbody > tr > td:first-child {
      padding-right: 0px;
    }

    // The name
    > thead > tr > th:nth-child(2),
    > tbody > tr > td:nth-child(2) {
      padding-left: 8px;
    }

    // The power
    > thead > tr > th:nth-last-child(3),
    > tbody > tr > td:nth-last-child(3) {
      padding-right: 0px;
    }

    // The /
    > thead > tr > th:nth-last-child(2),
    > tbody > tr > td:nth-last-child(2) {
      font-size: 1rem;
      padding-left: 12px;
      padding-right: 16px;
    }

    // The temp entry
    > thead > tr > th:last-child,
    > tbody > tr > td:last-child {
      padding-left: 0px;
    }
  }

  .legend-item {
    display: inline-block;
    opacity: 0.45
  }

  .legend-item.toggle {
    cursor: pointer;
  }

  .legend-item.active {
    opacity: 1
  }
</style>

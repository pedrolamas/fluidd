<template>
  <v-card-text>
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.velocity')"
          :value="velocity"
          :reset-value="defaultVelocity"
          :min="1"
          :max="defaultVelocity"
          :disabled="!klippyReady"
          overridable
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetVelocity)"
          suffix="mm/s"
          @submit="setVelocity"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.sqv')"
          :value="squareCornerVelocity"
          :reset-value="defaultSquareCornerVelocity"
          :min="0"
          :max="defaultSquareCornerVelocity"
          :step="0.1"
          :disabled="!klippyReady"
          overridable
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetSquareCornerVelocity)"
          suffix="mm/s"
          @submit="setSquareCornerVelocity"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.acceleration')"
          :value="accel"
          :reset-value="defaultAccel"
          :min="1"
          :max="defaultAccel"
          :disabled="!klippyReady"
          overridable
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetAcceleration)"
          suffix="mm/s²"
          @submit="setAccel"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          v-if="minimumCruiseRatio != null"
          :label="$t('app.general.label.minimum_cruise_ratio')"
          :value="minimumCruiseRatio"
          :reset-value="defaultMinimumCruiseRatio"
          :min="0"
          :max="99"
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetMinimumCruiseRatio)"
          suffix="%"
          @submit="setMinimumCruiseRatio"
        />

        <app-named-slider
          v-else-if="accelToDecel != null"
          :label="$t('app.general.label.accel_to_decel')"
          :value="accelToDecel"
          :reset-value="defaultAccelToDecel"
          :min="1"
          :max="defaultAccelToDecel"
          :disabled="!klippyReady"
          overridable
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetAccelToDecel)"
          suffix="mm/s²"
          @submit="setAccelToDecel"
        />
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'

const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()
const { typedState, typedGetters } = useStore()

const printerSettings = computed((): Klipper.SettingsState => typedGetters['printer/getPrinterSettings'])

const defaultVelocity = computed(() => printerSettings.value.printer?.max_velocity ?? 100)
const velocity = computed(() => typedState.printer.printer.toolhead.max_velocity)
const defaultAccel = computed(() => printerSettings.value.printer?.max_accel ?? 100)
const accel = computed(() => typedState.printer.printer.toolhead.max_accel)

const defaultAccelToDecel = computed(() => {
  const val = printerSettings.value.printer?.max_accel_to_decel

  return val ?? defaultAccel.value / 2
})

const accelToDecel = computed(() => typedState.printer.printer.toolhead.max_accel_to_decel)

const defaultMinimumCruiseRatio = computed(() => {
  const val = printerSettings.value.printer?.minimum_cruise_ratio

  return Math.round((val ?? 0.5) * 100)
})

const minimumCruiseRatio = computed(() => {
  const val: number | null | undefined = typedState.printer.printer.toolhead.minimum_cruise_ratio

  return val != null
    ? Math.round(val * 100)
    : undefined
})

const defaultSquareCornerVelocity = computed(() => printerSettings.value.printer?.square_corner_velocity ?? 5)
const squareCornerVelocity = computed(() => typedState.printer.printer.toolhead.square_corner_velocity)

function setVelocity (val: number) {
  sendGcode(`SET_VELOCITY_LIMIT VELOCITY=${val}`, Waits.onSetVelocity)
}

function setAccel (val: number) {
  sendGcode(`SET_VELOCITY_LIMIT ACCEL=${val}`, Waits.onSetAcceleration)
}

function setAccelToDecel (val: number) {
  sendGcode(`SET_VELOCITY_LIMIT ACCEL_TO_DECEL=${val}`, Waits.onSetAccelToDecel)
}

function setMinimumCruiseRatio (val: number) {
  sendGcode(`SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO=${val / 100}`, Waits.onSetMinimumCruiseRatio)
}

function setSquareCornerVelocity (val: number) {
  sendGcode(`SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=${val}`, Waits.onSetSquareCornerVelocity)
}
</script>

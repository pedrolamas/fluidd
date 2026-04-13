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
          :label="$t('app.general.label.retract_length')"
          suffix="mm"
          :value="retractLength"
          :reset-value="defaultRetractLength"
          :min="0"
          :max="maxRetractLength"
          :step="0.01"
          overridable
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetRetractLength)"
          @submit="setRetractLength"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.unretract_extra_length')"
          suffix="mm"
          :value="unretractExtraLength"
          :reset-value="defaultUnretractExtraLength"
          :min="0"
          :max="maxUnretractExtraLength"
          :step="0.01"
          overridable
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetUnretractExtraLength)"
          @submit="setUnRetractExtraLength"
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
          :label="$t('app.general.label.retract_speed')"
          suffix="mm/s"
          :value="retractSpeed"
          :reset-value="defaultRetractSpeed"
          :min="0"
          :step="1"
          :max="maxRetractSpeed"
          overridable
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetRetractSpeed)"
          @submit="setRetractSpeed"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.unretract_speed')"
          suffix="mm/s"
          :value="unretractSpeed"
          :reset-value="defaultUnretractSpeed"
          :min="0"
          :step="1"
          :max="maxUnretractSpeed"
          overridable
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetUnretractSpeed)"
          @submit="setUnretractSpeed"
        />
      </v-col>
    </v-row>

    <v-row v-if="supportsZHopHeight">
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <app-named-slider
          :label="$t('app.general.label.z_hop_height')"
          suffix="mm"
          :value="zHopHeight"
          :reset-value="defaultZHopHeight"
          :min="0"
          :step="0.1"
          :max="maxZHopHeight"
          overridable
          :disabled="!klippyReady"
          :locked="isMobileUserAgent"
          :loading="hasWait($waits.onSetZHopHeight)"
          @submit="setZHopHeight"
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
import type { KlippyApp } from '@/store/printer/types'

const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()
const { typedState, typedGetters } = useStore()

const firmwareRetraction = computed(() => {
  const printerSettings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']

  return printerSettings.firmware_retraction
})

const defaultRetractLength = computed(() => firmwareRetraction.value?.retract_length ?? 0)
const retractLength = computed(() => typedState.printer.printer.firmware_retraction?.retract_length ?? 0)
const maxRetractLength = computed(() => {
  if (defaultRetractLength.value <= 0) return 15
  return Math.round(defaultRetractLength.value * 2 * 100) / 100
})

const defaultRetractSpeed = computed(() => firmwareRetraction.value?.retract_speed ?? 0)
const retractSpeed = computed(() => typedState.printer.printer.firmware_retraction?.retract_speed ?? 0)
const maxRetractSpeed = computed(() => {
  if (defaultRetractSpeed.value <= 0) return 100
  return Math.round(defaultRetractSpeed.value * 2)
})

const defaultUnretractSpeed = computed(() => firmwareRetraction.value?.unretract_speed ?? 0)
const unretractSpeed = computed(() => typedState.printer.printer.firmware_retraction?.unretract_speed ?? 0)
const maxUnretractSpeed = computed(() => {
  if (defaultUnretractSpeed.value <= 0) return 100
  return Math.round(defaultUnretractSpeed.value * 2)
})

const defaultUnretractExtraLength = computed(() => firmwareRetraction.value?.unretract_extra_length ?? 0)
const unretractExtraLength = computed(() => typedState.printer.printer.firmware_retraction?.unretract_extra_length ?? 0)
const maxUnretractExtraLength = computed(() => {
  if (defaultUnretractExtraLength.value <= 0) return 15
  return Math.round(defaultUnretractExtraLength.value * 2 * 100) / 100
})

const defaultZHopHeight = computed(() => firmwareRetraction.value?.z_hop_height ?? 0)
const zHopHeight = computed(() => typedState.printer.printer.firmware_retraction?.z_hop_height ?? 0)
const maxZHopHeight = computed(() => {
  if (defaultZHopHeight.value <= 0) return 2
  return Math.round(defaultZHopHeight.value * 2 * 100) / 100
})

const klippyApp = computed((): KlippyApp => typedGetters['printer/getKlippyApp'])
const supportsZHopHeight = computed(() => klippyApp.value.isKalicoOrDangerKlipper)

function setRetractLength (val: number) {
  sendGcode(`SET_RETRACTION RETRACT_LENGTH=${val}`, Waits.onSetRetractLength)
}

function setRetractSpeed (val: number) {
  sendGcode(`SET_RETRACTION RETRACT_SPEED=${val}`, Waits.onSetRetractSpeed)
}

function setUnretractSpeed (val: number) {
  sendGcode(`SET_RETRACTION UNRETRACT_SPEED=${val}`, Waits.onSetUnretractSpeed)
}

function setUnRetractExtraLength (val: number) {
  sendGcode(`SET_RETRACTION UNRETRACT_EXTRA_LENGTH=${val}`, Waits.onSetUnretractExtraLength)
}

function setZHopHeight (val: number) {
  sendGcode(`SET_RETRACTION Z_HOP_HEIGHT=${val}`, Waits.onSetZHopHeight)
}
</script>

<template>
  <div>
    <app-named-slider
      v-if="fan.controllable"
      suffix="%"
      :value="value"
      :reset-value="0"
      :label="(rpm) ? `${fan.prettyName} <small>${rpm}</small>` : fan.prettyName"
      :rules="[[customRules.minFan]]"
      :disabled="!klippyReady || fan.disconnected"
      :locked="isMobileUserAgent"
      :loading="hasWait(`${$waits.onSetFanSpeed}${fan.name}`)"
      @submit="handleChange"
    />

    <v-layout
      v-else
      align-center
      justify-space-between
      :class="{ 'text--disabled': !klippyReady || fan.disconnected }"
    >
      <div class="text-body-1">
        {{ fan.prettyName }}
      </div>
      <div class="ml-auto">
        <small
          v-if="rpm"
          class="mr-2"
        >{{ rpm }}</small>
        <span
          v-safe-html="prettyValue"
          class="focus--text"
        />
      </div>
    </v-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Fan } from '@/store/printer/types'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  fan: Fan
}>()

const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()
const { t } = useI18n()

const prettyValue = computed(() => {
  return (value.value === 0)
    ? t('app.general.label.off')
    : `${value.value} %`
})

const value = computed(() => {
  if (!props.fan.speed) return 0
  const speed = props.fan.speed / (props.fan.config?.max_power || 1)
  return Math.round(speed * 100)
})

function handleChange (target: number) {
  // If this is a controllable fan, it's either the part fan [fan] or a generic fan [fan_generic].
  if (props.fan.type === 'fan') {
    target = Math.ceil(target * 2.55)
    sendGcode(`M106 S${target}`, `${Waits.onSetFanSpeed}${props.fan.name}`)
  }
  if (props.fan.type === 'fan_generic') {
    target = target / 100
    sendGcode(`SET_FAN_SPEED FAN=${encodeGcodeParamValue(props.fan.name)} SPEED=${target}`, `${Waits.onSetFanSpeed}${props.fan.name}`)
  }
}

const rpm = computed(() => {
  return (props.fan.rpm)
    ? props.fan.rpm.toFixed() + ' rpm'
    : undefined
})

const customRules = computed(() => ({
  minFan: (v: any): string | boolean => {
    const off_below = (props.fan.config?.off_below || 0) * 100

    if (!off_below) return true

    const num = +v

    return (num >= off_below || num === 0) || t('app.general.simple_form.error.min_or_0', { min: off_below })
  }
}))
</script>

<template>
  <div>
    <app-named-slider
      v-if="pwm"
      suffix="%"
      :label="pin.prettyName"
      :min="0"
      :max="100"
      :value="value"
      :reset-value="resetValue"
      :disabled="!klippyReady || pin.disconnected"
      :locked="isMobileUserAgent"
      :loading="hasWait(`${$waits.onSetOutputPin}${pin.name}`)"
      @submit="handleChange"
    />

    <app-named-switch
      v-else
      :disabled="!klippyReady || pin.disconnected"
      :label="pin.prettyName"
      :value="pin.value > 0"
      :loading="hasWait(`${$waits.onSetOutputPin}${pin.name}`)"
      @input="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import type { OutputPin as IOutputPin } from '@/store/printer/types'
import { Waits } from '@/globals'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  pin: IOutputPin
}>()

const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()

const pwmTypes = ['pwm_cycle_time', 'pwm_tool']

const pwm = computed(() => {
  return (
    props.pin.pwm ||
    pwmTypes.includes(props.pin.type)
  )
})

const value = computed(() => Math.round(props.pin.value * 100))

const resetValue = computed(() => Math.round(props.pin.resetValue / props.pin.scale * 100))

function handleChange (target: number | boolean) {
  let val: number

  if (typeof target === 'boolean') {
    val = target
      ? props.pin.scale
      : 0
  } else {
    val = Math.round(target * props.pin.scale) / 100
  }

  sendGcode(`SET_PIN PIN=${encodeGcodeParamValue(props.pin.name)} VALUE=${val}`, `${Waits.onSetOutputPin}${props.pin.name}`)
}
</script>

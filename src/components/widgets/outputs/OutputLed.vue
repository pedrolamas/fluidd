<template>
  <v-row
    no-gutters
    justify-space-between
  >
    <v-col
      align-self="center"
      cols="5"
      class="text-body-1"
      :class="{ 'text--disabled': !klippyReady || led.disconnected }"
    >
      {{ led.prettyName }}
    </v-col>
    <v-col class="ml-auto text-right">
      <app-color-picker
        v-model="primaryColor"
        :white.sync="whiteValue"
        :title="led.prettyName"
        :supported-channels="supportedChannels"
        :disabled="!klippyReady || led.disconnected"
        dot
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IroColor } from '@irojs/iro-core'
import type { Led } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'
import { useStateMixin } from '@/composables/useStateMixin'

type Rgbw = { r: number; g: number; b: number; w: number }

const { sendGcode, klippyReady } = useStateMixin()

const props = defineProps<{ led: Led }>()

const channelLookup: Record<keyof Rgbw, string> = { r: 'RED', g: 'GREEN', b: 'BLUE', w: 'WHITE' }

const supportedChannels = computed(() => {
  const { type, config } = props.led
  if (config) {
    if ('color_order' in config) {
      const colorOrder = Array.isArray(config.color_order) ? config.color_order[0] : config.color_order
      if (typeof colorOrder === 'string') return colorOrder
    }
    switch (type) {
      case 'dotstar': return 'RGB'
      case 'led': {
        const channels = []
        if ('red_pin' in config) channels.push('R')
        if ('green_pin' in config) channels.push('G')
        if ('blue_pin' in config) channels.push('B')
        if ('white_pin' in config) channels.push('W')
        return channels.join('')
      }
    }
  }
  return 'RBGW'
})

const color = computed<Rgbw>(() => {
  const [r, g, b, w] = props.led.color_data[0].map(value => Math.round(value * 255))
  return { r, g, b, w }
})

function sendColor (c: Rgbw) {
  const channels = supportedChannels.value.toLowerCase().split('') as (keyof Rgbw)[]
  const colorsString = channels.map(ch => ` ${channelLookup[ch]}=${Math.round(c[ch] * 1000 / 255) / 1000}`).join('')
  sendGcode(`SET_LED LED=${encodeGcodeParamValue(props.led.name)}${colorsString}`)
}

const primaryColor = computed({
  get: () => new IroColor(color.value).hexString,
  set: (value: string) => {
    const { r, g, b } = new IroColor(value).rgb
    sendColor({ ...color.value, r, g, b })
  }
})

const whiteValue = computed({
  get: () => color.value.w,
  set: (value: number) => sendColor({ ...color.value, w: value })
})
</script>

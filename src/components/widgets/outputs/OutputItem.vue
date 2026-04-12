<template>
  <div>
    <output-pin
      v-if="pinTypes.includes(item.type)"
      :key="item.key"
      :pin="asPin(item)"
    />

    <output-fan
      v-if="fanTypes.includes(item.type)"
      :key="item.key"
      :fan="asFan(item)"
    />

    <output-led
      v-if="ledTypes.includes(item.type)"
      :key="item.key"
      :led="asLed(item)"
    />
  </div>
</template>

<script setup lang="ts">
import OutputFan from '@/components/widgets/outputs/OutputFan.vue'
import OutputPin from '@/components/widgets/outputs/OutputPin.vue'
import OutputLed from '@/components/widgets/outputs/OutputLed.vue'
import type { Fan, Led, OutputPin as IOutputPin } from '@/store/printer/types'

defineProps<{
  item: Fan | Led | IOutputPin
}>()

const pinTypes = [
  'output_pin',
  'pwm_tool',
  'pwm_cycle_time'
]

const fanTypes = [
  'temperature_fan',
  'controller_fan',
  'heater_fan',
  'fan_generic',
  'fan'
]

const ledTypes = [
  'led',
  'neopixel',
  'dotstar',
  'pca9533',
  'pca9632'
]

const asPin = (item: Fan | Led | IOutputPin) => item as IOutputPin
const asFan = (item: Fan | Led | IOutputPin) => item as Fan
const asLed = (item: Fan | Led | IOutputPin) => item as Led
</script>

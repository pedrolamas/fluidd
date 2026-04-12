<template>
  <v-menu
    v-model="open"
    transition="slide-y-transition"
    :position-x="positionX"
    :position-y="positionY"
    min-width="180"
    absolute
    right
  >
    <v-list dense>
      <v-list-item
        :disabled="!klippyReady || printerPrinting || !heaterIsOn || heater.disconnected"
        @click="$emit('turn-off', heater)"
      >
        <v-list-item-icon>
          <v-icon>
            $snowflake
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.chart.label.turn_off') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <v-list-item
        :disabled="!klippyReady || printerPrinting || heater.disconnected"
        @click="$emit('pid-calibrate', heater)"
      >
        <v-list-item-icon>
          <v-icon>
            $tools
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>PID_CALIBRATE</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        v-if="klippyApp.isKalicoOrDangerKlipper"
        :disabled="!klippyReady || printerPrinting || !heaterUsesMpcControl || heater.disconnected"
        @click="$emit('mpc-calibrate', heater)"
      >
        <v-list-item-icon>
          <v-icon>
            $tools
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>MPC_CALIBRATE</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import type { Heater, KlippyApp } from '@/store/printer/types'

const props = defineProps<{
  value: boolean,
  positionX: number,
  positionY: number,
  heater: Heater
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'turn-off', heater: Heater): void
  (e: 'pid-calibrate', heater: Heater): void
  (e: 'mpc-calibrate', heater: Heater): void
}>()

const open = computed({
  get: () => props.value,
  set: (value) => emit('input', value)
})

const { klippyReady, printerPrinting } = useStateMixin()
const { typedGetters } = useStore()

const klippyApp = computed((): KlippyApp => typedGetters['printer/getKlippyApp'])
const heaterIsOn = computed(() => props.heater.target > 0)
const heaterUsesMpcControl = computed(() => props.heater.config?.control === 'mpc')
</script>

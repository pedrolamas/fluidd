<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <app-named-slider
        :label="$t('app.general.label.speed')"
        suffix="%"
        :value="speed"
        overridable
        :reset-value="100"
        :disabled="!klippyReady"
        :loading="hasWait(Waits.onSetSpeed)"
        :locked="isMobileUserAgent"
        :min="1"
        :max="200"
        @submit="handleSetSpeed"
      />
    </v-col>
    <v-col
      cols="12"
      sm="6"
    >
      <app-named-slider
        :label="$t('app.general.label.flow')"
        suffix="%"
        :value="flow"
        overridable
        :reset-value="100"
        :disabled="!klippyReady"
        :loading="hasWait(Waits.onSetFlow)"
        :locked="isMobileUserAgent"
        :min="1"
        :max="200"
        @submit="handleSetFlow"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { Waits } from '@/globals'

const { typedState } = useStore()
const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()

const flow = computed(() => Math.round(typedState.printer.printer.gcode_move.extrude_factor * 100) || 100)

function handleSetFlow (val: number) {
  sendGcode(`M221 S${val}`, Waits.onSetFlow)
}

const speed = computed(() => Math.round(typedState.printer.printer.gcode_move.speed_factor * 100) || 100)

function handleSetSpeed (val: number) {
  sendGcode(`M220 S${val}`, Waits.onSetSpeed)
}
</script>

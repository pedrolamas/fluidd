<template>
  <div>
    <v-card-text>
      <tool-change-commands />

      <v-row
        justify="space-between"
        align="start"
      >
        <v-col class="controls-wrapper">
          <extruder-selection v-if="hasMultipleExtruders" />
          <template v-if="!printerPrinting">
            <toolhead-control-cross v-if="toolheadControlStyle === 'cross'" />
            <toolhead-control-bars v-else-if="toolheadControlStyle === 'bars'" />
            <toolhead-control-circle v-else-if="toolheadControlStyle === 'circle'" />
          </template>
          <z-height-adjust v-else />
        </v-col>

        <v-col class="controls-wrapper">
          <toolhead-position />
          <extruder-moves v-if="!printerPrinting && hasExtruder" />
          <z-height-adjust v-if="!printerPrinting" />
        </v-col>
      </v-row>
    </v-card-text>

    <template v-if="!printerPrinting">
      <v-divider />

      <extruder-stats />

      <v-divider />
    </template>

    <v-card-text>
      <speed-and-flow-adjust />
      <pressure-advance-adjust v-if="showPressureAdvance" />
    </v-card-text>

    <extruder-steppers />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import ToolheadControlCross from './ToolheadControlCross.vue'
import ToolheadControlBars from './ToolheadControlBars.vue'
import ToolheadControlCircle from './ToolheadControlCircle.vue'
import ExtruderMoves from './ExtruderMoves.vue'
import ExtruderSelection from './ExtruderSelection.vue'
import ToolheadPosition from './ToolheadPosition.vue'
import ZHeightAdjust from './ZHeightAdjust.vue'
import SpeedAndFlowAdjust from './SpeedAndFlowAdjust.vue'
import PressureAdvanceAdjust from './PressureAdvanceAdjust.vue'
import ExtruderStats from './ExtruderStats.vue'
import ExtruderSteppers from './ExtruderSteppers.vue'
import ToolChangeCommands from './ToolChangeCommands.vue'
import type { ToolheadControlStyle } from '@/store/config/types'

const { typedState } = useStore()
const { printerPrinting } = useStateMixin()
const { hasExtruder, hasMultipleExtruders, activeExtruder } = useToolheadMixin()

const showPressureAdvance = computed(() => activeExtruder.value?.pressure_advance !== undefined)

const toolheadControlStyle = computed(() =>
  typedState.config.uiSettings.general.toolheadControlStyle as ToolheadControlStyle
)
</script>

<style type="scss" scoped>
  .controls-wrapper {
    min-width: 380px !important;
    max-width: 450px !important;
  }
</style>

<template>
  <div v-if="!forceMoveEnabled">
    <toolhead-control-bars-axis axis="X" />
    <toolhead-control-bars-axis axis="Y" />
    <toolhead-control-bars-axis axis="Z" />

    <v-row
      no-gutters
      class="mb-2"
    >
      <v-col class="text-center">
        <app-btn
          :disabled="!klippyReady || printerPrinting"
          :loading="hasWait(Waits.onHomeAll)"
          :color="!allHomed ? 'primary' : undefined"
          class="px-2 mr-2"
          @click="homeAll"
        >
          <v-icon
            small
            class="mr-1"
          >
            $home
          </v-icon>
          {{ $t('app.tool.btn.home_all') }}
        </app-btn>

        <app-btn
          :disabled="!klippyReady || printerPrinting"
          :loading="hasWait(Waits.onHomeXY)"
          :color="!xyHomed ? 'primary' : undefined"
          class="px-2"
          @click="sendGcode('G28 X Y', Waits.onHomeXY)"
        >
          <v-icon
            small
            class="mr-1"
          >
            $home
          </v-icon>
          XY
        </app-btn>
      </v-col>
    </v-row>
  </div>
  <div v-else>
    <toolhead-control-bars-stepper
      v-for="stepper in steppers"
      :key="stepper.key"
      :stepper="stepper"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolheadControlBarsAxis from './ToolheadControlBarsAxis.vue'
import ToolheadControlBarsStepper from './ToolheadControlBarsStepper.vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { Waits } from '@/globals'
import type { Stepper } from '@/store/printer/types'

const { typedGetters } = useStore()
const { klippyReady, printerPrinting, hasWait, sendGcode, homeAll } = useStateMixin()
const { allHomed, xyHomed, forceMoveEnabled } = useToolheadMixin()

const steppers = computed<Stepper[]>(() => {
  const all: Stepper[] = typedGetters['printer/getSteppers']
  return all.filter(stepper => stepper.key.startsWith('stepper_'))
})
</script>

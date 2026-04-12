<template>
  <v-row
    v-if="hasZOffsetApplyEndstop || hasZOffsetApplyProbe"
    align="start"
    justify="end"
  >
    <v-col
      cols="6"
      class="text-right"
    >
      <app-btn-toggle
        v-model="moveDistance"
        mandatory
        dense
        :disabled="!klippyReady"
      >
        <app-btn
          v-for="(value, i) in zAdjustValues"
          :key="i"
          small
          class="px-1"
          :disabled="!klippyReady"
          min-width="36"
          :value="value"
        >
          {{ value }}
        </app-btn>
      </app-btn-toggle>
      <div
        class="mt-1"
        :class="{ 'text--disabled': !klippyReady }"
      >
        <span class="secondary--text">{{ $t('app.general.label.z_offset') }}&nbsp;</span>
        <span>{{ zHomingOrigin.toFixed(3) }}mm</span>
      </div>
    </v-col>
    <v-col cols="6">
      <v-row
        justify="space-between"
        no-gutters
        class="mr-n1"
      >
        <v-col
          cols="4"
          class="pr-1"
        >
          <app-btn
            :loading="hasWait(Waits.onZAdjust)"
            :disabled="!klippyReady"
            small
            block
            @click="sendZAdjustGcode('+')"
          >
            <v-icon small>
              $zUp
            </v-icon>
          </app-btn>
        </v-col>
        <v-col
          cols="4"
          class="pr-1"
        >
          <app-btn
            :loading="hasWait(Waits.onZAdjust)"
            :disabled="!klippyReady"
            small
            block
            @click="sendZAdjustGcode('-')"
          >
            <v-icon small>
              $zDown
            </v-icon>
          </app-btn>
        </v-col>
        <v-col
          cols="4"
          class="pr-1"
        >
          <app-btn
            v-if="hasZOffsetApplyEndstop !== hasZOffsetApplyProbe"
            :disabled="!klippyReady || printerPrinting || zHomingOrigin === 0"
            small
            block
            @click="handleZOffsetApply"
          >
            <v-icon small>
              $save
            </v-icon>
          </app-btn>

          <v-menu
            v-else
            left
            offset-y
            transition="slide-y-transition"
          >
            <template #activator="{ on, attrs, value }">
              <app-btn
                v-bind="attrs"
                :disabled="!klippyReady || printerPrinting || zHomingOrigin === 0"
                small
                block
                v-on="on"
              >
                <v-icon small>
                  $save
                </v-icon>
                <v-icon
                  small
                  class="ml-1"
                  :class="{ 'rotate-180': value }"
                >
                  $chevronDown
                </v-icon>
              </app-btn>
            </template>
            <v-list dense>
              <template v-for="command of ['Z_OFFSET_APPLY_ENDSTOP', 'Z_OFFSET_APPLY_PROBE']">
                <v-list-item
                  :key="command"
                  @click="sendGcode(command)"
                >
                  <v-list-item-icon>
                    <v-icon>
                      $expandVertical
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ command }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { Waits } from '@/globals'
import type { GcodeCommands } from '@/store/printer/types'

const { typedState, typedGetters } = useStore()
const { klippyReady, printerPrinting, hasWait, sendGcode } = useStateMixin()

const moveDistanceValue = ref<number | null>(null)

const zHomingOrigin = computed((): number =>
  typedState.printer.printer.gcode_move.homing_origin[2]
)

const zAdjustValues = computed((): number[] =>
  typedState.config.uiSettings.general.zAdjustDistances
)

const moveDistance = computed({
  get: (): number => moveDistanceValue.value || zAdjustValues.value[0],
  set: (value: number) => {
    moveDistanceValue.value = value
  }
})

const availableCommands = computed((): GcodeCommands =>
  typedGetters['printer/getAvailableCommands']
)

const hasZOffsetApplyProbe = computed((): boolean =>
  'Z_OFFSET_APPLY_PROBE' in availableCommands.value
)

const hasZOffsetApplyEndstop = computed((): boolean =>
  'Z_OFFSET_APPLY_ENDSTOP' in availableCommands.value
)

/**
 * Send a Z adjust gcode script.
 */
function sendZAdjustGcode (direction: '+' | '-') {
  const zHomed: boolean = typedGetters['printer/getHomedAxes']('z')
  const gcode = `SET_GCODE_OFFSET Z_ADJUST=${direction}${moveDistance.value} MOVE=${+zHomed}`
  sendGcode(gcode, Waits.onZAdjust)
}

function handleZOffsetApply () {
  if (hasZOffsetApplyProbe.value && !hasZOffsetApplyEndstop.value) {
    sendGcode('Z_OFFSET_APPLY_PROBE')
  }

  if (hasZOffsetApplyEndstop.value && !hasZOffsetApplyProbe.value) {
    sendGcode('Z_OFFSET_APPLY_ENDSTOP')
  }
}
</script>

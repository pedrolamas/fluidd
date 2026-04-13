<template>
  <div class="mb-2">
    <!-- <div style="line-height: 32px; padding: 0 12px;"> -->
    <v-row
      justify="space-between"
      no-gutters
    >
      <v-col
        cols="3"
        class="pr-1"
      >
        <app-text-field
          :color="forceMoveEnabled ? 'error' : 'primary'"
          :label="`X [ ${livePosition[0].toFixed(2)} ]`"
          :rules="[
            $rules.required,
            $rules.numberValid
          ]"
          outlined
          persistent-placeholder
          hide-details
          dense
          small
          type="number"
          :disabled="!klippyReady || (!xHomed && !xForceMove)"
          :readonly="printerPrinting"
          :value="(useGcodeCoords) ? gcodePosition[0].toFixed(2) : toolheadPosition[0].toFixed(2)"
          @submit="moveAxisTo('X', Number($event))"
        />
      </v-col>
      <v-col
        cols="3"
        class="pr-1 pl-1"
      >
        <app-text-field
          :color="forceMoveEnabled ? 'error' : 'primary'"
          :label="`Y [ ${livePosition[1].toFixed(2)} ]`"
          :rules="[
            $rules.required,
            $rules.numberValid
          ]"
          outlined
          persistent-placeholder
          hide-details
          dense
          small
          type="number"
          :disabled="!klippyReady || (!yHomed && !yForceMove)"
          :readonly="printerPrinting"
          :value="(useGcodeCoords) ? gcodePosition[1].toFixed(2) : toolheadPosition[1].toFixed(2)"
          @submit="moveAxisTo('Y', Number($event))"
        />
      </v-col>
      <v-col
        cols="3"
        class="pr-1 pl-1"
      >
        <app-text-field
          :color="forceMoveEnabled ? 'error' : 'primary'"
          :label="`Z [ ${livePosition[2].toFixed(3)} ]`"
          :rules="[
            $rules.required,
            $rules.numberValid
          ]"
          outlined
          persistent-placeholder
          hide-details
          dense
          small
          type="number"
          :disabled="!klippyReady || (!zHomed && !zForceMove)"
          :readonly="printerPrinting"
          :value="(useGcodeCoords) ? gcodePosition[2].toFixed(3) : toolheadPosition[2].toFixed(3)"
          @submit="moveAxisTo('Z', Number($event))"
        />
      </v-col>
      <v-col
        cols="3"
        class="pl-1"
      >
        <app-btn-toggle
          v-model="positioning"
          mandatory
          dense
          class="d-flex"
          :disabled="!klippyReady || printerPrinting"
        >
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                class="positioning-toggle-button"
                :disabled="!klippyReady || printerPrinting"
                v-on="on"
              >
                <v-icon small>
                  $absolutePositioning
                </v-icon>
              </app-btn>
            </template>
            <span>{{ $t('app.tool.tooltip.absolute_positioning') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                class="positioning-toggle-button"
                :disabled="!klippyReady || printerPrinting"
                v-on="on"
              >
                <v-icon small>
                  $relativePositioning
                </v-icon>
              </app-btn>
            </template>
            <span>{{ $t('app.tool.tooltip.relative_positioning') }}</span>
          </v-tooltip>
        </app-btn-toggle>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'

type Axis = 'X' | 'Y' | 'Z'

const axisIndexMap: Record<Axis, number> = {
  X: 0,
  Y: 1,
  Z: 2
}

const { klippyReady, printerPrinting, sendGcode, sendMoveGcode } = useStateMixin()
const {
  xHomed, yHomed, zHomed,
  xHasMultipleSteppers, yHasMultipleSteppers, zHasMultipleSteppers,
  forceMoveEnabled
} = useToolheadMixin()
const { typedState, typedGetters } = useStore()

const gcodePosition = computed((): [number, number, number, ...number[]] =>
  typedState.printer.printer.gcode_move.gcode_position
)

const toolheadPosition = computed((): [number, number, number, ...number[]] =>
  typedState.printer.printer.toolhead.position
)

const livePosition = computed((): [number, number, number, ...number[]] =>
  typedState.printer.printer.motion_report?.live_position ?? [0, 0, 0]
)

const useGcodeCoords = computed((): boolean =>
  typedState.config.uiSettings.general.useGcodeCoords
)

const xForceMove = computed((): boolean => forceMoveEnabled.value && !xHasMultipleSteppers.value)
const yForceMove = computed((): boolean => forceMoveEnabled.value && !yHasMultipleSteppers.value)
const zForceMove = computed((): boolean => forceMoveEnabled.value && !zHasMultipleSteppers.value)

const usesAbsolutePositioning = computed((): boolean =>
  typedState.printer.printer.gcode_move.absolute_coordinates
)

const positioning = computed({
  get: () => usesAbsolutePositioning.value ? 0 : 1,
  set: (value: number) => {
    sendGcode(`G9${value}`)
  }
})

const printerSettings = computed((): Klipper.SettingsState => typedGetters['printer/getPrinterSettings'])

function moveAxisTo (axis: Axis, pos: number) {
  const axisIndex = axisIndexMap[axis]
  const currentPos = useGcodeCoords.value
    ? gcodePosition.value[axisIndex]
    : toolheadPosition.value[axisIndex]

  if (currentPos !== pos) {
    const rate: number = axis === 'Z'
      ? typedState.config.uiSettings.general.defaultToolheadZSpeed
      : typedState.config.uiSettings.general.defaultToolheadXYSpeed

    if (forceMoveEnabled.value) {
      const accel: number = axis === 'Z'
        ? printerSettings.value.printer?.max_z_accel ?? 100
        : typedState.printer.printer.toolhead.max_accel
      sendGcode(`FORCE_MOVE STEPPER=stepper_${axis.toLowerCase()} DISTANCE=${pos} VELOCITY=${rate} ACCEL=${accel}`)
    } else {
      sendMoveGcode(
        {
          [axis]: pos
        },
        rate,
        true)
    }
  }
}
</script>

<style type="scss" scoped>
  .positioning-toggle-button {
    min-width: 20px !important;
    width: 50%;
  }
</style>

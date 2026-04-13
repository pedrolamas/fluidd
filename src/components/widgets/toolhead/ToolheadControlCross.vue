<template>
  <div>
    <v-row
      no-gutters
      justify="start"
      class="mb-2"
    >
      <v-col
        cols="auto"
        class="ml-12 mr-12"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(yHomed)"
          :disabled="axisButtonDisabled(yHomed, yHasMultipleSteppers)"
          icon="$up"
          @click="moveAxisBy('Y', toolheadMoveLength)"
        />
      </v-col>
      <v-col
        cols="auto"
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(zHomed)"
          :disabled="axisButtonDisabled(zHomed, zHasMultipleSteppers)"
          icon="$up"
          @click="moveAxisBy('Z', toolheadMoveLength)"
        />
      </v-col>
      <v-col
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="(!allHomed) ? 'primary' : undefined"
          :loading="hasWait($waits.onHomeAll)"
          :disabled="!klippyReady || printerPrinting"
          icon="$home"
          small-icon
          @click="homeAll"
        >
          {{ $t('app.tool.btn.home_all') }}
        </app-btn-toolhead-move>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      justify="start"
      class="mb-2"
    >
      <v-col
        cols="auto"
        :class="{
          'mr-12': !canHomeXY,
        }"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(xHomed)"
          :disabled="axisButtonDisabled(xHomed, xHasMultipleSteppers)"
          icon="$left"
          @click="moveAxisBy('X', toolheadMoveLength, true)"
        />
      </v-col>
      <v-col
        v-if="canHomeXY"
        cols="auto"
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="(!xyHomed) ? 'primary' : undefined"
          :loading="hasWait($waits.onHomeXY)"
          :disabled="!klippyReady || printerPrinting"
          :tooltip="$t('app.tool.tooltip.home_xy')"
          icon="$home"
          @click="sendGcode('G28 X Y', $waits.onHomeXY)"
        />
      </v-col>
      <v-col
        cols="auto"
        class="ml-2"
        justify="end"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(xHomed)"
          :disabled="axisButtonDisabled(xHomed, xHasMultipleSteppers)"
          icon="$right"
          @click="moveAxisBy('X', toolheadMoveLength)"
        />
      </v-col>
      <v-col
        v-if="canHomeXY"
        cols="auto"
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="(!zHomed) ? 'primary' : undefined"
          :loading="hasWait($waits.onHomeZ)"
          :disabled="!klippyReady || printerPrinting"
          :tooltip="$t('app.tool.tooltip.home_z')"
          icon="$home"
          @click="sendGcode('G28 Z', $waits.onHomeZ)"
        />
      </v-col>
      <v-col
        v-if="canHomeXY"
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="(!xHomed) ? 'primary' : undefined"
          :loading="hasWait($waits.onHomeX)"
          :disabled="!klippyReady || printerPrinting"
          icon="$home"
          small-icon
          @click="sendGcode('G28 X', $waits.onHomeX)"
        >
          {{ $t('app.tool.btn.home_x') }}
        </app-btn-toolhead-move>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      justify="start"
      class="mb-2"
    >
      <v-col
        cols="auto"
        class="ml-12 mr-7"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(yHomed)"
          :disabled="axisButtonDisabled(yHomed, yHasMultipleSteppers)"
          icon="$down"
          @click="moveAxisBy('Y', toolheadMoveLength, true)"
        />
      </v-col>
      <v-col
        cols="auto"
        class="ml-7"
      >
        <app-btn-toolhead-move
          :color="axisButtonColor(zHomed)"
          :disabled="axisButtonDisabled(zHomed, zHasMultipleSteppers)"
          icon="$down"
          @click="moveAxisBy('Z', toolheadMoveLength, true)"
        />
      </v-col>
      <v-col
        v-if="canHomeXY"
        class="ml-2"
      >
        <app-btn-toolhead-move
          :color="(!yHomed) ? 'primary' : undefined"
          :loading="hasWait($waits.onHomeY)"
          :disabled="!klippyReady || printerPrinting"
          icon="$home"
          small-icon
          @click="sendGcode('G28 Y', $waits.onHomeY)"
        >
          {{ $t('app.tool.btn.home_y') }}
        </app-btn-toolhead-move>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      justify="start"
      class="mb-2"
    >
      <v-col>
        <app-btn-toggle
          v-model.number="toolheadMoveLength"
          mandatory
          dense
          :disabled="!klippyReady"
        >
          <app-btn
            v-for="(distance, index) of toolheadMoveDistances"
            :key="index"
            small
            min-width="40"
            :value="distance"
            :disabled="!klippyReady"
          >
            {{ distance }}
          </app-btn>
        </app-btn-toggle>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'

type Axis = 'X' | 'Y' | 'Z'

const { klippyReady, printerPrinting, hasWait, sendGcode, sendMoveGcode, homeAll } = useStateMixin()
const {
  allHomed, xyHomed, xHomed, yHomed, zHomed,
  xHasMultipleSteppers, yHasMultipleSteppers, zHasMultipleSteppers,
  forceMoveEnabled
} = useToolheadMixin()
const { typedState, typedGetters } = useStore()

const moveLength = ref<number | null>(null)

const printerSettings = computed((): Klipper.SettingsState => typedGetters['printer/getPrinterSettings'])
const hasRoundBed = computed((): boolean => typedGetters['printer/getHasRoundBed'])
const canHomeXY = computed((): boolean => !hasRoundBed.value)

const toolheadMoveDistances = computed((): number[] =>
  typedState.config.uiSettings.general.toolheadMoveDistances
)

const toolheadMoveLength = computed({
  get: (): number => {
    if (moveLength.value != null) return moveLength.value
    const defaultLen = typedState.config.uiSettings.general.defaultToolheadMoveLength
    return toolheadMoveDistances.value.includes(defaultLen)
      ? defaultLen
      : toolheadMoveDistances.value[0]
  },
  set: (val: number) => {
    moveLength.value = val
  }
})

function axisButtonColor (axisHomed: boolean): string | undefined {
  if (forceMoveEnabled.value) return 'error'

  return axisHomed ? 'primary' : undefined
}

function axisButtonDisabled (axisHomed: boolean, axisMultipleSteppers: boolean): boolean {
  return !klippyReady.value || (!axisHomed && !(forceMoveEnabled.value && !axisMultipleSteppers))
}

function moveAxisBy (axis: Axis, distance: number, negative = false) {
  const rate: number = axis === 'Z'
    ? typedState.config.uiSettings.general.defaultToolheadZSpeed
    : typedState.config.uiSettings.general.defaultToolheadXYSpeed
  const inverted: boolean = typedState.config.uiSettings.general.axis[axis.toLowerCase()].inverted || false
  distance = negative !== inverted
    ? -distance
    : distance

  if (forceMoveEnabled.value) {
    const accel: number = axis === 'Z'
      ? printerSettings.value.printer?.max_z_accel ?? 100
      : typedState.printer.printer.toolhead.max_accel
    sendGcode(`FORCE_MOVE STEPPER=stepper_${axis.toLowerCase()} DISTANCE=${distance} VELOCITY=${rate} ACCEL=${accel}`)
  } else {
    sendMoveGcode(
      {
        [axis]: distance
      },
      rate)
  }
}
</script>

<style type="scss" scoped>
  :deep(.v-speed-dial__list) {
    flex-direction: column !important;
  }
</style>

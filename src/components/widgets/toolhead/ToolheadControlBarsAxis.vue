<template>
  <v-row
    no-gutters
    class="mb-2"
  >
    <v-col>
      <app-up-down-btn-group
        :values="values"
        color="primary"
        :disabled="!klippyReady || printerPrinting || !homed"
        class="d-flex"
        @click="moveBy($event)"
      >
        <app-btn
          :color="!homed ? 'primary' : undefined"
          :disabled="!klippyReady || printerPrinting"
          :loading="hasWait(wait)"
          class="flex-grow-1"
          @click="home"
        >
          <v-icon
            small-icon
            class="mr-1"
          >
            $home
          </v-icon>
          {{ axis }}
        </app-btn>
      </app-up-down-btn-group>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { Waits } from '@/globals'

type Axis = 'X' | 'Y' | 'Z'

const props = defineProps<{
  axis: Axis
}>()

const { typedState } = useStore()
const { klippyReady, printerPrinting, hasWait, sendGcode, sendMoveGcode } = useStateMixin()
const { xHomed, yHomed, zHomed } = useToolheadMixin()

const values = computed(() =>
  props.axis === 'Z'
    ? typedState.config.uiSettings.general.toolheadZMoveDistances
    : typedState.config.uiSettings.general.toolheadXYMoveDistances
)

const homed = computed(() => {
  switch (props.axis) {
    case 'X': return xHomed.value
    case 'Y': return yHomed.value
    case 'Z': return zHomed.value
    default: return false
  }
})

const wait = computed(() => {
  switch (props.axis) {
    case 'X': return Waits.onHomeX
    case 'Y': return Waits.onHomeY
    case 'Z': return Waits.onHomeZ
    default: return ''
  }
})

const rate = computed(() =>
  props.axis === 'Z'
    ? typedState.config.uiSettings.general.defaultToolheadZSpeed
    : typedState.config.uiSettings.general.defaultToolheadXYSpeed
)

function moveBy (distance: number) {
  sendMoveGcode({ [props.axis]: distance }, rate.value)
}

function home () {
  sendGcode(`G28 ${props.axis}`, wait.value)
}
</script>

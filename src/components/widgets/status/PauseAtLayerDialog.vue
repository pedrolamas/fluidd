<template>
  <app-dialog
    v-model="open"
    :title="$t('app.general.label.pause_at_layer')"
    max-width="450"
    :save-button-text="$t('app.general.btn.accept')"
    @save="sendAccept"
  >
    <v-card-text class="pa-0">
      <template v-if="setPauseNextLayerMacro">
        <app-setting :title="$t('app.general.label.pause_at_next_layer')">
          <v-switch
            v-model="pauseNextLayer.enable"
            class="mt-0"
            hide-details
          />
        </app-setting>

        <template v-if="pauseNextLayer.enable">
          <v-divider />

          <app-setting :title="$t('app.general.label.command')">
            <v-combobox
              v-model="pauseNextLayer.call"
              :items="['PAUSE', 'M600']"
              hide-details="auto"
              filled
              dense
            />
          </app-setting>
        </template>
      </template>

      <v-divider v-if="setPauseNextLayerMacro && setPauseAtLayerMacro" />

      <template v-if="setPauseAtLayerMacro">
        <app-setting :title="$t('app.general.label.pause_at_layer_number')">
          <v-switch
            v-model="pauseAtLayer.enable"
            class="mt-0"
            hide-details
          />
        </app-setting>

        <template v-if="pauseAtLayer.enable">
          <v-divider />

          <app-setting :title="$t('app.general.label.layer')">
            <v-text-field
              v-model="pauseAtLayer.layer"
              type="number"
              :rules="[
                Rules.required,
                Rules.numberValid,
                Rules.numberGreaterThan(currentLayer),
                Rules.numberLessThanOrEqual(totalLayers)
              ]"
              hide-details="auto"
              filled
              dense
            />
          </app-setting>

          <v-divider />

          <app-setting :title="$t('app.general.label.command')">
            <v-combobox
              v-model="pauseAtLayer.call"
              :items="['PAUSE', 'M600']"
              hide-details="auto"
              filled
              dense
            />
          </app-setting>
        </template>
      </template>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Rules } from '@/plugins/filters'
import type { Macro } from '@/store/macros/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

type PauseNextLayer = {
  enable: boolean,
  call: string
}
type PauseAtLayer = {
  enable: boolean,
  call: string,
  layer: number
}
type PrintStatsMacroVariables = {
  pause_next_layer?: PauseNextLayer
  pause_at_layer?: PauseAtLayer,
}

const props = defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const open = computed({
  get: () => props.value,
  set: (value) => emit('input', value)
})

const { sendGcode } = useStateMixin()
const { typedState, typedGetters } = useStore()

const pauseNextLayer = reactive<PauseNextLayer>({
  enable: false,
  call: 'PAUSE'
})

const pauseAtLayer = reactive<PauseAtLayer>({
  enable: false,
  call: 'PAUSE',
  layer: 0
})

const setPauseNextLayerMacro = computed((): Macro | undefined =>
  typedGetters['macros/getMacroByName']('SET_PAUSE_NEXT_LAYER')
)

const setPauseAtLayerMacro = computed((): Macro | undefined =>
  typedGetters['macros/getMacroByName']('SET_PAUSE_AT_LAYER')
)

const setPrintStatsInfoMacro = computed((): Macro | undefined =>
  typedGetters['macros/getMacroByName']('SET_PRINT_STATS_INFO')
)

const printStatsMacroVariables = computed(() => {
  const variables: PrintStatsMacroVariables = setPrintStatsInfoMacro.value?.variables ?? {}
  return variables
})

const currentLayer = computed((): number =>
  typedState.printer.printer.print_stats?.info?.current_layer ?? 0
)

const totalLayers = computed((): number =>
  typedState.printer.printer.print_stats?.info?.total_layer ?? 0
)

function sendAccept () {
  const gcodes: string[] = []

  if (setPauseNextLayerMacro.value) {
    if (pauseNextLayer.enable) {
      gcodes.push(`SET_PAUSE_NEXT_LAYER ENABLE=1 MACRO=${encodeGcodeParamValue(pauseNextLayer.call)}`)
    } else {
      gcodes.push('SET_PAUSE_NEXT_LAYER ENABLE=0')
    }
  }

  if (setPauseAtLayerMacro.value) {
    if (pauseAtLayer.enable) {
      gcodes.push(`SET_PAUSE_AT_LAYER ENABLE=1 LAYER=${pauseAtLayer.layer} MACRO=${encodeGcodeParamValue(pauseAtLayer.call)}`)
    } else {
      gcodes.push('SET_PAUSE_AT_LAYER ENABLE=0')
    }
  }

  sendGcode(gcodes.join('\n'))

  open.value = false
}

onMounted(() => {
  const { pause_at_layer, pause_next_layer } = printStatsMacroVariables.value

  Object.assign(pauseNextLayer, pause_next_layer)
  Object.assign(pauseAtLayer, pause_at_layer)
})
</script>

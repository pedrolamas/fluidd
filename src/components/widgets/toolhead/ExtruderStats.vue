<template>
  <v-expansion-panels
    accordion
    multiple
    flat
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        <template #actions>
          <v-icon
            small
            class="my-1 mr-2"
          >
            $expand
          </v-icon>
        </template>
        <template #default="{ open }">
          <v-row no-gutters>
            <v-col
              class="text--secondary text-center"
              :class="{ 'text--disabled': !klippyReady }"
            >
              <v-fade-transition>
                <span v-if="!open">~ {{ estimatedExtrudedLength }} mm @ {{ estimatedVolumetricFlow }} mm³/s, {{ estimatedMaxSpeed }} mm/s</span>
              </v-fade-transition>
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div
          class="text-center"
          :class="{ 'text--disabled': !klippyReady }"
        >
          <p
            v-safe-html="$t('app.tool.label.stats_active_extruder', {
              filamentDiameter,
              nozzleDiameter
            })"
          />
          <p
            v-safe-html="$t('app.tool.label.stats_volumetric_flow', {
              extrudeSpeed,
              estimatedVolumetricFlow
            })"
          />
          <p
            v-safe-html="$t('app.tool.label.stats_extruded_length', {
              extrudeLength,
              extrudeFactor: (extrudeFactor * 100).toFixed(),
              estimatedExtrudedLength
            })"
          />
          <p
            v-safe-html="$t('app.tool.label.stats_max_speed', {
              layerHeight,
              estimatedMaxSpeed
            })"
          />
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'

const { typedState } = useStore()
const { klippyReady } = useStateMixin()
const { filamentDiameter, nozzleDiameter } = useToolheadMixin()

const extrudeFactor = computed(() => typedState.printer.printer.gcode_move.extrude_factor || 1)

const layerHeight = computed(() => 0.2)

const extrudeLength = computed(() => {
  const value = typedState.config.uiSettings.toolhead.extrudeLength

  if (Number.isNaN(+value)) return 0

  return value === -1
    ? typedState.config.uiSettings.general.defaultExtrudeLength
    : value
})

const extrudeSpeed = computed(() => {
  const value = typedState.config.uiSettings.toolhead.extrudeSpeed

  if (Number.isNaN(+value)) return 0

  return value === -1
    ? typedState.config.uiSettings.general.defaultExtrudeSpeed
    : value
})

const estimatedExtrudedLength = computed(() =>
  Math.round(extrudeLength.value * extrudeFactor.value * (filamentDiameter.value ** 2 / nozzleDiameter.value ** 2) * 10) / 10
)

const estimatedVolumetricFlow = computed(() =>
  Math.round(Math.PI / 4 * filamentDiameter.value ** 2 * extrudeSpeed.value * 10) / 10
)

const estimatedMaxSpeed = computed(() => {
  const stadiumArea = layerHeight.value * (nozzleDiameter.value + layerHeight.value * (Math.PI / 4 - 1))
  return Math.round(estimatedVolumetricFlow.value / stadiumArea * 10) / 10
})
</script>

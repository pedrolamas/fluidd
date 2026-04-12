<template>
  <v-expansion-panels
    accordion
    multiple
    flat
  >
    <v-expansion-panel
      v-for="extruderStepper in extruderSteppers"
      :key="`extruderStepper-${extruderStepper.name}`"
    >
      <v-divider />
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
          <v-fade-transition leave-absolute>
            <span
              v-if="open"
              key="0"
            >
              {{ extruderStepper.prettyName }}
            </span>
            <span
              v-else
              key="1"
            >
              {{ extruderStepper.prettyName }} <span class="secondary--text">[ {{ extruderStepper.description }} ]</span>
            </span>
          </v-fade-transition>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <extruder-stepper-sync
          :extruder-stepper="extruderStepper"
        />

        <pressure-advance-adjust
          v-if="extruderStepper.pressure_advance !== undefined"
          :extruder-stepper="extruderStepper"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import ExtruderStepperSync from './ExtruderStepperSync.vue'
import PressureAdvanceAdjust from './PressureAdvanceAdjust.vue'
import type { KnownExtruder, ExtruderStepper } from '@/store/printer/types'

const { typedGetters } = useStore()
const { t } = useI18n()

const extruderSteppers = computed(() => {
  const extruders: KnownExtruder[] = typedGetters['printer/getExtruders']
  const steppers: ExtruderStepper[] = typedGetters['printer/getExtruderSteppers']

  return steppers
    .map(x => {
      const labels = [
        (x.motion_queue && extruders.find(y => y.key === x.motion_queue)?.name) || t('app.setting.label.none')
      ]

      if (x.enabled !== undefined) {
        labels.push(t(`app.general.label.${x.enabled ? 'on' : 'off'}`))
      }

      if (x.disconnected) {
        labels.push(t('app.general.label.disconnected'))
      }

      const description = labels.join(', ')

      return {
        ...x,
        description
      }
    })
})
</script>

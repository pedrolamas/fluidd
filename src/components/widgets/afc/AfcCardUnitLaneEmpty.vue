<template>
  <div class="d-flex flex-column flex-grow-1">
    <v-row class="mt-0 flex-grow-1">
      <v-col
        class="align-content-center text-center text--disabled px-6"
        :class="{ 'pb-6': !prep, 'pt-3': !prep }"
      >
        {{ text }}
      </v-col>
    </v-row>
    <v-row
      v-if="prep"
      class="mt-0 flex-grow-0"
    >
      <v-col class="px-6 pb-6">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-btn
              dense
              small
              class="fill-width elevation-0"
              v-bind="attrs"
              v-on="on"
              @click="ejectLane"
            >
              <v-icon small>
                $afcEjectFilament
              </v-icon>
            </v-btn>
          </template>
          <span>
            {{ $t('app.afc.EjectFilament') }}
          </span>
        </v-tooltip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useI18n } from '@/composables/useI18n'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  name: string
}>()

const { sendGcode } = useStateMixin()
const { getAfcLaneObject } = useAfcMixin()
const { t } = useI18n()

const lane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const prep = computed(() => lane.value?.prep === true)

const text = computed(() => {
  if (prep.value) return t('app.afc.PrepDetected')
  return t('app.afc.Empty')
})

function ejectLane () {
  sendGcode(`LANE_UNLOAD LANE=${encodeGcodeParamValue(props.name)}`)
}
</script>

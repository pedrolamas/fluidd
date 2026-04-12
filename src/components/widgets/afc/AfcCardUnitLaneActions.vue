<template>
  <v-row>
    <v-col class="px-6 pt-3 pb-6 d-flex flex-row justify-space-between">
      <v-item-group class="_btn-group d-flex flex-nowrap fill-width py-0">
        <v-tooltip
          v-if="toolLoaded"
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              :disabled="!klippyReady || printerPrinting"
              dense
              class="flex-grow-1 px-0 first-btn"
              v-bind="attrs"
              v-on="on"
              @click="unloadLane"
            >
              <v-icon small>
                $afcUnloadLane
              </v-icon>
            </v-btn>
          </template>
          <span>
            {{ $t('app.afc.UnloadLane') }}
          </span>
        </v-tooltip>
        <v-tooltip
          v-else
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              :disabled="!klippyReady || printerPrinting"
              dense
              class="flex-grow-1 px-0 first-btn"
              v-bind="attrs"
              v-on="on"
              @click="loadLane"
            >
              <v-icon small>
                $afcLoadLane
              </v-icon>
            </v-btn>
          </template>
          <span>
            {{ $t('app.afc.LoadLane') }}
          </span>
        </v-tooltip>
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-btn
              :disabled="toolLoaded || (!laneRunout && toolLoaded)"
              dense
              class="flex-grow-1 px-0 last-btn"
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
      </v-item-group>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  name: string
}>()

const { klippyReady, printerPrinting, sendGcode } = useStateMixin()
const { afcCurrentLane, getAfcLaneObject } = useAfcMixin()

const lane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const laneActive = computed(() => props.name === afcCurrentLane.value?.name)

const laneRunout = computed(() =>
  laneActive.value && lane.value?.prep !== true
)

const toolLoaded = computed(() => lane.value?.tool_loaded === true)

function loadLane () {
  sendGcode(`CHANGE_TOOL LANE=${encodeGcodeParamValue(props.name)}`)
}

function unloadLane () {
  sendGcode(`TOOL_UNLOAD LANE=${encodeGcodeParamValue(props.name)}`)
}

function ejectLane () {
  sendGcode(`LANE_UNLOAD LANE=${encodeGcodeParamValue(props.name)}`)
}
</script>

<style scoped>
._btn-group {
  border-radius: 4px;

  .v-btn {
    border-radius: 0;
    border-color: rgba(255, 255, 255, 0.12);
    border-style: solid;
    border-width: thin;
    box-shadow: none;
    height: 28px;
    opacity: 0.8;
    min-width: auto !important;
  }

  .v-btn.first-btn {
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
  }

  .v-btn.last-btn {
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  .v-btn:not(.first-btn) {
    border-left-width: 0;
  }
}

html.theme--light ._btn-group .v-btn {
  border-color: rgba(0, 0, 0, 0.12);
}
</style>

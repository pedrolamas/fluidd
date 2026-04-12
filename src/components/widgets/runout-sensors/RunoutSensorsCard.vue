<template>
  <collapsable-card
    :title="$t('app.general.title.runout_sensors')"
    icon="$printer3dNozzleAlert"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.runout-sensors-card"
  >
    <template #menu>
      <app-btn
        v-if="!fullscreen"
        icon
        @click="$filters.routeTo({ name: 'tune' })"
      >
        <v-icon dense>
          $fullScreen
        </v-icon>
      </app-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="item in sensors"
        :key="item.name"
      >
        <v-list-item-content>
          <v-list-item-title>{{ item.prettyName }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon
            v-if="item.filament_detected"
            color="success"
          >
            $checkedCircle
          </v-icon>
          <v-icon
            v-else
            color="warning"
          >
            $alertCircle
          </v-icon>
        </v-list-item-icon>
        <v-list-item-action>
          <v-switch
            :input-value="item.enabled"
            @change="changeSensor(item, $event)"
          />
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import type { RunoutSensor } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

defineProps<{
  fullscreen?: boolean
}>()

const { typedGetters } = useStore()
const { sendGcode } = useStateMixin()

const sensors = computed((): RunoutSensor[] => typedGetters['printer/getRunoutSensors'])

function changeSensor (item: RunoutSensor, value: boolean) {
  sendGcode(`SET_FILAMENT_SENSOR SENSOR=${encodeGcodeParamValue(item.name)} ENABLE=${+value}`)
}
</script>

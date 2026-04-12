<template>
  <collapsable-card
    :title="$t('app.system_info.label.mcu_information', {mcu: mcu.prettyName})"
    icon="$chip"
  >
    <template #menu>
      <app-btn
        icon
        @click="showMcuInformationDialog"
      >
        <v-icon dense>
          $viewHeadline
        </v-icon>
      </app-btn>
    </template>

    <v-simple-table dense>
      <tbody>
        <tr v-if="mcuConstants.MCU">
          <th>{{ $t('app.system_info.label.micro_controller') }}</th>
          <td>{{ mcuConstants.MCU }}</td>
        </tr>
        <tr v-if="mcuConstants.CLOCK_FREQ">
          <th>{{ $t('app.system_info.label.frequency') }}</th>
          <td>{{ $filters.getReadableFrequencyString(+mcuConstants.CLOCK_FREQ) }}</td>
        </tr>
        <tr v-if="klippyApp.isKalico && mcu.app">
          <th>{{ $t('app.system_info.label.application') }}</th>
          <td>{{ mcu.app }}</td>
        </tr>
        <tr v-if="mcu.mcu_version">
          <th>{{ $t('app.system_info.label.version') }}</th>
          <td>{{ mcu.mcu_version }}</td>
        </tr>
        <tr v-if="klippyApp.isKalico && mcu.non_critical_disconnected != null">
          <th>{{ $t('app.system_info.label.non_critical_connection') }}</th>
          <td>
            <v-chip
              :color="mcu.non_critical_disconnected ? 'error' : 'success'"
              small
              label
            >
              <v-icon
                small
                left
              >
                {{ mcu.non_critical_disconnected ? '$blankCircle' : '$markedCircle' }}
              </v-icon>
              {{
                mcu.non_critical_disconnected
                  ? $t('app.general.label.disconnected')
                  : $t('app.general.label.connected')
              }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <mcu-information-dialog
      v-if="mcuInformationDialogOpen"
      v-model="mcuInformationDialogOpen"
      :mcu="mcu"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import McuInformationDialog from './McuInformationDialog.vue'
import type { KlippyApp, MCU } from '@/store/printer/types'
import { useStore } from '@/composables/useStore'

const props = defineProps<{
  mcu: MCU
}>()

const { typedGetters } = useStore()

const mcuInformationDialogOpen = ref(false)

const klippyApp = computed((): KlippyApp => typedGetters['printer/getKlippyApp'])

const mcuConstants = computed((): Record<string, string | number> =>
  props.mcu.mcu_constants || {}
)

function showMcuInformationDialog () {
  mcuInformationDialogOpen.value = true
}
</script>

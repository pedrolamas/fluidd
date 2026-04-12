<template>
  <div>
    <template v-if="klippyConnected">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            block
            color="primary"
            class="mb-2"
            :disabled="printerPrinting"
            v-on="on"
            @click="restartKlippy"
          >
            {{ $t('app.general.btn.restart_service_klipper') }}
          </app-btn>
        </template>
        <span>{{ $t('app.general.tooltip.reload_klipper') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            block
            color="primary"
            class="mb-2"
            :disabled="printerPrinting"
            v-on="on"
            @click="firmwareRestartKlippy"
          >
            {{ $t('app.general.btn.restart_firmware') }}
          </app-btn>
        </template>
        <span>{{ $t('app.general.tooltip.reload_restart_klipper') }}</span>
      </v-tooltip>
    </template>

    <template v-else-if="printerPoweredOff">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            block
            color="primary"
            class="mb-2"
            v-on="on"
            @click="printerPowerOn"
          >
            {{ $t('app.general.btn.power_on_printer') }}
          </app-btn>
        </template>
        <span>{{ $t('app.general.tooltip.power_on_printer') }}</span>
      </v-tooltip>
    </template>

    <template v-else>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            block
            color="primary"
            class="mb-2"
            v-on="on"
            @click="serviceRestartKlipper"
          >
            {{ $t('app.general.btn.restart_service_klipper') }}
          </app-btn>
        </template>
        <span>{{ $t('app.general.tooltip.restart_klipper') }}</span>
      </v-tooltip>
    </template>

    <app-btn
      block
      class="me-2 mb-2"
      @click="getKlippyLog()"
    >
      <v-icon
        left
        small
      >
        $download
      </v-icon>
      Klippy.log
    </app-btn>

    <app-btn
      block
      class="me-2"
      @click="getMoonrakerLog()"
    >
      <v-icon
        left
        small
      >
        $download
      </v-icon>
      Moonraker.log
    </app-btn>
  </div>
</template>

<script setup lang="ts">
import { useStateMixin } from '@/composables/useStateMixin'
import { useServicesMixin } from '@/composables/useServicesMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useStore } from '@/composables/useStore'
import { SocketActions } from '@/api/socketActions'

const { klippyConnected, printerPrinting, printerPoweredOff } = useStateMixin()
const { serviceRestartKlipper, restartKlippy, firmwareRestartKlippy } = useServicesMixin()
const { downloadFile } = useFilesMixin()
const { typedState } = useStore()

function getKlippyLog () {
  downloadFile('klippy.log', '')
}

function getMoonrakerLog () {
  downloadFile('moonraker.log', '')
}

function printerPowerOn () {
  const printerPowerDevice: string = typedState.config.uiSettings.general.printerPowerDevice ?? 'printer'

  SocketActions.machineDevicePowerSetDevice(printerPowerDevice, 'on')
}
</script>

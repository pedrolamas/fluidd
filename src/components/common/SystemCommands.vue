<template>
  <div>
    <v-list-group
      v-if="canControlHost"
      prepend-icon="$host"
      no-action
    >
      <template #activator>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.label.host') }}</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        :disabled="printerPrinting"
        @click="handleHostReboot"
      >
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.btn.reboot') }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon color="error">
            $powerCycle
          </v-icon>
        </v-list-item-icon>
      </v-list-item>

      <v-list-item
        :disabled="printerPrinting"
        @click="handleHostShutdown"
      >
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.btn.shutdown') }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon color="error">
            $power
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>

    <v-list-group
      v-if="devicePowerComponentEnabled && powerDevices.length"
      prepend-icon="$power"
      no-action
    >
      <template #activator>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.label.power') }}</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="(device, index) in powerDevices"
        :key="index"
        :disabled="(device.status === 'error' || device.status === 'init' || (printerPrinting && device.locked_while_printing))"
        :loading="hasWait(`${Waits.onDevicePowerToggle}/${device.device}`)"
        @click="togglePowerDevice(device)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ getPowerButtonText(device) }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon>{{ getPowerIcon(device) }}</v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>

    <v-list-group
      prepend-icon="$restart"
      no-action
    >
      <template #activator>
        <v-list-item-content>
          <v-list-item-title>{{ $t('app.general.label.services') }}</v-list-item-title>
        </v-list-item-content>
      </template>
      <template v-for="service in services">
        <v-list-item
          :key="service.name"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-tooltip
                :disabled="!service.active_state"
                left
              >
                <template #activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    class="text-wrap"
                    v-on="on"
                  >{{ $filters.prettyCase(service.name) }}</span>
                </template>
                <span>{{ $filters.prettyCase(`${service.active_state} (${service.sub_state})`) }}</span>
              </v-tooltip>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <app-btn
              v-if="service.active_state === 'inactive'"
              icon
              @click="checkDialog(serviceStart, service, 'start')"
            >
              <v-icon>$play</v-icon>
            </app-btn>
            <app-btn
              v-else
              icon
              @click="checkDialog(serviceRestart, service, 'restart')"
            >
              <v-icon color="warning">
                $restart
              </v-icon>
            </app-btn>
            <app-btn
              icon
              :disabled="service.active_state === 'inactive'"
              :style="service.name === moonrakerServiceName ? 'visibility: hidden;' : ''"
              @click="checkDialog(serviceStop, service, 'stop')"
            >
              <v-icon color="error">
                $stop
              </v-icon>
            </app-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list-group>

    <v-divider />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useServicesMixin } from '@/composables/useServicesMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { SocketActions } from '@/api/socketActions'
import { Waits } from '@/globals'
import type { ServiceInfo } from '@/store/server/types'

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { hasWait, printerPrinting } = useStateMixin()
const { moonrakerServiceName, hostReboot, hostShutdown, serviceRestartByName, serviceStartByName, serviceStopByName } = useServicesMixin()
const { typedGetters, typedState } = useStore()
const confirm = useConfirm()
const { t, tc } = useI18n()

const powerDevices = computed<Moonraker.Power.Device[]>(() => typedGetters['power/getDevices'])

const devicePowerComponentEnabled = computed<boolean>(() => typedGetters['server/componentSupport']('power'))

const services = computed<ServiceInfo[]>(() => typedGetters['server/getServices'])

const systemInfo = computed<Moonraker.Machine.SystemInfo | null>(() => typedState.server.system_info)

const canControlHost = computed<boolean>(() => systemInfo.value?.virtualization?.virt_type !== 'container')

async function checkDialog (executableFunction: (service: ServiceInfo) => Promise<unknown>, service: ServiceInfo, action: string) {
  const result = (
    !(
      printerPrinting.value ||
      ['restart', 'stop'].includes(action)
    ) ||
    await confirm(
      t(
        `app.general.simple_form.msg.confirm_service_${action}`,
        { name: service.name })?.toString(),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    emit('click')
    await executableFunction(service)
  }
}

async function serviceRestart (service: ServiceInfo) {
  await serviceRestartByName(service.name)
}

async function serviceStart (service: ServiceInfo) {
  await serviceStartByName(service.name)
}

async function serviceStop (service: ServiceInfo) {
  await serviceStopByName(service.name)
}

async function handleHostReboot () {
  const result = await confirm(
    tc('app.general.simple_form.msg.confirm_reboot_host'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    emit('click')
    hostReboot()
  }
}

async function handleHostShutdown () {
  const result = await confirm(
    tc('app.general.simple_form.msg.confirm_shutdown_host'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    emit('click')
    hostShutdown()
  }
}

async function togglePowerDevice (device: Moonraker.Power.Device) {
  const confirmOnPowerDeviceChange: boolean = typedState.config.uiSettings.general.confirmOnPowerDeviceChange

  const result = (
    !confirmOnPowerDeviceChange ||
    await confirm(
      tc('app.general.simple_form.msg.confirm_power_device_toggle'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    const state = (device.status === 'on') ? 'off' : 'on'
    SocketActions.machineDevicePowerSetDevice(device.device, state)
  }
}

function getPowerIcon (device: Moonraker.Power.Device) {
  switch (device.status) {
    case 'error': {
      return '$error'
    }
    case 'init': {
      return '$dots'
    }
    case 'on': {
      return '$powerOn'
    }
    case 'off': {
      return '$powerOff'
    }
  }
}

function getPowerButtonText (device: Moonraker.Power.Device): string {
  switch (device.status) {
    case 'error': {
      return `${device.device} [error]`
    }
    default: {
      return `${device.device}`
    }
  }
}
</script>

<style lang="scss" scoped>
  :deep(.v-list-item__action--stack ) {
    margin: 2px 0;
    margin-right: -6px;
    flex-direction: row;
    align-items: center;
  }
</style>

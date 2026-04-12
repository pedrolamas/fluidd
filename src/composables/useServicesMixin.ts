import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { useStore } from './useStore'

export function useServicesMixin () {
  const { typedState, typedDispatch, typedCommit } = useStore()

  const moonrakerServiceName = computed(() =>
    typedState.server.system_info?.instance_ids?.moonraker || 'moonraker'
  )

  const klipperServiceName = computed(() =>
    typedState.server.system_info?.instance_ids?.klipper || 'klipper'
  )

  async function _klipperReset () {
    await typedDispatch('resetKlippy')
  }

  function hostReboot () {
    SocketActions.machineReboot()
  }

  function hostShutdown () {
    SocketActions.machineShutdown()
  }

  async function serviceRestartKlipper () {
    return serviceRestartByName(klipperServiceName.value)
  }

  function serviceRestartMoonraker () {
    return serviceRestartByName(moonrakerServiceName.value)
  }

  async function serviceRestartByName (name: string) {
    if (name === moonrakerServiceName.value) {
      SocketActions.serverRestart()
      typedCommit('socket/setSocketDisconnecting', true)
    } else {
      if (name === klipperServiceName.value) {
        await _klipperReset()
      }
      SocketActions.machineServicesRestart(name)
    }
  }

  async function serviceStartByName (name: string) {
    SocketActions.machineServicesStart(name)
  }

  async function serviceStopByName (name: string) {
    if (name === moonrakerServiceName.value) {
      throw new Error('Stopping the moonraker service is not supported')
    } else {
      if (name === klipperServiceName.value) {
        await _klipperReset()
      }
      SocketActions.machineServicesStop(name)
    }
  }

  async function restartKlippy () {
    await _klipperReset()
    SocketActions.printerRestart()
  }

  async function firmwareRestartKlippy () {
    await _klipperReset()
    SocketActions.printerFirmwareRestart()
  }

  return {
    moonrakerServiceName,
    klipperServiceName,
    hostReboot,
    hostShutdown,
    serviceRestartKlipper,
    serviceRestartMoonraker,
    serviceRestartByName,
    serviceStartByName,
    serviceStopByName,
    restartKlippy,
    firmwareRestartKlippy,
  }
}

import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Waits } from '@/globals'
import type { Macro } from '@/store/macros/types'
import { useStore } from './useStore'
import { useConfirm } from './useConfirm'
import { useI18n } from './useI18n'

export function useStateMixin () {
  const { typedState, typedGetters, typedDispatch } = useStore()
  const confirm = useConfirm()
  const { tc } = useI18n()

  const appReady = computed(() => typedState.config.appReady)
  const authenticated = computed(() => typedState.auth.authenticated)
  const socketConnected = computed(() => typedGetters['socket/getConnectionState'])
  const apiConnected = computed(() => typedGetters['socket/getApiConnected'])
  const socketConnecting = computed(() => typedGetters['socket/getConnectingState'])
  const klippyReady = computed(() => typedGetters['printer/getKlippyReady'])
  const klippyConnected = computed(() => typedGetters['printer/getKlippyConnected'])
  const hasWarnings = computed(() => typedGetters['printer/getHasWarnings'])
  const klippyState = computed(() => typedGetters['printer/getKlippyState'])
  const klippyStateMessage = computed(() => typedGetters['printer/getKlippyStateMessage'])
  const printerState = computed(() => typedGetters['printer/getPrinterState'])
  const printerBusy = computed(() => {
    const state = printerState.value
    return state === 'printing' || state === 'paused' || state === 'busy'
  })
  const printerPaused = computed(() => printerState.value === 'paused')
  const printerPrinting = computed(() => printerState.value === 'printing')
  const printerPoweredOff = computed(() => {
    if (typedGetters['printer/getKlippyConnected']) return false
    const deviceName: string = typedState.config.uiSettings.general.printerPowerDevice ?? 'printer'
    const device = typedGetters['power/getDeviceByName'](deviceName)
    return device?.status === 'off'
  })
  const hasWaits = computed(() => typedGetters['wait/hasWaits'])

  function hasWait (wait: string | string[]): boolean {
    return typedGetters['wait/hasWait'](wait)
  }

  function hasWaitsBy (prefix: string): boolean {
    return typedGetters['wait/hasWaitsBy'](prefix)
  }

  function addConsoleEntry (message: string) {
    typedDispatch('console/onAddConsoleEntry', { message, type: 'command' })
  }

  function sendGcode (gcode: string, wait?: string) {
    SocketActions.printerGcodeScript(gcode, { wait })
    addConsoleEntry(gcode)
  }

  function sendMoveGcode (movement: { X?: number; Y?: number; Z?: number }, rate: number, absolute = false, wait?: string) {
    const macro: Macro | undefined = typedGetters['macros/getMacroByName']('_CLIENT_LINEAR_MOVE')
    const paramSeparator = macro ? '=' : ''
    const movementGcode = Object.entries(movement)
      .map(([key, value]) => `${key}${paramSeparator}${value}`)
      .join(' ')
    const gcode = macro
      ? `${macro.name.toUpperCase()} ${movementGcode} F=${rate * 60}${absolute ? ' ABSOLUTE=1' : ''}`
      : `SAVE_GCODE_STATE NAME=_ui_movement\nG9${absolute ? 0 : 1}\nG1 ${movementGcode} F${rate * 60}\nRESTORE_GCODE_STATE NAME=_ui_movement`
    sendGcode(gcode, wait)
  }

  function sendExtrudeGcode (amount: number, rate: number, wait?: string) {
    const macro: Macro | undefined = typedGetters['macros/getMacroByName']('_CLIENT_LINEAR_MOVE')
    const gcode = macro
      ? `${macro.name.toUpperCase()} E=${amount} F=${rate * 60}`
      : `SAVE_GCODE_STATE NAME=_ui_retract\nM83\nG1 E${amount} F${rate * 60}\nRESTORE_GCODE_STATE NAME=_ui_retract`
    sendGcode(gcode, wait)
  }

  async function emergencyStop () {
    const confirmOnEstop: boolean = typedState.config.uiSettings.general.confirmOnEstop
    const result = (
      !confirmOnEstop ||
      await confirm(
        tc('app.general.simple_form.msg.confirm_emergency_stop'),
        { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
      )
    )
    if (result) {
      SocketActions.printerEmergencyStop()
    }
  }

  async function cancelPrint () {
    const result = await confirm(
      tc('app.general.simple_form.msg.confirm_cancel_print'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
    if (result) {
      SocketActions.printerPrintCancel()
      addConsoleEntry('CANCEL_PRINT')
    }
  }

  function pausePrint () {
    SocketActions.printerPrintPause()
    addConsoleEntry('PAUSE')
  }

  function resumePrint () {
    SocketActions.printerPrintResume()
    addConsoleEntry('RESUME')
  }

  function homeAll () {
    sendGcode('G28', Waits.onHomeAll)
  }

  return {
    appReady,
    authenticated,
    socketConnected,
    apiConnected,
    socketConnecting,
    klippyReady,
    klippyConnected,
    hasWarnings,
    klippyState,
    klippyStateMessage,
    printerState,
    printerBusy,
    printerPaused,
    printerPrinting,
    printerPoweredOff,
    hasWaits,
    hasWait,
    hasWaitsBy,
    sendGcode,
    sendMoveGcode,
    sendExtrudeGcode,
    addConsoleEntry,
    emergencyStop,
    cancelPrint,
    pausePrint,
    resumePrint,
    homeAll,
  }
}

import { computed } from 'vue'
import { useStore } from './useStore'

export function useAfcMixin () {
  const { typedState, typedGetters } = useStore()

  const afc = computed(() => typedState.printer.printer.AFC)
  const afcExtruders = computed(() => afc.value?.extruders ?? [])
  const afcHubs = computed(() => afc.value?.hubs ?? [])
  const afcUnits = computed(() => afc.value?.units ?? [])
  const afcLanes = computed(() => afc.value?.lanes ?? [])

  const afcLoadedSpools = computed(() =>
    afcLanes.value.reduce<Record<number, string>>((acc, laneName) => {
      const lane = getAfcLaneObject(laneName)
      if (lane?.spool_id) {
        acc[lane.spool_id] = lane.name
      }
      return acc
    }, {})
  )

  const afcErrorState = computed(() => afc.value?.error_state === true)

  const afcCurrentLane = computed(() => {
    const laneName = afc.value?.current_load ?? afc.value?.current_lane
    return laneName != null ? getAfcLaneObject(laneName) : undefined
  })

  const afcCurrentBuffer = computed(() => {
    const bufferName = afcCurrentLane.value?.buffer
    return bufferName != null ? getAfcBufferObject(bufferName) : undefined
  })

  const afcCurrentState = computed(() => afc.value?.current_state ?? 'Idle')
  const afcExistsSpoolman = computed(() => typedGetters['server/componentSupport']('spoolman'))
  const afcShowFilamentName = computed(() => typedState.config.uiSettings.afc.showFilamentName)
  const afcShowLaneInfinite = computed(() => typedState.config.uiSettings.afc.showLaneInfinite)
  const afcShowUnitIcons = computed(() => typedState.config.uiSettings.afc.showUnitIcons)
  const afcShowTd1Color = computed(() => typedState.config.uiSettings.afc.showTd1Color)
  const afcHiddenExtruders = computed(() => typedState.config.uiSettings.afc.hiddenExtruders)
  const afcHiddenUnits = computed(() => typedState.config.uiSettings.afc.hiddenUnits)

  function getAfcLaneObject (lane: string): Klipper.AfcLaneState | undefined {
    const printer = typedState.printer.printer
    return (printer[(`AFC_stepper ${lane}`) as keyof typeof printer] as Klipper.AfcLaneState | undefined) ??
      (printer[(`AFC_lane ${lane}`) as keyof typeof printer] as Klipper.AfcLaneState | undefined)
  }

  function getAfcLaneSettings (lane: string): Klipper.AfcLaneSettings | Klipper.AfcStepperSettings | undefined {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return (
      (settings[`afc_stepper ${lane.toLowerCase()}` as keyof Klipper.SettingsState] as Klipper.AfcLaneSettings | undefined) ??
      (settings[`afc_lane ${lane.toLowerCase()}` as keyof Klipper.SettingsState] as Klipper.AfcStepperSettings | undefined)
    )
  }

  function getAfcExtruderObject (extruder: string): Klipper.AfcExtruderState | undefined {
    const printer = typedState.printer.printer
    return printer[(`AFC_extruder ${extruder}`) as keyof typeof printer] as Klipper.AfcExtruderState | undefined
  }

  function getAfcExtruderSettings (extruder: string): Klipper.AfcExtruderSettings | undefined {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings[`afc_extruder ${extruder.toLowerCase()}` as keyof Klipper.SettingsState] as Klipper.AfcExtruderSettings | undefined
  }

  function getAfcBufferObject (buffer: string): Klipper.AfcBufferState | undefined {
    const printer = typedState.printer.printer
    return printer[`AFC_buffer ${buffer}` as keyof typeof printer] as Klipper.AfcBufferState | undefined
  }

  function getAfcBufferSettings (buffer: string): Klipper.AfcBufferSettings | undefined {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings[`afc_buffer ${buffer.toLowerCase()}` as keyof Klipper.SettingsState] as Klipper.AfcBufferSettings | undefined
  }

  function getAfcHubObject (hub: string): Klipper.AfcHubState | undefined {
    const printer = typedState.printer.printer
    return printer[`AFC_hub ${hub}` as keyof typeof printer] as Klipper.AfcHubState | undefined
  }

  function getAfcHubSettings (hub: string): Klipper.AfcHubSettings | undefined {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings[`afc_hub ${hub.toLowerCase()}` as keyof Klipper.SettingsState] as Klipper.AfcHubSettings | undefined
  }

  return {
    afc,
    afcExtruders,
    afcHubs,
    afcUnits,
    afcLanes,
    afcLoadedSpools,
    afcErrorState,
    afcCurrentLane,
    afcCurrentBuffer,
    afcCurrentState,
    afcExistsSpoolman,
    afcShowFilamentName,
    afcShowLaneInfinite,
    afcShowUnitIcons,
    afcShowTd1Color,
    afcHiddenExtruders,
    afcHiddenUnits,
    getAfcLaneObject,
    getAfcLaneSettings,
    getAfcExtruderObject,
    getAfcExtruderSettings,
    getAfcBufferObject,
    getAfcBufferSettings,
    getAfcHubObject,
    getAfcHubSettings,
  }
}

import { computed } from 'vue'
import { useStore } from './useStore'

export function useToolheadMixin () {
  const { typedState, typedGetters, typedDispatch } = useStore()

  const hasExtruder = computed(() => typedGetters['printer/getHasExtruder'])
  const hasMultipleExtruders = computed(() => typedGetters['printer/getHasMultipleExtruders'])
  const activeExtruder = computed(() => typedGetters['printer/getActiveExtruder'])

  const extruderReady = computed(() => {
    const ext = activeExtruder.value
    return (
      ext?.can_extrude ??
      (
        ext !== undefined &&
        ext.temperature >= 0 &&
        ext.min_extrude_temp >= 0 &&
        ext.temperature >= ext.min_extrude_temp
      )
    )
  })

  const extruderDisconnected = computed(() => activeExtruder.value?.disconnected ?? false)
  const filamentDiameter = computed(() => activeExtruder.value?.config?.filament_diameter || 1.75)
  const nozzleDiameter = computed(() => activeExtruder.value?.config?.nozzle_diameter || 0.4)
  const maxExtrudeSpeed = computed(() => activeExtruder.value?.config?.max_extrude_only_velocity || 500)
  const maxExtrudeLength = computed(() => activeExtruder.value?.config?.max_extrude_only_distance || 50)

  const allHomed = computed(() => typedGetters['printer/getHomedAxes']('xyz'))
  const xyHomed = computed(() => typedGetters['printer/getHomedAxes']('xy'))
  const xHomed = computed(() => typedGetters['printer/getHomedAxes']('x'))
  const yHomed = computed(() => typedGetters['printer/getHomedAxes']('y'))
  const zHomed = computed(() => typedGetters['printer/getHomedAxes']('z'))

  const xHasMultipleSteppers = computed(() => {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings.stepper_x1 != null
  })
  const yHasMultipleSteppers = computed(() => {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings.stepper_y1 != null
  })
  const zHasMultipleSteppers = computed(() => {
    const settings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
    return settings.stepper_z1 != null
  })

  const isManualProbeActive = computed(() => typedGetters['printer/getIsManualProbeActive'])
  const isBedScrewsAdjustActive = computed(() => typedGetters['printer/getIsBedScrewsAdjustActive'])
  const hasScrewsTiltAdjustResults = computed(() => typedGetters['printer/getHasScrewsTiltAdjustResults'])

  const manualProbeDialogOpen = computed({
    get: () => typedState.printer.manualProbeDialogOpen,
    set: (value: boolean) => typedDispatch('printer/manualProbeDialogOpen', value)
  })

  const bedScrewsAdjustDialogOpen = computed({
    get: () => typedState.printer.bedScrewsAdjustDialogOpen,
    set: (value: boolean) => typedDispatch('printer/bedScrewsAdjustDialogOpen', value)
  })

  const screwsTiltAdjustDialogOpen = computed({
    get: () => typedState.printer.screwsTiltAdjustDialogOpen,
    set: (value: boolean) => typedDispatch('printer/screwsTiltAdjustDialogOpen', value)
  })

  const forceMoveEnabled = computed(() => typedState.printer.forceMoveEnabled)

  return {
    hasExtruder,
    hasMultipleExtruders,
    activeExtruder,
    extruderReady,
    extruderDisconnected,
    filamentDiameter,
    nozzleDiameter,
    maxExtrudeSpeed,
    maxExtrudeLength,
    allHomed,
    xyHomed,
    xHomed,
    yHomed,
    zHomed,
    xHasMultipleSteppers,
    yHasMultipleSteppers,
    zHasMultipleSteppers,
    isManualProbeActive,
    isBedScrewsAdjustActive,
    hasScrewsTiltAdjustResults,
    manualProbeDialogOpen,
    bedScrewsAdjustDialogOpen,
    screwsTiltAdjustDialogOpen,
    forceMoveEnabled,
  }
}

import { computed } from 'vue'
import { TinyColor } from '@ctrl/tinycolor'
import type { Spool } from '@/store/spoolman/types'
import type { AppFileWithMeta } from '@/store/files/types'
import type { MmuGateDetails, SlicerToolDetails, MmuUnitDetails } from '@/types'
import { useStore } from './useStore'

// Constants (exported for direct use without calling the composable)
export const UNIT_UNKNOWN = -1
export const TOOL_GATE_UNKNOWN = -1
export const TOOL_GATE_BYPASS = -2
export const FILAMENT_POS_UNKNOWN = -1
export const FILAMENT_POS_UNLOADED = 0
export const FILAMENT_POS_HOMED_GATE = 1
export const FILAMENT_POS_START_BOWDEN = 2
export const FILAMENT_POS_IN_BOWDEN = 3
export const FILAMENT_POS_END_BOWDEN = 4
export const FILAMENT_POS_HOMED_ENTRY = 5
export const FILAMENT_POS_HOMED_EXTRUDER = 6
export const FILAMENT_POS_EXTRUDER_ENTRY = 7
export const FILAMENT_POS_HOMED_TS = 8
export const FILAMENT_POS_IN_EXTRUDER = 9
export const FILAMENT_POS_LOADED = 10
export const DIRECTION_LOAD = 1
export const DIRECTION_UNKNOWN = 0
export const DIRECTION_UNLOAD = -1
export const GATE_UNKNOWN = -1
export const GATE_EMPTY = 0
export const GATE_AVAILABLE = 1
export const GATE_AVAILABLE_FROM_BUFFER = 2
export const ACTION_IDLE = 'Idle'
export const ACTION_LOADING = 'Loading'
export const ACTION_LOADING_EXTRUDER = 'Loading Ext'
export const ACTION_UNLOADING = 'Unloading'
export const ACTION_UNLOADING_EXTRUDER = 'Unloading Ext'
export const ACTION_FORMING_TIP = 'Forming Tip'
export const ACTION_CUTTING_TIP = 'Cutting Tip'
export const ACTION_HEATING = 'Heating'
export const ACTION_CHECKING = 'Checking'
export const ACTION_HOMING = 'Homing'
export const ACTION_SELECTING = 'Selecting'
export const ACTION_CUTTING_FILAMENT = 'Cutting Filament'
export const ACTION_PURGING = 'Purging'
export const SYNC_FEEDBACK_COMPRESSED = 'compressed'
export const SYNC_FEEDBACK_TENSION = 'tension'
export const SYNC_FEEDBACK_NEUTRAL = 'neutral'
export const SYNC_FEEDBACK_NONE = ''
export const SPOOLMAN_OFF = 'off'
export const SPOOLMAN_READONLY = 'readonly'
export const SPOOLMAN_PUSH = 'push'
export const SPOOLMAN_PULL = 'pull'
export const ESPOOLER_REWIND = 'rewind'
export const ESPOOLER_ASSIST = 'assist'
export const DRYING_STATE_ACTIVE = 'active'
export const DRYING_STATE_QUEUED = 'queued'
export const DRYING_STATE_COMPLETE = 'complete'
export const DRYING_STATE_CANCELLED = 'cancelled'
export const DRYING_STATUS_NONE = ''
export const NO_FILAMENT_COLOR = '#808182E3'
export const LED_OPTIONS = ['off', 'gate_status', 'filament_color', 'slicer_color'] as const
export const LED_STATUS_OPTIONS = [...LED_OPTIONS, 'on'] as const
export const T_MACRO_COLOR_OPTIONS = ['slicer', 'allgates', 'gatemap', 'off'] as const
export const AUTOMAP_OPTIONS = ['none', 'filament_name', 'material', 'color', 'closest_color', 'spool_id'] as const

export function useMmuMixin () {
  const { typedState, typedGetters } = useStore()

  const mmuState = computed(() => typedState.printer.printer.mmu)
  const hasMmu = computed(() => mmuState.value != null)
  const hasEncoder = computed(() => mmuState.value?.encoder != null)

  const encoderPos = computed(() => Math.round(mmuState.value?.encoder?.encoder_pos ?? 0))
  const encoderEnabled = computed(() => mmuState.value?.encoder?.enabled ?? false)
  const encoderDesiredHeadroom = computed(() => mmuState.value?.encoder?.desired_headroom ?? 0)
  const encoderDetectionLength = computed(() => mmuState.value?.encoder?.detection_length ?? 0)
  const encoderDetectionMode = computed(() => mmuState.value?.encoder?.detection_mode ?? 0)
  const encoderFlowRate = computed(() => mmuState.value?.encoder?.flow_rate ?? 0)

  const numUnits = computed(() => typedState.printer.printer.mmu_machine?.num_units ?? 1)

  function unitDetails (unitIndex: number): MmuUnitDetails {
    const unitRef = `unit_${unitIndex}` as Klipper.MmuUnitKey
    const mmuMachine = typedState.printer.printer.mmu_machine
    return {
      name: mmuMachine?.[unitRef]?.name ?? 'Unit',
      vendor: mmuMachine?.[unitRef]?.vendor ?? 'Other',
      version: mmuMachine?.[unitRef]?.version ?? '1.0',
      numGates: mmuMachine?.[unitRef]?.num_gates ?? 1,
      firstGate: mmuMachine?.[unitRef]?.first_gate ?? 0,
      selectorType: mmuMachine?.[unitRef]?.selector_type ?? 'VirtualSelector',
      variableRotationDistances: mmuMachine?.[unitRef]?.variable_rotation_distances ?? true,
      variableBowdenLengths: mmuMachine?.[unitRef]?.variable_bowden_lengths ?? true,
      requireBowdenMove: mmuMachine?.[unitRef]?.require_bowden_move ?? true,
      filamentAlwaysGripped: mmuMachine?.[unitRef]?.filament_always_gripped ?? false,
      canCrossload: mmuMachine?.[unitRef]?.can_crossload ?? false,
      hasBypass: mmuMachine?.[unitRef]?.has_bypass ?? false,
      multiGear: mmuMachine?.[unitRef]?.multi_gear ?? false,
      environmentSensor: mmuMachine?.[unitRef]?.environment_sensor ?? '',
      filamentHeater: mmuMachine?.[unitRef]?.filament_heater ?? '',
      environmentSensors: mmuMachine?.[unitRef]?.environment_sensors,
      filamentHeaters: mmuMachine?.[unitRef]?.filament_heaters
    }
  }

  const enabled = computed(() => mmuState.value?.enabled ?? false)
  const numGates = computed(() => mmuState.value?.num_gates ?? 0)
  const printState = computed(() => mmuState.value?.print_state ?? 'ready')
  const isPrinting = computed(() => ['started', 'printing'].includes(printState.value))
  const isInPrint = computed(() => ['printing', 'pause_locked', 'paused'].includes(printState.value))
  const isMmuPaused = computed(() => mmuState.value?.is_paused ?? false)
  const isMmuPausedAndLocked = computed(() => ['pause_locked'].includes(printState.value))
  const isHomed = computed(() => mmuState.value?.is_homed ?? false)
  const unit = computed(() => mmuState.value?.unit ?? UNIT_UNKNOWN)
  const gate = computed(() => mmuState.value?.gate ?? TOOL_GATE_UNKNOWN)
  const tool = computed(() => mmuState.value?.tool ?? TOOL_GATE_UNKNOWN)
  const numToolchanges = computed(() => mmuState.value?.num_toolchanges ?? 0)
  const lastTool = computed(() => mmuState.value?.last_tool ?? TOOL_GATE_UNKNOWN)
  const nextTool = computed(() => mmuState.value?.next_tool ?? TOOL_GATE_UNKNOWN)
  const toolchangePurgeVolue = computed(() => mmuState.value?.toolchange_purge_volume ?? 0)
  const lastToolchange = computed(() => mmuState.value?.last_toolchange ?? '')
  const operation = computed(() => mmuState.value?.operation ?? '')
  const filament = computed(() => mmuState.value?.filament ?? '')
  const filamentPosition = computed(() => (mmuState.value?.filament_position ?? 0).toFixed(1))
  const filamentPos = computed(() => mmuState.value?.filament_pos ?? FILAMENT_POS_UNKNOWN)
  const filamentDirection = computed(() => mmuState.value?.filament_direction ?? DIRECTION_UNKNOWN)
  const bowdenProgress = computed(() => mmuState.value?.bowden_progress ?? -1)
  const ttgMap = computed(() => mmuState.value?.ttg_map ?? [])
  const endlessSpoolGroups = computed(() => mmuState.value?.endless_spool_groups ?? [])
  const gateStatus = computed(() => mmuState.value?.gate_status ?? [])
  const gateFilamentName = computed(() => mmuState.value?.gate_filament_name ?? [])
  const gateMaterial = computed(() => mmuState.value?.gate_material ?? [])
  const gateColor = computed(() => mmuState.value?.gate_color ?? [])
  const gateTemperature = computed(() => mmuState.value?.gate_temperature ?? [])
  const gateSpoolId = computed(() => mmuState.value?.gate_spool_id ?? [])
  const gateSpeedOverride = computed(() => mmuState.value?.gate_speed_override ?? [])
  const gateMap = computed(() => gateStatus.value.map((_, index) => gateDetails(index)))

  function fromColorString (color: string | null): string {
    return color
      ? new TinyColor(color).toHex8String().toUpperCase()
      : NO_FILAMENT_COLOR
  }

  function gateDetails (gateIndex: number): MmuGateDetails {
    const gd: MmuGateDetails = {
      index: -1,
      status: -1,
      filamentName: 'No active spool',
      material: 'Unknown',
      color: '',
      temperature: -1,
      spoolId: -1,
      speedOverride: 100,
      endlessSpoolGroup: null
    }

    if (gateIndex === TOOL_GATE_BYPASS) {
      gd.index = -2
      gd.status = -1
      if (gate.value === gateIndex) {
        const activeSpool = typedGetters['spoolman/getActiveSpool']
        gd.filamentName = activeSpool?.filament?.name ?? 'No active spool'
        gd.material = activeSpool?.filament?.material ?? 'Unknown'
        gd.color = fromColorString(activeSpool?.filament?.color_hex ?? null)
        gd.temperature = activeSpool?.filament?.settings_extruder_temp ?? -1
        gd.spoolId = activeSpool?.id ?? -1
      } else {
        gd.filamentName = 'Unknown'
        gd.material = 'Unknown'
        gd.color = fromColorString(null)
        gd.temperature = -1
        gd.spoolId = -1
      }
      gd.speedOverride = 100
      gd.endlessSpoolGroup = null
    } else {
      gd.index = gateIndex
      gd.status = mmuState.value?.gate_status?.[gateIndex] ?? -1
      gd.filamentName = mmuState.value?.gate_filament_name?.[gateIndex] || 'Unknown'
      gd.material = mmuState.value?.gate_material?.[gateIndex] || 'Unknown'
      gd.color = fromColorString(mmuState.value?.gate_color[gateIndex] ?? '')
      gd.temperature = mmuState.value?.gate_temperature?.[gateIndex] ?? -1
      gd.spoolId = mmuState.value?.gate_spool_id?.[gateIndex] ?? -1
      gd.speedOverride = mmuState.value?.gate_speed_override?.[gateIndex] ?? 100
      gd.endlessSpoolGroup = mmuState.value?.endless_spool_groups?.[gateIndex] ?? gateIndex
    }
    return gd
  }

  function spoolmanSpool (spoolId: number | null): Spool | undefined {
    if (spoolId != null) return typedGetters['spoolman/getSpoolById'](spoolId)
  }

  const slicerToolMap = computed(() => mmuState.value?.slicer_tool_map)

  function toolDetails (toolIndex: number, file?: AppFileWithMeta | null): SlicerToolDetails {
    const td: SlicerToolDetails = {
      color: '',
      material: 'Unknown',
      temp: -1,
      name: 'Unknown',
      inUse: false
    }

    if (file) {
      let c1, c2
      switch (file.slicer) {
        case 'OrcaSlicer':
        case 'BambuStudio':
          c1 = file.filament_colors ?? []
          c2 = file.extruder_colors ?? []
          break
        case 'SuperSlicer':
        default:
          c1 = file.extruder_colors ?? []
          c2 = file.filament_colors ?? []
          break
      }
      const colors = c1.length === 0 || c1.every((c: string) => c === '') ? c2 : c1
      td.color = colors.length > toolIndex ? fromColorString(colors[toolIndex]) : fromColorString('')
      const materials = file.filament_type ?? []
      td.material = materials.length > toolIndex ? materials[toolIndex] : 'Unknown'
      const temps = file.filament_temps ?? []
      td.temp = temps.length > toolIndex ? temps[toolIndex] : -1
      const names = file.filament_name ?? []
      td.name = names.length > toolIndex ? names[toolIndex] : 'Unknown'
      const referencedTools = file.referenced_tools ?? []
      td.inUse = referencedTools?.includes(toolIndex) ?? false
    } else {
      td.color = fromColorString(mmuState.value?.slicer_tool_map?.tools?.[toolIndex]?.color ?? '')
      td.material = mmuState.value?.slicer_tool_map?.tools?.[toolIndex]?.material || 'Unknown'
      td.temp = mmuState.value?.slicer_tool_map?.tools?.[toolIndex]?.temp ?? -1
      td.name = mmuState.value?.slicer_tool_map?.tools?.[toolIndex]?.name || 'Unknown'
      td.inUse = mmuState.value?.slicer_tool_map?.tools?.[toolIndex]?.in_use || false
    }
    return td
  }

  const action = computed(() => mmuState.value?.action)
  const hasBypass = computed(() => mmuState.value?.has_bypass ?? false)
  const syncDrive = computed(() => mmuState.value?.sync_drive ?? false)
  const syncFeedbackState = computed(() => mmuState.value?.sync_feedback_state ?? SYNC_FEEDBACK_NONE)
  const syncFeedbackEnabled = computed(() => mmuState.value?.sync_feedback_enabled ?? false)
  const syncFeedbackBiasModelled = computed(() => mmuState.value?.sync_feedback_bias_modelled ?? 0)
  const clogDetectionEnabled = computed(() => mmuState.value?.clog_detection_enabled !== 0)
  const endlessSpoolEnabled = computed(() => mmuState.value?.endless_spool_enabled !== 0)
  const reasonForPause = computed(() => mmuState.value?.reason_for_pause ?? '')
  const extruderFilamentRemaining = computed(() => mmuState.value?.extruder_filament_remaining ?? 0)
  const spoolmanSupport = computed(() => mmuState.value?.spoolman_support ?? SPOOLMAN_OFF)
  const sensors = computed(() => mmuState.value?.sensors ?? {})
  const espoolerActive = computed(() => mmuState.value?.espooler_active ?? '')
  const dryingState = computed(() => mmuState.value?.drying_state ?? [])
  const servo = computed(() => mmuState.value?.servo ?? 'Unknown')
  const grip = computed(() => mmuState.value?.grip ?? 'Unknown')

  const configGateHomingEndstop = computed(() =>
    typedState.printer.printer.configfile.config.mmu?.gate_homing_endstop ?? 'encoder'
  )
  const configExtruderHomingEndstop = computed(() =>
    typedState.printer.printer.configfile.config.mmu?.extruder_homing_endstop ?? 'none'
  )
  const configExtruderForceHoming = computed(() =>
    (typedState.printer.printer.configfile.config.mmu?.extruder_force_homing ?? '0') === '1'
  )
  const configTMacroColor = computed(() =>
    typedState.printer.printer.configfile.config.mmu?.t_macro_color ?? 'slicer'
  )
  const varsCalibrationBowdenLengths = computed(() =>
    typedState.printer.printer.save_variables?.variables?.mmu_calibration_bowden_lengths
  )
  const varsFilamentRemaining = computed(() =>
    typedState.printer.printer.save_variables?.variables?.mmu_state_filament_remaining ?? 0
  )
  const varsFilamentRemainingColor = computed(() => {
    const color = typedState.printer.printer.save_variables?.variables?.mmu_state_filament_remaining_color ?? ''
    if (color) return fromColorString(color)
    return color
  })
  const macroVarsLedEnable = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_LED_VARS']?.led_enable ?? false
  )
  const macroVarsLedAnimation = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_LED_VARS']?.led_animation ?? true
  )
  const macroVarsDefaultEntryEffect = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_LED_VARS']?.default_entry_effect ?? 'off'
  )
  const macroVarsDefaultExitEffect = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_LED_VARS']?.default_exit_effect ?? 'off'
  )
  const macroVarsDefaultStatusEffect = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_LED_VARS']?.default_status_effect ?? 'off'
  )
  const macroVarsAutomapStrategy = computed(() =>
    typedState.printer.printer['gcode_macro _MMU_SOFTWARE_VARS']?.automap_strategy ?? 'none'
  )

  const spoolWidth = computed(() => {
    if (numGates.value <= 8) return 56
    if (numGates.value <= 16) return 48
    return 40
  })

  function gateText (gate: number): string {
    return gate === -1 ? '?' : gate === TOOL_GATE_BYPASS ? 'Bypass' : '@' + gate
  }

  function toolText (tool: number): string {
    return tool === -1 ? 'T?' : tool === TOOL_GATE_BYPASS ? 'Bypass' : 'T' + tool
  }

  const toolchangeText = computed(() => {
    if (nextTool.value === TOOL_GATE_UNKNOWN) return ''
    const fromText = lastTool.value !== TOOL_GATE_UNKNOWN
      ? ` from ${lastTool.value === TOOL_GATE_BYPASS ? 'Bypass' : `T${lastTool.value}`}`
      : ''
    const toText = ` to ${nextTool.value === TOOL_GATE_BYPASS ? 'Bypass' : `T${nextTool.value}`}`
    return `Changing tool${fromText}${toText}`
  })

  const canSend = computed(() => {
    const idleTimeout = typedState.printer.printer.idle_timeout?.state
    return !['Printing'].includes(idleTimeout)
  })

  return {
    mmuState,
    hasMmu,
    hasEncoder,
    encoderPos,
    encoderEnabled,
    encoderDesiredHeadroom,
    encoderDetectionLength,
    encoderDetectionMode,
    encoderFlowRate,
    numUnits,
    unitDetails,
    enabled,
    numGates,
    printState,
    isPrinting,
    isInPrint,
    isMmuPaused,
    isMmuPausedAndLocked,
    isHomed,
    unit,
    gate,
    tool,
    numToolchanges,
    lastTool,
    nextTool,
    toolchangePurgeVolue,
    lastToolchange,
    operation,
    filament,
    filamentPosition,
    filamentPos,
    filamentDirection,
    bowdenProgress,
    ttgMap,
    endlessSpoolGroups,
    gateStatus,
    gateFilamentName,
    gateMaterial,
    gateColor,
    gateTemperature,
    gateSpoolId,
    gateSpeedOverride,
    gateMap,
    gateDetails,
    spoolmanSpool,
    slicerToolMap,
    toolDetails,
    action,
    hasBypass,
    syncDrive,
    syncFeedbackState,
    syncFeedbackEnabled,
    syncFeedbackBiasModelled,
    clogDetectionEnabled,
    endlessSpoolEnabled,
    reasonForPause,
    extruderFilamentRemaining,
    spoolmanSupport,
    sensors,
    espoolerActive,
    dryingState,
    servo,
    grip,
    configGateHomingEndstop,
    configExtruderHomingEndstop,
    configExtruderForceHoming,
    configTMacroColor,
    varsCalibrationBowdenLengths,
    varsFilamentRemaining,
    varsFilamentRemainingColor,
    macroVarsLedEnable,
    macroVarsLedAnimation,
    macroVarsDefaultEntryEffect,
    macroVarsDefaultExitEffect,
    macroVarsDefaultStatusEffect,
    macroVarsAutomapStrategy,
    spoolWidth,
    fromColorString,
    gateText,
    toolText,
    toolchangeText,
    canSend,
  }
}

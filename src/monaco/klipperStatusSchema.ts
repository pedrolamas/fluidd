export type FieldType = 'number' | 'string' | 'boolean' | 'array' | 'object' | 'unknown'

export interface FieldDef {
  name: string
  type: FieldType
  description?: string
}

export interface ObjectDef {
  match: { kind: 'exact'; name: string } | { kind: 'prefix'; prefix: string }
  fields: FieldDef[]
}

const extruderFields: FieldDef[] = [
  { name: 'temperature', type: 'number' },
  { name: 'target', type: 'number' },
  { name: 'power', type: 'number' },
  { name: 'can_extrude', type: 'boolean' },
  { name: 'pressure_advance', type: 'number' },
  { name: 'smooth_time', type: 'number' },
  { name: 'motion_queue', type: 'string' },
  { name: 'pid_profile', type: 'string' }
]

const fanFields: FieldDef[] = [
  { name: 'speed', type: 'number' },
  { name: 'rpm', type: 'number' },
  { name: 'power', type: 'number' },
  { name: 'value', type: 'number' }
]

const probeFields: FieldDef[] = [
  { name: 'name', type: 'string' },
  { name: 'last_query', type: 'number' },
  { name: 'last_z_result', type: 'number' },
  { name: 'last_probe_position', type: 'array' }
]

const temperatureSensorFields: FieldDef[] = [
  { name: 'temperature', type: 'number' },
  { name: 'measured_min_temp', type: 'number' },
  { name: 'measured_max_temp', type: 'number' }
]

export const klipperStatusSchema: ObjectDef[] = [
  // Always-present objects
  {
    match: { kind: 'exact', name: 'toolhead' },
    fields: [
      { name: 'homed_axes', type: 'string' },
      { name: 'axis_minimum', type: 'array' },
      { name: 'axis_maximum', type: 'array' },
      { name: 'print_time', type: 'number' },
      { name: 'stalls', type: 'number' },
      { name: 'estimated_print_time', type: 'number' },
      { name: 'extruder', type: 'string' },
      { name: 'position', type: 'array' },
      { name: 'max_velocity', type: 'number' },
      { name: 'max_accel', type: 'number' },
      { name: 'max_accel_to_decel', type: 'number' },
      { name: 'minimum_cruise_ratio', type: 'number' },
      { name: 'square_corner_velocity', type: 'number' },
      { name: 'cone_start_z', type: 'number' },
      { name: 'extra_axes', type: 'object' }
    ]
  },
  {
    match: { kind: 'exact', name: 'gcode_move' },
    fields: [
      { name: 'speed_factor', type: 'number' },
      { name: 'speed', type: 'number' },
      { name: 'extrude_factor', type: 'number' },
      { name: 'absolute_coordinates', type: 'boolean' },
      { name: 'absolute_extrude', type: 'boolean' },
      { name: 'homing_origin', type: 'array' },
      { name: 'position', type: 'array' },
      { name: 'gcode_position', type: 'array' },
      { name: 'axis_map', type: 'object' }
    ]
  },
  {
    match: { kind: 'exact', name: 'idle_timeout' },
    fields: [
      { name: 'state', type: 'string', description: '"Idle" | "Printing" | "Ready"' },
      { name: 'printing_time', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'system_stats' },
    fields: [
      { name: 'sysload', type: 'number' },
      { name: 'cputime', type: 'number' },
      { name: 'memavail', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'webhooks' },
    fields: [
      { name: 'state', type: 'string' },
      { name: 'state_message', type: 'string' }
    ]
  },
  {
    match: { kind: 'exact', name: 'configfile' },
    fields: [
      { name: 'config', type: 'object' },
      { name: 'settings', type: 'object' },
      { name: 'warnings', type: 'array' },
      { name: 'save_config_pending', type: 'boolean' },
      { name: 'save_config_pending_items', type: 'object' }
    ]
  },
  // Conditionally-present objects
  {
    match: { kind: 'exact', name: 'extruder' },
    fields: extruderFields
  },
  {
    match: { kind: 'prefix', prefix: 'extruder' },
    fields: extruderFields
  },
  {
    match: { kind: 'exact', name: 'heater_bed' },
    fields: [
      { name: 'temperature', type: 'number' },
      { name: 'target', type: 'number' },
      { name: 'power', type: 'number' },
      { name: 'pid_profile', type: 'string' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'heater_generic ' },
    fields: [
      { name: 'temperature', type: 'number' },
      { name: 'target', type: 'number' },
      { name: 'power', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'fan' },
    fields: fanFields
  },
  {
    match: { kind: 'prefix', prefix: 'heater_fan ' },
    fields: fanFields
  },
  {
    match: { kind: 'prefix', prefix: 'controller_fan ' },
    fields: fanFields
  },
  {
    match: { kind: 'prefix', prefix: 'temperature_fan ' },
    fields: [
      ...fanFields,
      { name: 'temperature', type: 'number' },
      { name: 'target', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'print_stats' },
    fields: [
      { name: 'filename', type: 'string' },
      { name: 'total_duration', type: 'number' },
      { name: 'print_duration', type: 'number' },
      { name: 'filament_used', type: 'number' },
      { name: 'state', type: 'string', description: '"printing" | "paused" | "standby" | "complete" | "cancelled" | "error"' },
      { name: 'message', type: 'string' },
      { name: 'info', type: 'object' }
    ]
  },
  {
    match: { kind: 'exact', name: 'virtual_sdcard' },
    fields: [
      { name: 'file_path', type: 'string' },
      { name: 'progress', type: 'number' },
      { name: 'is_active', type: 'boolean' },
      { name: 'file_position', type: 'number' },
      { name: 'file_size', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'pause_resume' },
    fields: [
      { name: 'is_paused', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'display_status' },
    fields: [
      { name: 'progress', type: 'number' },
      { name: 'message', type: 'string' }
    ]
  },
  {
    match: { kind: 'exact', name: 'bed_mesh' },
    fields: [
      { name: 'profile_name', type: 'string' },
      { name: 'mesh_min', type: 'array' },
      { name: 'mesh_max', type: 'array' },
      { name: 'probed_matrix', type: 'array' },
      { name: 'mesh_matrix', type: 'array' },
      { name: 'profiles', type: 'object' }
    ]
  },
  {
    match: { kind: 'exact', name: 'bed_screws' },
    fields: [
      { name: 'is_active', type: 'boolean' },
      { name: 'state', type: 'string' },
      { name: 'current_screw', type: 'number' },
      { name: 'accepted_screws', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'heaters' },
    fields: [
      { name: 'available_heaters', type: 'array' },
      { name: 'available_sensors', type: 'array' },
      { name: 'available_monitors', type: 'array' }
    ]
  },
  {
    match: { kind: 'exact', name: 'motion_report' },
    fields: [
      { name: 'live_position', type: 'array' },
      { name: 'live_velocity', type: 'number' },
      { name: 'live_extruder_velocity', type: 'number' },
      { name: 'steppers', type: 'array' },
      { name: 'trapq', type: 'array' }
    ]
  },
  {
    match: { kind: 'exact', name: 'exclude_object' },
    fields: [
      { name: 'objects', type: 'array' },
      { name: 'current_object', type: 'string' },
      { name: 'excluded_objects', type: 'array' }
    ]
  },
  {
    match: { kind: 'exact', name: 'firmware_retraction' },
    fields: [
      { name: 'retract_length', type: 'number' },
      { name: 'retract_speed', type: 'number' },
      { name: 'unretract_extra_length', type: 'number' },
      { name: 'unretract_speed', type: 'number' },
      { name: 'unretract_length', type: 'number' },
      { name: 'retract_state', type: 'boolean' },
      { name: 'z_hop_height', type: 'number' },
      { name: 'zhop_state', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'probe' },
    fields: probeFields
  },
  {
    match: { kind: 'exact', name: 'bltouch' },
    fields: probeFields
  },
  {
    match: { kind: 'exact', name: 'smart_effector' },
    fields: probeFields
  },
  {
    match: { kind: 'prefix', prefix: 'probe_eddy_current ' },
    fields: probeFields
  },
  {
    match: { kind: 'exact', name: 'quad_gantry_level' },
    fields: [{ name: 'applied', type: 'boolean' }]
  },
  {
    match: { kind: 'exact', name: 'z_tilt' },
    fields: [{ name: 'applied', type: 'boolean' }]
  },
  {
    match: { kind: 'exact', name: 'skew_correction' },
    fields: [{ name: 'current_profile_name', type: 'string' }]
  },
  {
    match: { kind: 'exact', name: 'manual_probe' },
    fields: [
      { name: 'is_active', type: 'boolean' },
      { name: 'z_position', type: 'number' },
      { name: 'z_position_lower', type: 'number' },
      { name: 'z_position_upper', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'screws_tilt_adjust' },
    fields: [
      { name: 'error', type: 'boolean' },
      { name: 'max_deviation', type: 'number' },
      { name: 'results', type: 'object' }
    ]
  },
  {
    match: { kind: 'exact', name: 'stepper_enable' },
    fields: [{ name: 'steppers', type: 'object' }]
  },
  {
    match: { kind: 'exact', name: 'query_endstops' },
    fields: [{ name: 'last_query', type: 'object' }]
  },
  {
    match: { kind: 'exact', name: 'gcode' },
    fields: [{ name: 'commands', type: 'object' }]
  },
  {
    match: { kind: 'exact', name: 'mcu' },
    fields: [
      { name: 'mcu_version', type: 'string' },
      { name: 'mcu_build_versions', type: 'string' },
      { name: 'mcu_constants', type: 'object' },
      { name: 'last_stats', type: 'object' },
      { name: 'app', type: 'string' },
      { name: 'non_critical_disconnected', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'mcu ' },
    fields: [
      { name: 'mcu_version', type: 'string' },
      { name: 'mcu_build_versions', type: 'string' },
      { name: 'mcu_constants', type: 'object' },
      { name: 'last_stats', type: 'object' },
      { name: 'app', type: 'string' },
      { name: 'non_critical_disconnected', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'dual_carriage' },
    fields: [
      { name: 'carriage_0', type: 'string', description: '"INACTIVE" | "ACTIVE"' },
      { name: 'carriage_1', type: 'string', description: '"INACTIVE" | "ACTIVE" | "COPY" | "MIRROR"' }
    ]
  },
  {
    match: { kind: 'exact', name: 'z_thermal_adjust' },
    fields: [
      { name: 'enabled', type: 'boolean' },
      { name: 'temperature', type: 'number' },
      { name: 'measured_min_temp', type: 'number' },
      { name: 'measured_max_temp', type: 'number' },
      { name: 'current_z_adjust', type: 'number' },
      { name: 'z_adjust_ref_temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'hall_filament_width_sensor' },
    fields: [
      { name: 'is_active', type: 'boolean' },
      { name: 'Diameter', type: 'number' },
      { name: 'Raw', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'endstop_phase' },
    fields: [{ name: 'last_home', type: 'object' }]
  },
  {
    match: { kind: 'exact', name: 'menu' },
    fields: [
      { name: 'timeout', type: 'number' },
      { name: 'running', type: 'boolean' },
      { name: 'rows', type: 'number' },
      { name: 'cols', type: 'number' }
    ]
  },
  {
    match: { kind: 'exact', name: 'load_cell' },
    fields: [
      { name: 'is_calibrated', type: 'boolean' },
      { name: 'counts_per_gram', type: 'number' },
      { name: 'reference_tare_counts', type: 'number' },
      { name: 'tare_counts', type: 'number' },
      { name: 'force_g', type: 'number' },
      { name: 'min_force_g', type: 'number' },
      { name: 'max_force_g', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'load_cell ' },
    fields: [
      { name: 'is_calibrated', type: 'boolean' },
      { name: 'counts_per_gram', type: 'number' },
      { name: 'reference_tare_counts', type: 'number' },
      { name: 'tare_counts', type: 'number' },
      { name: 'force_g', type: 'number' },
      { name: 'min_force_g', type: 'number' },
      { name: 'max_force_g', type: 'number' }
    ]
  },
  // Parameterized objects
  {
    match: { kind: 'prefix', prefix: 'angle ' },
    fields: [{ name: 'temperature', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'extruder_stepper ' },
    fields: [
      { name: 'pressure_advance', type: 'number' },
      { name: 'smooth_time', type: 'number' },
      { name: 'motion_queue', type: 'string' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'filament_switch_sensor ' },
    fields: [
      { name: 'enabled', type: 'boolean' },
      { name: 'filament_detected', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'filament_motion_sensor ' },
    fields: [
      { name: 'enabled', type: 'boolean' },
      { name: 'filament_detected', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'gcode_button ' },
    fields: [
      { name: 'state', type: 'string', description: '"PRESSED" | "RELEASED"' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'gcode_macro ' },
    fields: []
  },
  {
    match: { kind: 'prefix', prefix: 'led ' },
    fields: [{ name: 'color_data', type: 'array' }]
  },
  {
    match: { kind: 'prefix', prefix: 'neopixel ' },
    fields: [{ name: 'color_data', type: 'array' }]
  },
  {
    match: { kind: 'prefix', prefix: 'dotstar ' },
    fields: [{ name: 'color_data', type: 'array' }]
  },
  {
    match: { kind: 'prefix', prefix: 'pca9533 ' },
    fields: [{ name: 'color_data', type: 'array' }]
  },
  {
    match: { kind: 'prefix', prefix: 'pca9632 ' },
    fields: [{ name: 'color_data', type: 'array' }]
  },
  {
    match: { kind: 'prefix', prefix: 'output_pin ' },
    fields: [{ name: 'value', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'pwm_tool ' },
    fields: [{ name: 'value', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'pwm_cycle_time ' },
    fields: [{ name: 'value', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'servo ' },
    fields: [{ name: 'value', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'temperature_sensor ' },
    fields: temperatureSensorFields
  },
  {
    match: { kind: 'prefix', prefix: 'temperature_probe ' },
    fields: [
      ...temperatureSensorFields,
      { name: 'in_calibration', type: 'boolean' },
      { name: 'estimated_expansion', type: 'number' },
      { name: 'compensation_enabled', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'aht10 ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'aht1x ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'aht2x ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'aht3x ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'bme280 ' },
    fields: [
      { name: 'temperature', type: 'number' },
      { name: 'humidity', type: 'number' },
      { name: 'pressure', type: 'number' },
      { name: 'gas', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'htu21d ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'sht3x ' },
    fields: [{ name: 'temperature', type: 'number' }, { name: 'humidity', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'lm75 ' },
    fields: [{ name: 'temperature', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'temperature_host ' },
    fields: [{ name: 'temperature', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'temperature_combined ' },
    fields: [{ name: 'temperature', type: 'number' }]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc2130 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc2208 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc2209 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc2660 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc2240 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  {
    match: { kind: 'prefix', prefix: 'tmc5160 ' },
    fields: [
      { name: 'mcu_phase_offset', type: 'number' },
      { name: 'phase_offset_position', type: 'number' },
      { name: 'run_current', type: 'number' },
      { name: 'hold_current', type: 'number' },
      { name: 'drv_status', type: 'object' },
      { name: 'temperature', type: 'number' }
    ]
  },
  // Kalico-specific
  {
    match: { kind: 'prefix', prefix: 'belay ' },
    fields: [
      { name: 'last_state', type: 'boolean' },
      { name: 'enabled', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'dockable_probe' },
    fields: [
      { name: 'last_status', type: 'string', description: '"UNKNOWN" | "ATTACHED" | "DOCKED"' }
    ]
  },
  {
    match: { kind: 'exact', name: 'mixing_extruder' },
    fields: [
      { name: 'mixing', type: 'string' },
      { name: 'ticks', type: 'string' }
    ]
  },
  {
    match: { kind: 'exact', name: 'tools_calibrate' },
    fields: [
      { name: 'sensor_location', type: 'object' },
      { name: 'last_result', type: 'object' },
      { name: 'calibration_probe_inactive', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'trad_rack' },
    fields: [
      { name: 'curr_lane', type: 'number' },
      { name: 'active_lane', type: 'number' },
      { name: 'next_lane', type: 'number' },
      { name: 'next_tool', type: 'number' },
      { name: 'tool_map', type: 'array' },
      { name: 'selector_homed', type: 'boolean' }
    ]
  },
  {
    match: { kind: 'exact', name: 'z_calibration' },
    fields: [
      { name: 'last_query', type: 'boolean' },
      { name: 'last_z_offset', type: 'number' }
    ]
  },
  // Third-party
  {
    match: { kind: 'exact', name: 'beacon' },
    fields: [
      { name: 'last_sample', type: 'object' },
      { name: 'last_received_sample', type: 'object' },
      { name: 'last_z_result', type: 'number' },
      { name: 'last_probe_position', type: 'array' },
      { name: 'last_probe_result', type: 'number' },
      { name: 'last_offset_result', type: 'number' },
      { name: 'last_poke_result', type: 'number' },
      { name: 'model', type: 'string' }
    ]
  }
]

export const klipperTemplateBuiltins: FieldDef[] = [
  { name: 'printer', type: 'object', description: 'Klipper printer status object' },
  { name: 'params', type: 'object', description: 'Macro parameters (within gcode_macro)' },
  { name: 'rawparams', type: 'string', description: 'Raw, un-parsed macro parameter string' },
  { name: 'action_respond_info', type: 'unknown', description: 'action_respond_info(msg) — send a message to the terminal' },
  { name: 'action_emergency_stop', type: 'unknown', description: 'action_emergency_stop(msg) — immediately halt the printer' },
  { name: 'action_call_remote_method', type: 'unknown', description: 'action_call_remote_method(name, ...) — call a registered remote method' },
  { name: 'action_raise_error', type: 'unknown', description: 'action_raise_error(msg) — terminate macro with an error message' }
]

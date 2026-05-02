import { extractPathAtCursor, findEnclosingGcodeMacroSection } from '../klipper-template-context'

describe('extractPathAtCursor', () => {
  it('returns null for empty text at root', () => {
    expect(extractPathAtCursor('', 0)).toBeNull()
  })

  it('returns root partial when typing an identifier with no preceding dot', () => {
    const result = extractPathAtCursor('{ prin', 6)
    expect(result).toEqual({ segments: [], partial: 'prin', replaceFrom: 2 })
  })

  it('parses printer. with empty partial after dot', () => {
    const result = extractPathAtCursor('{ printer.', 10)
    expect(result).toEqual({ segments: ['printer'], partial: '', replaceFrom: 10 })
  })

  it('parses printer.toolhead. with empty partial', () => {
    const result = extractPathAtCursor('printer.toolhead.', 17)
    expect(result).toEqual({ segments: ['printer', 'toolhead'], partial: '', replaceFrom: 17 })
  })

  it('parses printer.toolhead.pos as partial', () => {
    const result = extractPathAtCursor('printer.toolhead.pos', 20)
    expect(result).toEqual({ segments: ['printer', 'toolhead'], partial: 'pos', replaceFrom: 17 })
  })

  it('parses bracket notation', () => {
    const result = extractPathAtCursor('printer["gcode_macro FOO"].', 27)
    expect(result).toEqual({ segments: ['printer', 'gcode_macro FOO'], partial: '', replaceFrom: 27 })
  })

  it('parses bracket notation with trailing identifier', () => {
    const result = extractPathAtCursor('printer["heater_generic chamber"].temp', 38)
    expect(result).toEqual({ segments: ['printer', 'heater_generic chamber'], partial: 'temp', replaceFrom: 34 })
  })

  it('parses single-segment path', () => {
    const result = extractPathAtCursor('pause_resume.', 13)
    expect(result).toEqual({ segments: ['pause_resume'], partial: '', replaceFrom: 13 })
  })

  it('handles text before the path', () => {
    const result = extractPathAtCursor('M104 S{printer.extruder.', 24)
    expect(result).toEqual({ segments: ['printer', 'extruder'], partial: '', replaceFrom: 24 })
  })

  it('handles partial identifier mid-path with surrounding text', () => {
    const result = extractPathAtCursor('M104 S{printer.extruder.temp', 28)
    expect(result).toEqual({ segments: ['printer', 'extruder'], partial: 'temp', replaceFrom: 24 })
  })
})

describe('findEnclosingGcodeMacroSection', () => {
  const sampleConfig = [
    '',
    '[gcode_macro PRINT_START]',
    'gcode:',
    '    M104 S{printer.extruder.target}',
    '    M140 S{printer.heater_bed.target}',
    '    {% if printer.toolhead.homed_axes != \'xyz\' %}',
    '    G28',
    '    {% endif %}',
    '',
    '[gcode_macro PAUSE]',
    'gcode:',
    '    SAVE_GCODE_STATE NAME=PAUSE_STATE',
    '    PAUSE_BASE',
    ''
  ].join('\n')

  it('returns macro name and gcode block when cursor is inside a gcode_macro', () => {
    const cursorOffset = sampleConfig.indexOf('M104')
    const result = findEnclosingGcodeMacroSection(sampleConfig, cursorOffset)
    expect(result).not.toBeNull()
    expect(result!.sectionName).toBe('PRINT_START')
    expect(result!.gcodeBlock).toContain('M104')
  })

  it('returns null when cursor is not inside any section', () => {
    const result = findEnclosingGcodeMacroSection('', 0)
    expect(result).toBeNull()
  })

  it('returns null when cursor is inside a non-macro section', () => {
    const config = '[extruder]\nstep_pin: PA1\n'
    const result = findEnclosingGcodeMacroSection(config, config.indexOf('step_pin'))
    expect(result).toBeNull()
  })

  it('returns null when gcode_macro has no gcode: block', () => {
    const config = '[gcode_macro MY_MACRO]\ndescription: test\n'
    const result = findEnclosingGcodeMacroSection(config, config.length - 1)
    expect(result).toBeNull()
  })

  it('returns the correct macro when multiple macros exist', () => {
    const cursorOffset = sampleConfig.indexOf('SAVE_GCODE_STATE')
    const result = findEnclosingGcodeMacroSection(sampleConfig, cursorOffset)
    expect(result).not.toBeNull()
    expect(result!.sectionName).toBe('PAUSE')
  })
})

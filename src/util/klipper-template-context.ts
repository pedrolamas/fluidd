import gcodeMacroParams from './gcode-macro-params'

export interface PathAtCursor {
  segments: string[]
  partial: string
  replaceFrom: number
}

export interface GcodeMacroContext {
  sectionName: string
  gcodeBlock: string
}

export function extractPathAtCursor (lineText: string, column: number): PathAtCursor | null {
  const text = lineText.slice(0, column)

  const wordMatch = /[\w$]*$/.exec(text)
  if (!wordMatch) return null

  const partial = wordMatch[0]
  const beforePartial = text.slice(0, text.length - partial.length)

  if (!beforePartial.endsWith('.') && partial.length === 0) return null

  const pathText = beforePartial.endsWith('.')
    ? beforePartial.slice(0, -1)
    : beforePartial

  const segments: string[] = []
  let remaining = pathText

  while (remaining.length > 0) {
    if (remaining.endsWith(']')) {
      const bracketStart = remaining.lastIndexOf('["')
      if (bracketStart === -1) break
      const content = remaining.slice(bracketStart + 2, -2)
      segments.unshift(content)
      remaining = remaining.slice(0, bracketStart)
    } else {
      const idMatch = /([\w$]+)$/.exec(remaining)
      if (!idMatch) break
      segments.unshift(idMatch[1])
      remaining = remaining.slice(0, remaining.length - idMatch[1].length)
    }

    if (remaining.endsWith('.')) {
      remaining = remaining.slice(0, -1)
    }
  }

  return {
    segments,
    partial,
    replaceFrom: text.length - partial.length
  }
}

export function findEnclosingGcodeMacroSection (
  modelText: string,
  cursorOffset: number
): GcodeMacroContext | null {
  const textBefore = modelText.slice(0, cursorOffset)

  const sectionPattern = /^\[([^\]]+)\]/gm
  let lastSection: { name: string; type: string; offset: number } | null = null

  let match: RegExpExecArray | null
  while ((match = sectionPattern.exec(textBefore)) !== null) {
    const sectionName = match[1]
    const sectionType = sectionName.split(' ')[0]
    lastSection = { name: sectionName, type: sectionType, offset: match.index }
  }

  if (!lastSection || lastSection.type !== 'gcode_macro') return null

  const macroName = lastSection.name.slice('gcode_macro '.length)

  // Find the end of this section: next section header in the full text (after section start)
  const afterSectionStart = lastSection.offset
  const nextSectionMatch = /^\[[^\]]+\]/m.exec(modelText.slice(afterSectionStart + 1))
  const sectionEnd = nextSectionMatch
    ? afterSectionStart + 1 + nextSectionMatch.index
    : modelText.length

  const sectionText = modelText.slice(afterSectionStart, sectionEnd)

  const gcodeIdx = sectionText.search(/^gcode:/m)
  if (gcodeIdx === -1) return null

  const gcodeSection = sectionText.slice(gcodeIdx)
  const lines = gcodeSection.split('\n')
  const gcodeLines: string[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0 || line[0] === ' ' || line[0] === '\t') {
      gcodeLines.push(line.trim())
    } else {
      break
    }
  }

  return {
    sectionName: macroName,
    gcodeBlock: gcodeLines.join('\n')
  }
}

export { gcodeMacroParams }

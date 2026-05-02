import type Vue from 'vue'
import getVueApp from '@/util/get-vue-app'
import type { KlippyApp, SupportedKlipperServices } from '@/store/printer/types'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import type { MonacoLanguageWorkerRequestMessage, MonacoLanguageWorkerResponseMessage } from '@/workers/monacoWorkerHelpers'

import type { MonacoDocumentSymbolsWorkerResponseMessage } from '@/workers/monacoDocumentSymbolsWorker'
import MonacoDocumentSymbolsWorker from '@/workers/monacoDocumentSymbolsWorker?worker'

import type { MonacoFoldingRangesWorkerResponseMessage } from '@/workers/monacoFoldingRangesWorker'
import MonacoFoldingRangeWorker from '@/workers/monacoFoldingRangesWorker?worker'

import type { MonacoCodeLensWorkerResponseMessage } from '@/workers/monacoCodeLensWorker'
import MonacoCodeLensWorker from '@/workers/monacoCodeLensWorker?worker'

import {
  extractPathAtCursor,
  findEnclosingGcodeMacroSection,
  gcodeMacroParams
} from '@/util/klipper-template-context'
import {
  klipperStatusSchema,
  klipperTemplateBuiltins,
  type FieldType,
  type ObjectDef
} from '@/monaco/klipperStatusSchema'

export type CodeLensSupportedService = 'klipper' | 'moonraker' | 'moonraker-telegram-bot' | 'crowsnest'

export type DocsSectionService = CodeLensSupportedService | SupportedKlipperServices

abstract class MonacoProviderBase<T> {
  protected _lastCacheKey: string | null = null
  protected _lastResult: T[] = []

  protected _workerWrapper<T extends MonacoLanguageWorkerResponseMessage<U>, U = Extract<T, { action: 'result' }>['result']>(WorkerConstructor: new () => Worker, language: string, content: string, token: monaco.CancellationToken): Promise<U | undefined> {
    return new Promise<U | undefined>((resolve, reject) => {
      if (token.isCancellationRequested) {
        resolve(undefined)
        return
      }

      const worker = new WorkerConstructor()

      let tokenDispose: monaco.IDisposable | null = null

      const cleanup = () => {
        tokenDispose?.dispose()
        worker.onmessage = null
        worker.onerror = null
        worker.onmessageerror = null
        worker.terminate()
      }

      const safeResolve = (value: U | undefined) => {
        cleanup()
        resolve(value)
      }

      const safeReject = (error: unknown) => {
        cleanup()
        reject(error)
      }

      tokenDispose = token.onCancellationRequested(() => {
        safeResolve(undefined)
      })

      worker.onmessage = (event: MessageEvent<T>) => {
        const message = event.data

        switch (message.action) {
          case 'result':
            safeResolve(message.result)

            break

          case 'error':
            safeReject(message.error)

            break
        }
      }

      worker.onerror = (event) => {
        safeReject(new Error(event.message || 'Worker error'))
      }

      worker.onmessageerror = () => {
        safeReject(new Error('Worker message error'))
      }

      const message: MonacoLanguageWorkerRequestMessage = {
        language,
        content
      }

      if (!token.isCancellationRequested) {
        worker.postMessage(message)
      }
    })
  }

  protected _createCacheKey (model: monaco.editor.ITextModel): string {
    return `${model.uri.toString()}@${model.getVersionId()}@${model.getLanguageId()}`
  }
}

export class MonacoDocumentSymbolProvider extends MonacoProviderBase<monaco.languages.DocumentSymbol> implements monaco.languages.DocumentSymbolProvider {
  public async provideDocumentSymbols (model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.DocumentSymbol[]> {
    const cacheKey = this._createCacheKey(model)

    if (this._lastCacheKey !== cacheKey) {
      const result = await this._workerWrapper<MonacoDocumentSymbolsWorkerResponseMessage>(MonacoDocumentSymbolsWorker, model.getLanguageId(), model.getValue(), token)

      if (result == null) {
        return []
      }

      this._lastResult = result.map(section => ({
        name: section.name,
        detail: section.name,
        kind: monaco.languages.SymbolKind.Namespace,
        range: section.range,
        selectionRange: section.range,
        tags: [],
        children: section.children.map(child => ({
          name: child.name,
          detail: child.name,
          kind: monaco.languages.SymbolKind.Property,
          range: child.range,
          selectionRange: child.range,
          tags: []
        }))
      }))
      this._lastCacheKey = cacheKey
    }

    return this._lastResult
  }
}

export class MonacoCodeLensProvider extends MonacoProviderBase<monaco.languages.CodeLens> implements monaco.languages.CodeLensProvider {
  private _app: Vue
  private _klippyApp: KlippyApp

  constructor () {
    super()
    this._app = getVueApp()
    this._klippyApp = this._app.$typedGetters['printer/getKlippyApp']
  }

  public async provideCodeLenses (model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.CodeLensList> {
    return {
      lenses: await this._getCodeLens(model, token),
      dispose: () => undefined
    }
  }

  private async _getCodeLens (model: monaco.editor.ITextModel, token: monaco.CancellationToken): Promise<monaco.languages.CodeLens[]> {
    const cacheKey = this._createCacheKey(model)

    if (this._lastCacheKey !== cacheKey) {
      const { service } = this._app.$typedGetters['server/getConfigMapByFilename'](model.uri.path.split('/').pop()!) ?? {}

      if (
        !service ||
        !this._isCodeLensSupportedService(service)
      ) {
        return []
      }

      const docsSectionService: DocsSectionService = service === 'klipper'
        ? this._klippyApp.name
        : service

      const result = await this._workerWrapper<MonacoCodeLensWorkerResponseMessage>(MonacoCodeLensWorker, model.getLanguageId(), model.getValue(), token)

      if (result == null) {
        return []
      }

      this._lastResult = result.map((section, index) => {
        const hash = this._getDocsSectionHash(docsSectionService, section.sectionName)

        return {
          range: section.range,
          id: `docs${index}`,
          command: {
            id: 'fluidd_open_docs',
            title: this._app.$t('app.file_system.label.view_section_documentation', { section: section.sectionName }).toString(),
            arguments: [service, hash]
          }
        }
      })
      this._lastCacheKey = cacheKey
    }

    return this._lastResult
  }

  private _isCodeLensSupportedService (service: string): service is CodeLensSupportedService {
    return [
      'klipper',
      'moonraker',
      'moonraker-telegram-bot',
      'crowsnest'
    ].includes(service)
  }

  private _getDocsSectionHash (service: DocsSectionService, sectionName: string): string {
    switch (service) {
      case 'klipper':
        if (sectionName.startsWith('stepper_')) {
          return 'stepper'
        }

        if (/^extruder\d{0,2}$/.test(sectionName)) {
          return 'extruder'
        }

        break

      case 'danger-klipper':
        if (sectionName === 'danger_options') {
          return 'danger-options'
        }

        return this._getDocsSectionHash('klipper', sectionName)

      case 'kalico':
        if (sectionName === 'danger_options') {
          return 'danger-options'
        }

        if (sectionName === 'constants') {
          return 'configuration-references'
        }

        return this._getDocsSectionHash('klipper', sectionName)

      case 'moonraker':
        if (sectionName.startsWith('include')) {
          return 'include-directives'
        }

        break
    }

    return sectionName
  }
}

export class MonacoFoldingRangeProvider extends MonacoProviderBase<monaco.languages.FoldingRange> implements monaco.languages.FoldingRangeProvider {
  public async provideFoldingRanges (model: monaco.editor.ITextModel, _context: monaco.languages.FoldingContext, token: monaco.CancellationToken): Promise<monaco.languages.FoldingRange[]> {
    const cacheKey = this._createCacheKey(model)

    if (this._lastCacheKey !== cacheKey) {
      const result = await this._workerWrapper<MonacoFoldingRangesWorkerResponseMessage>(MonacoFoldingRangeWorker, model.getLanguageId(), model.getValue(), token)

      if (result == null) {
        return []
      }

      this._lastResult = result.map((range): monaco.languages.FoldingRange => {
        const kind = range.kind === 'comment'
          ? monaco.languages.FoldingRangeKind.Comment
          : monaco.languages.FoldingRangeKind.Region

        return {
          start: range.start,
          end: range.end,
          kind
        }
      })
      this._lastCacheKey = cacheKey
    }

    return this._lastResult
  }
}

export class MonacoCompletionItemProvider implements monaco.languages.CompletionItemProvider {
  public readonly triggerCharacters = ['.']
  private readonly _app: Vue = getVueApp()

  public provideCompletionItems (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const textUpToCursor = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    if (!this._isInsideTemplateBlock(textUpToCursor)) {
      return null
    }

    const lineText = model.getLineContent(position.lineNumber)
    const column = position.column - 1

    const path = extractPathAtCursor(lineText, column)
    if (!path) return null

    const { segments, partial, replaceFrom } = path

    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      startColumn: replaceFrom + 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    }

    let items: monaco.languages.CompletionItem[]

    if (segments.length === 0) {
      items = this._getRootCompletions(range)
    } else if (segments[0] === 'printer' && segments.length === 1) {
      const printerState: Klipper.PrinterState = this._app.$typedState.printer.printer
      items = this._getPrinterObjectCompletions(printerState, range)
    } else if (segments[0] === 'printer' && segments.length >= 2) {
      const printerState: Klipper.PrinterState = this._app.$typedState.printer.printer
      const objectKey = segments[1]
      const liveState = (printerState as Record<string, Record<string, unknown> | undefined>)[objectKey]
      items = this._getObjectFieldCompletions(objectKey, liveState, range)
    } else if (segments[0] === 'params') {
      const modelText = model.getValue()
      const cursorOffset = model.getOffsetAt(position)
      items = this._getParamsCompletions(modelText, cursorOffset, range)
    } else if (segments.length === 1) {
      // drill into a non-printer root object (e.g. pause_resume.is_paused)
      const objectKey = segments[0]
      const schemaDef = this._findSchemaDef(objectKey)
      items = schemaDef
        ? schemaDef.fields.map(field => this._makeFieldItem(field.name, field.type, undefined, field.description, range))
        : []
    } else {
      return null
    }

    if (partial) {
      const lowerPartial = partial.toLowerCase()
      items = items.filter(item => {
        const label = typeof item.label === 'string' ? item.label : (item.label as { label: string }).label
        return label.toLowerCase().startsWith(lowerPartial)
      })
    }

    return { suggestions: items, incomplete: false }
  }

  private _isInsideTemplateBlock (textUpToCursor: string): boolean {
    const tokenLines = monaco.editor.tokenize(textUpToCursor, 'klipper-config')
    if (tokenLines.length === 0) return false

    const lastLineTokens = tokenLines[tokenLines.length - 1]
    if (lastLineTokens.length === 0) return false

    const lastLine = textUpToCursor.includes('\n')
      ? textUpToCursor.slice(textUpToCursor.lastIndexOf('\n') + 1)
      : textUpToCursor

    // Find the rightmost token that starts before the cursor
    let token = lastLineTokens[0]
    for (const t of lastLineTokens) {
      if (t.offset < lastLine.length) {
        token = t
      }
    }

    // The klipper-config Monarch tokenizer produces 'string.unquoted' exclusively
    // inside { ... } macro blocks (gcodeLine → macroBlock state).
    // It does NOT apply to config values, comments, or string literals in other contexts.
    return token.type.includes('string.unquoted')
  }

  private _getRootCompletions (range: monaco.IRange): monaco.languages.CompletionItem[] {
    return klipperTemplateBuiltins.map(builtin => ({
      label: builtin.name,
      kind: builtin.type === 'object'
        ? monaco.languages.CompletionItemKind.Module
        : builtin.type === 'unknown'
          ? monaco.languages.CompletionItemKind.Function
          : monaco.languages.CompletionItemKind.Variable,
      detail: builtin.type === 'unknown' ? 'function' : builtin.type,
      documentation: builtin.description,
      insertText: builtin.name,
      range
    }))
  }

  private _getPrinterObjectCompletions (
    printerState: Klipper.PrinterState,
    range: monaco.IRange
  ): monaco.languages.CompletionItem[] {
    const seen = new Set<string>()
    const items: monaco.languages.CompletionItem[] = []

    const addItem = (key: string) => {
      if (seen.has(key) || key === 'objects') return
      seen.add(key)
      const hasSpace = key.includes(' ')
      items.push({
        label: key,
        kind: monaco.languages.CompletionItemKind.Module,
        detail: 'object',
        insertText: hasSpace ? `["${key}"]` : key,
        range
      })
    }

    // Static schema first (ensures known objects always appear)
    for (const def of klipperStatusSchema) {
      if (def.match.kind === 'exact') {
        addItem(def.match.name)
      }
    }

    // Live state for dynamic/parameterized instances
    if (printerState) {
      for (const key of Object.keys(printerState)) {
        addItem(key)
      }
    }

    return items
  }

  private _getObjectFieldCompletions (
    objectKey: string,
    liveState: Record<string, unknown> | undefined,
    range: monaco.IRange
  ): monaco.languages.CompletionItem[] {
    const seen = new Set<string>()
    const items: monaco.languages.CompletionItem[] = []

    const schemaDef = this._findSchemaDef(objectKey)

    if (schemaDef) {
      for (const field of schemaDef.fields) {
        seen.add(field.name)
        const liveValue = liveState?.[field.name]
        items.push(this._makeFieldItem(field.name, field.type, liveValue, field.description, range))
      }
    }

    if (liveState) {
      for (const [key, value] of Object.entries(liveState)) {
        if (seen.has(key)) continue
        const type = this._inferType(value)
        items.push(this._makeFieldItem(key, type, value, undefined, range))
      }
    }

    return items
  }

  private _getParamsCompletions (
    modelText: string,
    cursorOffset: number,
    range: monaco.IRange
  ): monaco.languages.CompletionItem[] {
    const context = findEnclosingGcodeMacroSection(modelText, cursorOffset)
    if (!context) return []

    const params = gcodeMacroParams(context.gcodeBlock)
    const seen = new Set<string>()

    return params
      .filter(param => {
        if (seen.has(param.name)) return false
        seen.add(param.name)
        return true
      })
      .map(param => ({
        label: param.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'parameter',
        documentation: param.value ? `default: ${param.value}` : undefined,
        insertText: param.name,
        range
      }))
  }

  private _findSchemaDef (objectKey: string): ObjectDef | undefined {
    return klipperStatusSchema.find(def => {
      if (def.match.kind === 'exact') return def.match.name === objectKey
      if (def.match.kind === 'prefix') return objectKey.startsWith(def.match.prefix)
      return false
    })
  }

  private _makeFieldItem (
    name: string,
    type: FieldType,
    liveValue: unknown,
    description: string | undefined,
    range: monaco.IRange
  ): monaco.languages.CompletionItem {
    return {
      label: name,
      kind: this._kindForType(type),
      detail: type,
      documentation: liveValue !== undefined
        ? `current: ${this._formatValue(liveValue)}`
        : description,
      insertText: name,
      range
    }
  }

  private _kindForType (type: FieldType): monaco.languages.CompletionItemKind {
    switch (type) {
      case 'number': return monaco.languages.CompletionItemKind.Value
      case 'string': return monaco.languages.CompletionItemKind.Text
      case 'boolean': return monaco.languages.CompletionItemKind.Keyword
      case 'array': return monaco.languages.CompletionItemKind.Field
      case 'object': return monaco.languages.CompletionItemKind.Module
      default: return monaco.languages.CompletionItemKind.Property
    }
  }

  private _inferType (value: unknown): FieldType {
    if (value === null || value === undefined) return 'unknown'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return 'unknown'
  }

  private _formatValue (value: unknown): string {
    if (value === null) return 'null'
    if (typeof value === 'number') return String(value)
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) {
      const preview = value.slice(0, 3).join(', ')
      return `[${preview}${value.length > 3 ? ', …' : ''}]`
    }
    return '{…}'
  }
}

<template>
  <div
    ref="monacoEditor"
  >
    <div
      v-if="!editor"
      class="spinner"
    >
      <v-progress-circular
        indeterminate
        size="100"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useVuetify } from '@/composables/useVuetify'
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'
import md5 from 'md5'
import type { RestoreViewState } from '@/store/config/types'
import { consola } from 'consola'

let monaco: typeof Monaco // dynamically imported

const props = defineProps<{
  value: string
  filename: string
  readonly?: boolean
  canSaveAndRestart?: boolean
  codeLens?: boolean
  path: string
}>()

const emit = defineEmits<{
  (e: 'input', value: string | undefined): void
  (e: 'save'): void
  (e: 'save-as'): void
  (e: 'save-and-restart'): void
  (e: 'emergency-stop'): void
  (e: 'ready'): void
}>()

const { isMobileViewport } = useBrowserMixin()
const { typedState } = useStore()
const { tc } = useI18n()
const vuetify = useVuetify()

const monacoEditor = ref<HTMLElement>()
const editor = ref<Monaco.editor.IStandaloneCodeEditor | null>(null)
const viewStateHash = ref<string | null>(null)

const pathFilename = computed(() =>
  props.path ? `${props.path}/${props.filename}` : props.filename
)

const apiFileUrl = computed(() =>
  `${typedState.config.apiUrl}/server/files/${pathFilename.value}`
)

const restoreViewState = computed<RestoreViewState>(() =>
  typedState.config.uiSettings.editor.restoreViewState
)

const restoreViewStateStorage = computed<Storage | undefined>(() => {
  switch (restoreViewState.value) {
    case 'local':
      return localStorage
    case 'session':
      return sessionStorage
    default:
      return undefined
  }
})

watch(() => props.filename, () => {
  if (saveViewState()) {
    viewStateHash.value = 'monaco.' + md5(apiFileUrl.value)
  }
})

async function initEditor () {
  if (!monaco) {
    const { default: promise } = await import('./setupMonaco')
    monaco = await promise
  }

  if (vuetify.theme.dark) {
    monaco.editor.setTheme('dark-converted')
  } else {
    monaco.editor.setTheme('light-converted')
  }

  editor.value = monaco.editor.create(monacoEditor.value!, {
    contextmenu: true,
    readOnly: props.readonly,
    codeLens: props.codeLens,
    automaticLayout: true,
    fontSize: 16,
    scrollbar: {
      useShadows: false
    },
    minimap: {
      enabled: (!isMobileViewport.value)
    },
    rulers: (isMobileViewport.value) ? [80, 120] : []
  })

  if (!props.readonly) {
    editor.value.addAction({
      id: 'action-save-file',
      label: tc('app.general.btn.save'),
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => { emit('save') }
    })

    editor.value.addAction({
      id: 'action-save-file-as',
      label: tc('app.general.btn.save_as'),
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      run: () => { emit('save-as') }
    })
  }

  if (props.canSaveAndRestart) {
    editor.value.addAction({
      id: 'action-save-file-restart',
      label: tc('app.general.btn.save_restart'),
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS],
      run: () => { emit('save-and-restart') }
    })
  }

  editor.value.addAction({
    id: 'action-emergency-stop',
    label: tc('app.general.tooltip.estop'),
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE],
    run: () => { emit('emergency-stop') }
  })

  const model = monaco.editor.createModel(
    props.value,
    undefined,
    monaco.Uri.file(pathFilename.value)
  )
  editor.value.setModel(model)

  const storage = restoreViewStateStorage.value

  if (storage) {
    viewStateHash.value = 'monaco.' + md5(apiFileUrl.value)

    const viewState = storage.getItem(viewStateHash.value)

    if (viewState) {
      editor.value.restoreViewState(JSON.parse(viewState) as Monaco.editor.ICodeEditorViewState | null)
    }
  }

  nextTick(() => { focus() })

  emit('ready')

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue()
    emit('input', value)
  })
}

function focus () {
  editor.value?.focus()
}

function showCommandPalette () {
  if (editor.value) {
    editor.value.focus()
    editor.value.trigger(null, 'editor.action.quickCommand', null)
  }
}

function saveViewState (): boolean {
  const storage = restoreViewStateStorage.value

  if (editor.value && storage && viewStateHash.value) {
    const viewState = editor.value.saveViewState()

    try {
      storage.setItem(viewStateHash.value, JSON.stringify(viewState))
      return true
    } catch (e) {
      consola.error('[Storage] setItem', e)
    }
  }

  return false
}

onMounted(async () => {
  await initEditor()
})

onUnmounted(() => {
  saveViewState()
  monaco?.editor.getModels().forEach(model => model.dispose())
  editor.value?.dispose()
})

defineExpose({ focus, showCommandPalette })
</script>

<style lang="scss" scoped>
  :deep() {
    // margin-top: 12px;
    min-width: 100%;
    height: 90%;
    height: calc(100% - 48px);
  }

  :deep(.spinner) {
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
  }
</style>

<template>
  <v-dialog
    v-model="open"
    :loading="loading"
    hide-overlay
    fullscreen
    persistent
    transition="dialog-bottom-transition"
    content-class="config-editor-overlay"
  >
    <v-card
      d-flex
      class="fill-height"
      style="overflow: hidden;"
    >
      <v-toolbar
        dense
        :elevation="6"
        style="z-index: 1"
      >
        <app-btn
          v-if="!$vuetify.breakpoint.smAndDown"
          icon
          :disabled="!ready"
          @click="emitClose()"
        >
          <v-icon>$close</v-icon>
        </app-btn>
        <v-toolbar-title>
          {{ filename }}
          <v-icon
            v-if="readonly"
            small
            class="ml-1"
          >
            $lock
          </v-icon>
          <v-icon
            v-else-if="updatedContent !== lastSavedContent"
            small
            class="ml-1"
          >
            $circle
          </v-icon>
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <app-btn
            v-if="canShowPeripheralsDialog && !$vuetify.breakpoint.smAndDown"
            @click="peripheralsDialogOpen = true"
          >
            <v-icon
              small
              left
            >
              $devices
            </v-icon>
            <span>{{ $t('app.file_system.title.devices') }}</span>
          </app-btn>
          <app-btn
            v-if="!useTextOnlyEditor"
            :disabled="!ready"
            @click="handleCommandPalette"
          >
            <v-icon
              small
              :left="!$vuetify.breakpoint.smAndDown"
            >
              $consoleLine
            </v-icon>
            <span v-if="!$vuetify.breakpoint.smAndDown">{{ $t('app.file_system.title.command_palette') }}</span>
          </app-btn>
          <app-btn
            v-if="!printerPrinting && configMap?.link"
            :href="configMap.link"
            target="_blank"
          >
            <v-icon
              small
              :left="!$vuetify.breakpoint.smAndDown"
            >
              $help
            </v-icon>
            <span v-if="!$vuetify.breakpoint.smAndDown">{{ $t('app.general.btn.config_reference') }}</span>
          </app-btn>
          <app-btn
            v-if="canSaveAndRestart"
            :disabled="!ready"
            @click="emitSave(true)"
          >
            <v-icon
              small
              :left="!$vuetify.breakpoint.smAndDown"
            >
              $restart
            </v-icon>
            <span v-if="!$vuetify.breakpoint.smAndDown">{{ $t('app.general.btn.save_restart') }}</span>
          </app-btn>
          <v-tooltip
            v-if="!readonly"
            bottom
          >
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                :disabled="!ready"
                v-on="on"
                @click="emitSave({ saveAs: true })"
              >
                <v-icon>
                  $saveAs
                </v-icon>
              </app-btn>
            </template>
            <span>{{ $t('app.general.btn.save_as') }}</span>
          </v-tooltip>
          <v-tooltip
            v-if="!readonly"
            bottom
          >
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                :disabled="!ready"
                v-on="on"
                @click="emitSave(false)"
              >
                <v-icon>
                  $save
                </v-icon>
              </app-btn>
            </template>
            <span>{{ $t('app.general.btn.save') }}</span>
          </v-tooltip>
          <app-btn
            @click="emitClose()"
          >
            <v-icon>
              $close
            </v-icon>
          </app-btn>
        </v-toolbar-items>
      </v-toolbar>

      <file-editor
        v-if="contents !== undefined && !useTextOnlyEditor"
        ref="editor"
        :value="updatedContent ?? ''"
        :path="path"
        :filename="filename"
        :readonly="readonly"
        :can-save-and-restart="canSaveAndRestart"
        :code-lens="codeLens"
        @input="updatedContent = $event ?? null"
        @ready="editorReady = true"
        @save="emitSave()"
        @save-as="emitSave({ saveAs: true })"
        @save-and-restart="emitSave({ restart: true })"
        @emergency-stop="emergencyStop"
      />

      <file-editor-text-only
        v-if="contents !== undefined && useTextOnlyEditor"
        v-model="updatedContent"
        :filename="filename"
        :readonly="readonly"
        @ready="editorReady = true"
      />

      <peripherals-dialog
        v-if="peripheralsDialogOpen"
        v-model="peripheralsDialogOpen"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import FileEditor from './FileEditor.vue'
import FileEditorTextOnly from './FileEditorTextOnly.vue'
import isWebAssemblySupported from '@/util/is-web-assembly-supported'

const props = defineProps<{
  root: string
  path: string
  filename: string
  contents: string
  loading?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', content: string | null, service?: string): void
  (e: 'save-as', content: string | null): void
}>()

const { printerPrinting, emergencyStop } = useStateMixin()
const { isMobileUserAgent } = useBrowserMixin()
const { typedState, typedGetters } = useStore()
const confirm = useConfirm()
const { tc } = useI18n()

const editor = ref<InstanceType<typeof FileEditor>>()

const updatedContent = ref<string | null>(null)
const lastSavedContent = ref<string | null>(null)
const editorReady = ref(false)
const peripheralsDialogOpen = ref(false)

const { modelValue: open } = defineModels<{ modelValue: boolean }>()

const ready = computed(() =>
  !props.loading &&
  editorReady.value &&
  !isUploading.value
)

watch(ready, (value) => {
  if (value) {
    editor.value?.focus()
  }
})

const isWebAssemblySupportedValue = computed(() => isWebAssemblySupported())

const useTextOnlyEditor = computed(() =>
  isMobileUserAgent.value || !isWebAssemblySupportedValue.value
)

const isUploading = computed(() =>
  typedState.files.uploads.length > 0
)

const configMap = computed(() =>
  typedGetters['server/getConfigMapByFilename'](props.filename)
)

const canSaveAndRestart = computed(() =>
  !props.readonly &&
  !printerPrinting.value &&
  configMap.value?.serviceSupported === true
)

const canShowPeripheralsDialog = computed(() =>
  !props.readonly &&
  configMap.value?.serviceSupported === true
)

const codeLens = computed(() =>
  typedState.config.uiSettings.editor.codeLens
)

const showDirtyEditorWarning = computed(() => {
  const confirmDirtyEditorClose: boolean = typedState.config.uiSettings.editor.confirmDirtyEditorClose

  return (
    confirmDirtyEditorClose &&
    updatedContent.value !== lastSavedContent.value
  )
})

// init
updatedContent.value = props.contents
lastSavedContent.value = props.contents

function handleBeforeUnload (event: Event) {
  if (showDirtyEditorWarning.value) {
    event.preventDefault()
    return ((event || window.event).returnValue = true)
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

async function emitClose () {
  const result = (
    !showDirtyEditorWarning.value ||
    await confirm(
      tc('app.general.simple_form.msg.unsaved_changes'),
      { title: tc('app.general.label.unsaved_changes'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    open.value = false
  }
}

function emitSave (options?: boolean | { restart?: boolean, saveAs?: boolean }) {
  if (editorReady.value) {
    const [restart, saveAs] = typeof options === 'object' && options != null
      ? [options.restart === true, options.saveAs === true]
      : [options === true, false]

    if (configMap.value?.serviceSupported && restart) {
      emit('save', updatedContent.value, configMap.value.service)
      open.value = false
    } else {
      if (saveAs) {
        emit('save-as', updatedContent.value)
      } else {
        emit('save', updatedContent.value)
      }
    }

    lastSavedContent.value = updatedContent.value
  }
}

function handleCommandPalette () {
  editor.value?.showCommandPalette()
}
</script>

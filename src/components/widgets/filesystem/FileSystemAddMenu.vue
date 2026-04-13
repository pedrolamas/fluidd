<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
  >
    <template #activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <app-btn
            v-bind="attrs"
            :disabled="disabled"
            icon
            text
            v-on="{... menu, ...tooltip}"
          >
            <v-icon>
              $plus
            </v-icon>
          </app-btn>
        </template>
        <span>{{ $t('app.general.btn.add') }}</span>
      </v-tooltip>
    </template>

    <v-list dense>
      <v-list-item
        :disabled="disabled"
        @click="emulateClick(false)"
      >
        <v-list-item-icon>
          <v-icon>
            $fileUpload
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.upload_files') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        v-if="!isIOS"
        :disabled="disabled"
        @click="emulateClick(false, true)"
      >
        <v-list-item-icon>
          <v-icon>
            $folderUpload
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.upload_folder') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        v-if="root === 'gcodes'"
        :disabled="disabled || !printerReady"
        @click="emulateClick(true)"
      >
        <v-list-item-icon>
          <v-icon>
            $progressUpload
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.upload_print') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :disabled="disabled"
        @click="$emit('add-file')"
      >
        <v-list-item-icon>
          <v-icon>
            $fileAdd
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.add_file') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :disabled="disabled"
        @click="$emit('add-dir')"
      >
        <v-list-item-icon>
          <v-icon>
            $folderAdd
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.add_dir') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <input
      ref="uploadFile"
      type="file"
      :accept="accepts"
      style="display: none"
      multiple
      @change="fileChanged"
    >
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import type { RootProperties } from '@/store/files/types'
import { getFilesWithPathFromHTMLInputElement } from '@/util/file-system-entry'

const props = defineProps<{
  root: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-file'): void
  (e: 'add-dir'): void
  (e: 'upload', files: any[], print: boolean): void
}>()

const { printerPrinting, printerPaused, klippyReady } = useStateMixin()
const { isIOS } = useBrowserMixin()
const { typedGetters } = useStore()

const uploadFile = ref<HTMLInputElement>()
const andPrint = ref(false)

const rootProperties = computed<RootProperties>(() =>
  typedGetters['files/getRootProperties'](props.root)
)

const accepts = computed(() =>
  isIOS.value
    ? undefined
    : rootProperties.value.accepts.join(',')
)

const printerReady = computed(() =>
  !printerPrinting.value &&
  !printerPaused.value &&
  klippyReady.value
)

function emulateClick (startPrint: boolean, folder = false) {
  andPrint.value = startPrint
  uploadFile.value!.multiple = !startPrint
  uploadFile.value!.webkitdirectory = folder
  uploadFile.value!.click()
}

async function fileChanged (event: Event) {
  if (event.target instanceof HTMLInputElement) {
    const files = await getFilesWithPathFromHTMLInputElement(event.target)

    if (files) {
      emit('upload', files, andPrint.value)
    }

    event.target.value = ''
  }
}
</script>

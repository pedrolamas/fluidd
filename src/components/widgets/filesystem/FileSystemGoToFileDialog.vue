<template>
  <app-dialog
    v-model="open"
    :title="$t('app.file_system.title.go_to_file')"
    no-actions
    max-width="800"
  >
    <v-toolbar dense>
      <v-text-field
        v-model="search"
        :loading="loading"
        outlined
        hide-details
        dense
        autofocus
      />
    </v-toolbar>

    <v-virtual-scroll
      :items="matchedFiles"
      bench="30"
      item-height="40"
    >
      <template #default="{ index, item }">
        <v-list-item
          :key="item.path"
          dense
          class="v-list-item--link"
          @click="handleFileClick(item)"
        >
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-regular">
              {{ item.path }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider v-if="index !== matchedFiles.length - 1" />
      </template>
    </v-virtual-scroll>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import { SocketActions } from '@/api/socketActions'
import getFilePaths from '@/util/get-file-paths'
import { escapeRegExp } from 'lodash-es'

type File = Moonraker.Files.RootFile & {
  filename: string
  filepath: string
  rootPath: string
}

const props = defineProps<{
  value?: boolean
  root: string
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'path-change', path: string): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v ?? false)
})

const { hasWait } = useStateMixin()
const { typedGetters } = useStore()

const search = ref('')
const loaded = ref(false)

const rootFiles = computed((): Moonraker.Files.RootFile[] | undefined =>
  typedGetters['files/getRootFiles'](props.root)
)

const matchedFiles = computed((): File[] => {
  if (!loaded.value || !rootFiles.value) {
    return []
  }

  const searchPattern = search.value
    .split('')
    .map(x => escapeRegExp(x))
    .join('.*?')
  const searchRegExp = new RegExp(searchPattern, 'i')

  return rootFiles.value
    .filter(rootFile => searchRegExp.exec(rootFile.path))
    .map(rootFile => {
      const { filename, rootPath, path: filepath } = getFilePaths(rootFile.path, props.root)

      return {
        ...rootFile,
        filename,
        filepath,
        rootPath
      }
    })
})

const loading = computed((): boolean =>
  hasWait(`${Waits.onFileSystem}/${props.root}/`)
)

watch(loading, (value) => {
  loaded.value = !value
})

function handleFileClick (file: File) {
  emit('path-change', file.rootPath)
  open.value = false
}

onMounted(() => {
  loaded.value = false
  SocketActions.serverFilesList(props.root)
})
</script>

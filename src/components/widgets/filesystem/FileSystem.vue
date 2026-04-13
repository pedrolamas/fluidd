<template>
  <v-card
    class="filesystem-wrapper"
    :class="{ 'no-pointer-events': dragState.overlay }"
    flat
    @dragover="handleDragOver"
    @dragenter.self.prevent
    @dragleave.self.prevent="handleDragLeave"
    @drop.self.prevent="handleDrop"
  >
    <file-system-toolbar
      v-if="selected.length <= 0"
      :roots="availableRoots"
      :root="currentRoot"
      :name="name"
      :search.sync="search"
      :path="visiblePath"
      :disabled="disabled"
      :loading="filesLoading"
      :headers="configurableHeaders"
      @root-change="handleRootChange"
      @refresh="handleRefresh"
      @add-file="handleAddFileDialog"
      @add-dir="handleAddDirDialog"
      @upload="handleUpload"
      @filter="handleFilter"
      @go-to-file="handleGoToFileDialog"
    />

    <file-system-bulk-actions
      v-if="selected.length > 0"
      :root="currentRoot"
      :path="visiblePath"
      :selected="selected"
      @remove="handleRemove"
      @create-zip="handleCreateZip"
      @refresh-metadata="handleRefreshMetadata"
      @perform-time-analysis="handlePerformTimeAnalysis"
      @enqueue="handleEnqueue"
    />

    <file-system-browser
      v-if="headers"
      v-model="selected"
      :headers="headers"
      :root="currentRoot"
      :dense="dense"
      :loading="filesLoading"
      :search="search"
      :files="files"
      :drag-state.sync="dragState.browserState"
      :bulk-actions="bulkActions"
      :large-thumbnails="currentRoot === 'timelapse'"
      @row-click="handleRowClick"
      @move="handleMove"
      @drag-start="handleDragStart"
    />

    <file-system-context-menu
      v-if="contextMenuState.open"
      v-model="contextMenuState.open"
      :root="currentRoot"
      :file="contextMenuState.file"
      :position-x="contextMenuState.x"
      :position-y="contextMenuState.y"
      @print="handlePrint"
      @view="handleFileOpenDialog($event, 'view')"
      @edit="handleFileOpenDialog($event, 'edit')"
      @rename="handleRenameDialog"
      @duplicate="handleDuplicateDialog"
      @remove="handleRemove"
      @download="handleDownload"
      @preheat="handlePreheat"
      @preview-gcode="handlePreviewGcode"
      @refresh-metadata="handleRefreshMetadata"
      @perform-time-analysis="handlePerformTimeAnalysis"
      @view-thumbnail="handleViewThumbnail"
      @enqueue="handleEnqueue"
      @create-zip="handleCreateZip"
    />

    <file-editor-dialog
      v-if="fileEditorDialogState.open"
      v-model="fileEditorDialogState.open"
      :contents="fileEditorDialogState.contents"
      :filename="fileEditorDialogState.filename"
      :loading="fileEditorDialogState.loading"
      :readonly="fileEditorDialogState.readonly"
      :path="currentPath"
      :root="currentRoot"
      @save="handleSaveFileChanges"
      @save-as="handleSaveAsFileChanges"
    />

    <!-- A generic dialog to define the name of a file, or folder.
         Used to create, or rename a file or folder. -->
    <file-name-dialog
      v-if="fileNameDialogState.open"
      v-model="fileNameDialogState.open"
      :name="fileNameDialogState.value"
      :title="fileNameDialogState.title"
      :is-file="fileNameDialogState.isFile"
      :label="fileNameDialogState.label"
      @save="fileNameDialogState.handler"
    />

    <app-drag-overlay
      v-model="dragState.overlay"
      :message="$t('app.file_system.overlay.drag_files_folders_upload').toString()"
      icon="$fileUpload"
      absolute
    />

    <file-preview-dialog
      v-if="filePreviewState.open"
      v-model="filePreviewState.open"
      :file="filePreviewState.file"
      :filename="filePreviewState.filename"
      :extension="filePreviewState.extension"
      :src="filePreviewState.src"
      :type="filePreviewState.type"
      :width="filePreviewState.width"
      :readonly="filePreviewState.readonly"
      :path="currentPath"
      @remove="handleRemove"
      @download="handleDownload"
    />

    <file-system-go-to-file-dialog
      v-if="goToFileDialogOpen"
      v-model="goToFileDialogOpen"
      :root="currentRoot"
      @path-change="loadFiles"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router/composables'
import { SocketActions } from '@/api/socketActions'
import type { AppDirectory, AppFile, AppFileWithMeta, FileFilterType, FileBrowserEntry, RootProperties, MoonrakerPathContent } from '@/store/files/types'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useServicesMixin } from '@/composables/useServicesMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import { Waits } from '@/globals'
import { Filters } from '@/plugins/filters'
import FileSystemToolbar from './FileSystemToolbar.vue'
import FileSystemBulkActions from './FileSystemBulkActions.vue'
import FileSystemBrowser from './FileSystemBrowser.vue'
import FileSystemContextMenu from './FileSystemContextMenu.vue'
import FileEditorDialog from './FileEditorDialog.vue'
import FileNameDialog from './FileNameDialog.vue'
import FileSystemGoToFileDialog from './FileSystemGoToFileDialog.vue'
import FilePreviewDialog from './FilePreviewDialog.vue'
import type { AppDataTableHeader, FileWithPath } from '@/types'
import { getFilesFromDataTransfer, hasFilesInDataTransfer } from '@/util/file-system-entry'
import { getFileDataTransferDataFromDataTransfer, hasFileDataTransferTypeInDataTransfer, setFileDataTransferDataInDataTransfer } from '@/util/file-data-transfer'
import { consola } from 'consola'
import type { DataTableHeader } from 'vuetify'
import type { KlipperSaveAndRestartAction } from '@/store/config/types'

/**
 * Represents the filesystem, bound to moonrakers supplied roots.
 * Can be configured via props to look at a specific root, or many.
 *
 * NOTE: Generally, moonraker expects the paths to include the root.
 */

const props = defineProps<{
  // Can be a list of roots, or a single root.
  roots: string | string[]
  name: string
  // If dense, hide the meta and reduce the overall size.
  dense?: boolean
  // Allow bulk-actions
  bulkActions?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { t, tc } = useI18n()
const confirm = useConfirm()
const { typedState, typedGetters, typedDispatch, typedCommit } = useStore()
const { klippyReady, printerPrinting, printerPaused, hasWaitsBy, sendGcode } = useStateMixin()
const { getFile, getGcode, getThumb, createFileUrl, downloadFile, uploadFile, uploadFiles } = useFilesMixin()
const {
  serviceRestartMoonraker,
  serviceRestartKlipper,
  serviceRestartByName,
  restartKlippy,
  firmwareRestartKlippy,
} = useServicesMixin()

// Maintains the path and root.
const currentRoot = ref('')

// Maintains search state.
const search = ref('')

// Maintains filter state.
const filters = computed({
  get: (): FileFilterType[] => typedState.config.uiSettings.fileSystem.activeFilters[currentRoot.value] ?? [],
  set: (value: FileFilterType[]) => typedDispatch('config/updateFileSystemActiveFilters', { root: currentRoot.value, value })
})

// Maintains content menu state.
const contextMenuState = ref<any>({
  open: false,
  x: 0,
  y: 0,
  file: null
})

// Maintains drag overlay state.
const dragState = ref({
  browserState: false, // indicates if our browser is in a drag state.
  overlay: false // toggles our overlay for file drops.
})

// Maintains any selected items and their state.
const selected = ref<FileBrowserEntry[]>([])

// Maintains the file editor dialog state.
const fileEditorDialogState = ref<any>({
  open: false,
  contents: '',
  filename: '',
  loading: false,
  readonly: false
})

// Maintains the name change dialog state.
const fileNameDialogState = ref<any>({
  open: false,
  title: '',
  value: '',
  label: '',
  isFile: false,
  handler: ''
})

const filePreviewState = ref<any>({
  open: false,
  filename: '',
  src: '',
  type: ''
})

const goToFileDialogOpen = ref(false)

watch(() => filePreviewState.value.open, (value: boolean) => {
  if (!value && filePreviewState.value.src.startsWith('blob:')) {
    URL.revokeObjectURL(filePreviewState.value.src)
  }
})

// Gets available roots.
const availableRoots = computed((): string[] =>
  !Array.isArray(props.roots) ? [props.roots] : props.roots
)

// Keep currentRoot in sync with available roots.
watch(availableRoots, (roots) => {
  if (roots.length > 0 && !roots.includes(currentRoot.value)) {
    currentRoot.value = roots[0]
  }
}, { immediate: true })

// Properties of the current root.
const rootProperties = computed((): RootProperties =>
  typedGetters['files/getRootProperties'](currentRoot.value)
)

// If this root is available or not.
const disabled = computed((): boolean =>
  !typedGetters['files/isRootAvailable'](currentRoot.value)
)

watch(disabled, (val: boolean) => {
  // We know this always fires on mount, so we rely on it for our initial
  // load too.
  if (!val) {
    loadFiles(currentPath.value)
  }
}, { immediate: true })

const configurableHeaders = computed((): AppDataTableHeader[] => {
  const isNotDashboard = props.name !== 'dashboard'

  const gcodeHeaders: AppDataTableHeader[] = currentRoot.value === 'gcodes'
    ? [
        {
          text: tc('app.general.table.header.status'),
          value: 'history.status',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.height'),
          value: 'object_height',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.first_layer_height'),
          value: 'first_layer_height',
          visible: false,
          cellClass: 'text-no-wrap',
        },
        {
          text: tc('app.general.table.header.layer_height'),
          value: 'layer_height',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_name'),
          value: 'filament_name',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_colors'),
          value: 'filament_colors',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.extruder_colors'),
          value: 'extruder_colors',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_temps'),
          value: 'filament_temps',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_type'),
          value: 'filament_type',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament'),
          value: 'filament_total',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_change_count'),
          value: 'filament_change_count',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_weight_total'),
          value: 'filament_weight_total',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_weights'),
          value: 'filament_weights',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.mmu_print'),
          value: 'mmu_print',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.referenced_tools'),
          value: 'referenced_tools',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.filament_used'),
          value: 'history.filament_used',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.nozzle_diameter'),
          value: 'nozzle_diameter',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.slicer'),
          value: 'slicer',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.slicer_version'),
          value: 'slicer_version',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.printer_vendor'),
          value: 'printer_vendor',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.printer_model'),
          value: 'printer_model',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.printer_variant'),
          value: 'printer_variant',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.profile_version'),
          value: 'profile_version',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.estimated_time'),
          value: 'estimated_time',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.print_duration'),
          value: 'history.print_duration',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.total_duration'),
          value: 'history.total_duration',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.first_layer_bed_temp'),
          value: 'first_layer_bed_temp',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.first_layer_extr_temp'),
          value: 'first_layer_extr_temp',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.chamber_temp'),
          value: 'chamber_temp',
          visible: false,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.file_processors'),
          value: 'file_processors',
          visible: isNotDashboard,
          cellClass: 'text-no-wrap'
        },
        {
          text: tc('app.general.table.header.last_printed'),
          value: 'print_start_time',
          cellClass: 'text-no-wrap'
        }
      ]
    : []

  const headers: AppDataTableHeader[] = [
    ...gcodeHeaders,
    {
      text: tc('app.general.table.header.modified'),
      value: 'modified',
      cellClass: 'text-no-wrap',
      width: '1%'
    },
    {
      text: tc('app.general.table.header.size'),
      value: 'size',
      cellClass: 'text-no-wrap',
      width: '1%'
    }
  ]

  const key = `${currentRoot.value}_${props.name}`
  return typedGetters['config/getMergedTableHeaders'](headers, key)
})

// The available headers, based on the current root and system configuration.
const headers = computed((): DataTableHeader[] => [
  {
    text: '',
    value: 'data-table-icons',
    sortable: false,
    width: props.dense ? 28 : 56
  },
  {
    text: tc('app.general.table.header.name'),
    value: 'name'
  },
  ...configurableHeaders.value.filter(header => header.visible !== false)
])

// The current path for the given root.
const currentPath = computed({
  get: (): string => {
    const pathWithRoot: string = typedGetters['files/getCurrentPathByRoot'](currentRoot.value)
    return pathWithRoot || currentRoot.value
  },
  set: (path: string) => {
    typedDispatch('files/updateCurrentPathByRoot', { root: currentRoot.value, path })
  }
})

// Returns the current path with no root.
const visiblePath = computed((): string => {
  if (currentPath.value && currentPath.value.startsWith(currentRoot.value)) {
    const dirs = currentPath.value.split('/')
    dirs.shift()
    return dirs ? dirs.join('/') : ''
  }
  return currentPath.value
})

function getAllFiles (): FileBrowserEntry[] {
  const items: FileBrowserEntry[] | undefined = typedGetters['files/getDirectory'](currentPath.value)
  return items ?? []
}

// Get the available files given the current root and path.
const files = computed((): FileBrowserEntry[] => {
  const allFiles = getAllFiles()

  return allFiles.filter(file => {
    if (currentRoot.value === 'timelapse' && file.type === 'file' && file.extension === '.jpg') {
      return false
    }

    return !filters.value.some(filter => {
      if (filter === 'hidden_files') {
        return /^\.(?!\.$)/.test(file.name)
      }

      if (file.type !== 'file') {
        return false
      }

      switch (filter) {
        case 'moonraker_backup_files':
          return file.filename === '.moonraker.conf.bkp'

        case 'moonraker_temporary_upload_files':
          return file.extension === '.mru'

        case 'klipper_backup_files':
          return /^printer-\d{8}_\d{6}\.cfg$/.test(file.filename)

        case 'print_start_time':
          return 'print_start_time' in file && file.print_start_time !== null

        case 'rolled_log_files':
          return (
            /\.\d{4}-\d{2}-\d{2}(?:_\d{2}-\d{2}-\d{2})?$/.test(file.filename) ||
            /\.log\.\d+$/.test(file.filename)
          )

        case 'crowsnest_backup_files':
          return /^crowsnest\.conf\.\d{4}-\d{2}-\d{2}-\d{4}$/.test(file.filename)
      }

      return false
    })
  })
})

watch(files, () => {
  // If our file list changes, reset selected files.
  selected.value = []
})

// Determine if we're waiting for a directory load on our current path.
const filesLoading = computed(() => hasWaitsBy(`${Waits.onFileSystem}/${currentRoot.value}/`))

const fileDropRoot = computed(() => route.meta?.fileDropRoot)

function includeTimelapseThumbnailFiles (items: FileBrowserEntry[]) {
  const thumbnailFilenames = new Set(items
    .filter((item): item is AppFileWithMeta => item.type === 'file' && item.extension !== '.jpg' && 'thumbnails' in item)
    .flatMap(item => item.thumbnails
      ? item.thumbnails.map(thumbnail => thumbnail.relative_path)
      : []
    ))

  const thumbnails = getAllFiles()
    .filter(file => file.type === 'file' && thumbnailFilenames.has(file.filename))

  items.push(...thumbnails)
}

// If the root changes, reset the path and load the root path files.
function handleRootChange (root: string) {
  if (root.length) {
    currentRoot.value = root
    loadFiles(root)
  }
}

// Sets a new path and loads the files if necessary.
function loadFiles (path: string) {
  if (!disabled.value) {
    currentPath.value = path

    const pathContent: MoonrakerPathContent | undefined = typedState.files.pathContent[path]

    if (pathContent == null || pathContent.partial === true) {
      handleRefresh()
    }
  }
}

// Refreshes a path by loading the directory.
function handleRefresh () {
  if (!disabled.value) {
    SocketActions.serverFilesGetDirectory(currentPath.value)
  }
}

// Handles a user filtering the data.
function handleFilter (newFilters: FileFilterType[]) {
  filters.value = newFilters
}

// Handles a user clicking a file row.
function handleRowClick (item: FileBrowserEntry, event: MouseEvent) {
  if (disabled.value) {
    return
  }

  if (contextMenuState.value.open) {
    contextMenuState.value.open = false

    if (event.type !== 'contextmenu') {
      return
    }
  }

  if (item.type === 'directory') {
    if (event.type === 'click') {
      if (item.dirname === '..') {
        const dirs = currentPath.value.split('/')
        const newpath = dirs.slice(0, -1).join('/')

        loadFiles(newpath)
      } else {
        loadFiles(`${currentPath.value}/${item.dirname}`)
      }

      // Clear selected bulk items if we're navigating folders.
      selected.value = []

      return
    } else if (item.dirname === '..' || item.permissions === 'r' || rootProperties.value.readonly) {
      return
    }
  }

  if (
    selected.value.length !== 0 &&
    !selected.value.some(x => x.name === item.name)
  ) {
    return
  }

  if (item.type === 'file' && event.type === 'click') {
    if (typedState.config.uiSettings.editor.autoEditExtensions.includes(item.extension)) {
      handleFileOpenDialog(item, 'edit')
      return
    } else if (rootProperties.value.canView.includes(item.extension)) {
      handleFileOpenDialog(item, 'view')
      return
    }
  }

  // Open the context menu
  contextMenuState.value.x = event.clientX
  contextMenuState.value.y = event.clientY
  contextMenuState.value.file = selected.value.length > 1
    ? selected.value
    : item
  nextTick(() => {
    contextMenuState.value.open = true
  })
}

/**
 * ===========================================================================
 * Dialog handling.
 * ===========================================================================
*/
function handleRenameDialog (item: FileBrowserEntry | FileBrowserEntry[]) {
  if (Array.isArray(item)) return
  return _handleRenameDialog(item)
}

function _handleRenameDialog (item: FileBrowserEntry) {
  if (disabled.value) return

  const [title, label, isFile] = item.type === 'file'
    ? [t('app.file_system.title.rename_file'), t('app.file_system.label.file_name'), true]
    : [t('app.file_system.title.rename_dir'), t('app.file_system.label.dir_name'), false]

  fileNameDialogState.value = {
    open: true,
    title,
    label,
    isFile,
    value: item.name,
    handler: handleRename
  }
}

function handleDuplicateDialog (item: FileBrowserEntry | FileBrowserEntry[]) {
  if (Array.isArray(item)) return
  if (disabled.value) return

  const [title, label, isFile] = item.type === 'file'
    ? [t('app.file_system.title.duplicate_file'), t('app.file_system.label.file_name'), true]
    : [t('app.file_system.title.duplicate_dir'), t('app.file_system.label.dir_name'), false]

  fileNameDialogState.value = {
    open: true,
    title,
    label,
    isFile,
    value: item.name,
    handler: handleDuplicate
  }
}

function handleAddFileDialog () {
  if (disabled.value) return
  fileNameDialogState.value = {
    open: true,
    title: t('app.file_system.title.add_file'),
    label: t('app.file_system.label.file_name'),
    isFile: true,
    value: '',
    handler: handleAddFile
  }
}

function handleAddDirDialog () {
  if (disabled.value) return
  fileNameDialogState.value = {
    open: true,
    title: t('app.file_system.title.add_dir'),
    label: t('app.file_system.label.dir_name'),
    isFile: false,
    value: '',
    handler: handleAddDir
  }
}

function handleGoToFileDialog () {
  if (disabled.value) return
  goToFileDialogOpen.value = true
}

async function handleFileOpenDialog (file: FileBrowserEntry | FileBrowserEntry[], mode: 'edit' | 'view' | undefined = undefined) {
  if (Array.isArray(file) || file.type !== 'file') return
  try {
    const viewOnly = mode
      ? mode === 'view'
      : rootProperties.value.canView.includes(file.extension)

    if (viewOnly) {
      const response = await getFile<Blob>(
        file.filename,
        currentPath.value,
        file.size,
        { responseType: 'blob' }
      )

      filePreviewState.value = {
        open: true,
        file,
        filename: file.filename,
        extension: file.extension,
        src: URL.createObjectURL(response.data),
        type: response.data.type,
        readonly: file.permissions === 'r' || rootProperties.value.readonly
      }
    } else {
      const response = await getFile<string>(
        file.filename,
        currentPath.value,
        file.size,
        { responseType: 'text' }
      )

      fileEditorDialogState.value = {
        open: true,
        contents: response.data,
        filename: file.filename,
        loading: false,
        readonly: file.permissions === 'r' || rootProperties.value.readonly
      }
    }
  } catch (error: unknown) {
    consola.error('[FileSystem] open file', error)
  }
}

async function handlePreviewGcode (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (Array.isArray(file) || file.type !== 'file') return
  try {
    const response = await getGcode(file)

    const gcode = response?.data

    if (!gcode) return

    if (
      route.name !== 'home' ||
      !typedGetters['layout/isEnabledInCurrentLayout']('gcode-preview-card')
    ) {
      router.push({ name: 'gcode_preview' })
    }

    typedDispatch('gcodePreview/loadGcode', {
      file,
      gcode
    })
  } catch (error: unknown) {
    consola.error('[FileSystem] preview gcode', error)
  }
}

function handleRefreshMetadata (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (disabled.value) return

  const fileList = Array.isArray(file) ? file : [file]
  const filenames = fileList
    .filter((item): item is AppFileWithMeta => item.type === 'file' && rootProperties.value.accepts.includes(item.extension))
    .map(f => f.path ? `${f.path}/${f.filename}` : f.filename)

  for (const filename of filenames) {
    SocketActions.serverFilesMetascan(filename)
  }
}

function handlePerformTimeAnalysis (file: FileBrowserEntry | FileBrowserEntry[]) {
  const items = Array.isArray(file) ? file : [file]
  const filenames = items
    .filter((item): item is AppFileWithMeta => item.type === 'file' && rootProperties.value.accepts.includes(item.extension))
    .map(f => f.path ? `${f.path}/${f.filename}` : f.filename)

  for (const filename of filenames) {
    SocketActions.serverAnalysisProcess(filename, undefined, true)
  }
}

async function handleViewThumbnail (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (Array.isArray(file) || file.type !== 'file') return
  const thumb = getThumb(file, currentRoot.value, file.path, true)

  if (thumb) {
    filePreviewState.value = {
      open: true,
      filename: file.filename,
      src: thumb.url,
      type: 'image/any',
      width: thumb.width
    }
  }
}

/**
 * ===========================================================================
 * Core file handling.
 * ===========================================================================
*/
function handlePrint (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (disabled.value) return
  if (Array.isArray(file) || file.type !== 'file') return

  const filename = file.path ? `${file.path}/${file.filename}` : file.filename

  if (typedState.printer.printer.mmu?.enabled === true) {
    if ('referenced_tools' in file) {
      const mmuPrint = (file.referenced_tools?.length ?? 1) > 1 || typedState.printer.printer.mmu?.gate !== -2
      if (mmuPrint) {
        typedCommit('mmu/setDialogState', {
          show: true,
          filename
        })

        return
      }
    }
  }

  const spoolmanSupported: boolean = typedGetters['spoolman/getAvailable']
  const autoSpoolSelectionDialog: boolean = typedState.config.uiSettings.spoolman.autoSpoolSelectionDialog
  if (spoolmanSupported && autoSpoolSelectionDialog) {
    typedCommit('spoolman/setDialogState', {
      show: true,
      filename
    })

    return
  }

  SocketActions.printerPrintStart(filename)

  // If we aren't on the dashboard, push the user back there.
  if (route.name !== 'home') {
    router.push({ name: 'home' })
  }
}

async function handleSaveAsFileChanges (contents: string | null) {
  if (contents === null) return
  return _handleSaveAsFileChanges(contents)
}

async function _handleSaveAsFileChanges (contents: string, serviceToRestart?: string) {
  fileNameDialogState.value = {
    open: true,
    title: t('app.file_system.title.save_as'),
    label: t('app.file_system.label.file_name'),
    isFile: true,
    value: fileEditorDialogState.value.filename,
    handler: (name: string) => {
      if (name != null) {
        fileEditorDialogState.value.filename = name
      }

      handleSaveFileChanges(contents, serviceToRestart)
    }
  }
}

async function handleSaveFileChanges (contents: string | null, serviceToRestart?: string) {
  if (contents === null) return
  const file = new File([contents], fileEditorDialogState.value.filename)

  if (fileEditorDialogState.value.open) {
    fileEditorDialogState.value.loading = true
  }

  await uploadFile(file, visiblePath.value, currentRoot.value, false)

  fileEditorDialogState.value.loading = false

  switch (serviceToRestart) {
    case 'moonraker':
      serviceRestartMoonraker()
      break

    case 'klipper': {
      const klipperSaveAndRestartAction: KlipperSaveAndRestartAction = typedState.config.uiSettings.editor.klipperSaveAndRestartAction

      switch (klipperSaveAndRestartAction) {
        case 'auto': {
          const isSimulavrMcu: boolean = typedGetters['printer/getIsSimulavrMcu']

          if (isSimulavrMcu) {
            serviceRestartKlipper()
          } else {
            firmwareRestartKlippy()
          }
          break
        }

        case 'host-restart':
          restartKlippy()
          break

        case 'service-restart':
          serviceRestartKlipper()
          break

        default:
          firmwareRestartKlippy()
      }
      break
    }

    default:
      if (serviceToRestart) {
        serviceRestartByName(serviceToRestart)
      }
  }
}

function handleMove (source: FileBrowserEntry | FileBrowserEntry[], destination: FileBrowserEntry) {
  const dir = destination as AppDirectory
  let destinationPath = `${currentPath.value}/${dir.dirname}`
  if (dir.dirname === '..') {
    const arr = currentPath.value.split('/')
    arr.pop()
    destinationPath = arr.join('/')
  }

  const items = Array.isArray(source)
    ? source.filter(item => item.name !== '..')
    : [source]

  if (currentRoot.value === 'timelapse') {
    includeTimelapseThumbnailFiles(items)
  }

  for (const item of items) {
    const src = `${currentPath.value}/${item.name}`
    const dest = destinationPath
      ? `${destinationPath}/${item.name}`
      : `${item.name}`
    SocketActions.serverFilesMove(src, dest)
  }
}

function handleDragStart (item: FileBrowserEntry, items: FileBrowserEntry[], dataTransfer: DataTransfer) {
  if (item.type === 'file') {
    const url = createFileUrl(item.name, currentPath.value)

    dataTransfer.setData('text/html', `<A HREF="${url}">${item.filename}</A>`)
    dataTransfer.setData('text/plain', url)
    dataTransfer.setData('text/uri-list', url)
  }

  setFileDataTransferDataInDataTransfer(dataTransfer, 'files', {
    path: currentPath.value,
    items: items.map(file => file.name)
  })

  if (currentRoot.value === 'gcodes') {
    const gfiles = items
      .filter((i): i is AppFile => i.type === 'file' && rootProperties.value.accepts.includes(i.extension))

    if (gfiles.length > 0) {
      setFileDataTransferDataInDataTransfer(dataTransfer, 'jobs', {
        path: gfiles[0].path,
        items: gfiles.map(file => file.name)
      })
    }
  }
}

function handleRename (name: string) {
  const src = `${currentPath.value}/${fileNameDialogState.value.value}`
  const dest = `${currentPath.value}/${name}`
  SocketActions.serverFilesMove(src, dest)
}

function handleDuplicate (name: string) {
  const src = `${currentPath.value}/${fileNameDialogState.value.value}`
  const dest = `${currentPath.value}/${name}`
  SocketActions.serverFilesCopy(src, dest)
}

async function handleRemove (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (disabled.value) return

  const items = Array.isArray(file)
    ? file.filter(item => item.name !== '..')
    : [file]

  const result = await confirm(
    tc('app.general.simple_form.msg.confirm_delete', items.length),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    filePreviewState.value.open = false

    if (currentRoot.value === 'timelapse') {
      includeTimelapseThumbnailFiles(items)
    }

    for (const item of items) {
      if (item.type === 'file') {
        SocketActions.serverFilesDeleteFile(`${currentPath.value}/${item.filename}`)
      } else {
        SocketActions.serverFilesDeleteDirectory(`${currentPath.value}/${item.dirname}`, true)
      }
    }
  }
}

async function handleUpload (fileList: FileList | File[] | FileWithPath[], print: boolean) {
  const wait = `${Waits.onFileSystem}/${currentPath.value}/`

  typedDispatch('wait/addWait', wait)

  await uploadFiles(fileList, visiblePath.value, currentRoot.value, print)

  typedDispatch('wait/removeWait', wait)
}

function handleAddDir (name: string) {
  SocketActions.serverFilesPostDirectory(`${currentPath.value}/${name}`)
}

function handleAddFile (name: string) {
  const file = new File([], name)
  uploadFile(file, visiblePath.value, currentRoot.value, false)
}

function handleDownload (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (Array.isArray(file) || file.type !== 'file') return
  downloadFile(file.filename, currentPath.value)
}

function handlePreheat (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (disabled.value) return
  if (Array.isArray(file) || file.type !== 'file') return
  const meta = file as AppFileWithMeta
  if (
    meta.first_layer_extr_temp &&
    meta.first_layer_bed_temp &&
    !printerPrinting.value &&
    !printerPaused.value &&
    klippyReady.value
  ) {
    if (meta.first_layer_extr_temp > 0) {
      sendGcode(`M104 S${meta.first_layer_extr_temp}`)
    }
    if (meta.first_layer_bed_temp > 0) {
      sendGcode(`M140 S${meta.first_layer_bed_temp}`)
    }
    if (meta.chamber_temp && meta.chamber_temp > 0) {
      sendGcode(`M141 S${meta.chamber_temp}`)
    }
  }
}

function handleEnqueue (file: FileBrowserEntry | FileBrowserEntry[]) {
  if (disabled.value) return

  const items = Array.isArray(file) ? file : [file]
  const filenames = items
    .filter((item): item is AppFile => item.type === 'file' && rootProperties.value.accepts.includes(item.extension))
    .map(f => f.path ? `${f.path}/${f.filename}` : f.filename)

  if (filenames.length > 0) {
    SocketActions.serverJobQueuePostJob(filenames)
  }
}

function handleCreateZip (file: FileBrowserEntry | FileBrowserEntry[]) {
  const timestamp = Filters.formatTimestamp(Date.now())

  const dest = Array.isArray(file)
    ? `${currentPath.value}/${timestamp}.zip`
    : `${currentPath.value}/${file.name}-${timestamp}.zip`

  const items = (Array.isArray(file) ? file : [file])
    .map(item => `${currentPath.value}/${item.name}`)

  SocketActions.serverFilesZip(dest, items)
}

/**
 * ===========================================================================
 * Drag handling.
 * ===========================================================================
*/
function handleDragOver (event: DragEvent) {
  if (
    !fileDropRoot.value &&
    !rootProperties.value.readonly &&
    !dragState.value.browserState &&
    event.dataTransfer &&
    (
      hasFilesInDataTransfer(event.dataTransfer) ||
      hasFileDataTransferTypeInDataTransfer(event.dataTransfer, 'files')
    )
  ) {
    event.preventDefault()

    dragState.value.overlay = true

    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragLeave () {
  dragState.value.overlay = false
}

async function handleDrop (event: DragEvent) {
  dragState.value.overlay = false

  if (
    !fileDropRoot.value &&
    !rootProperties.value.readonly &&
    event.dataTransfer
  ) {
    if (hasFileDataTransferTypeInDataTransfer(event.dataTransfer, 'files')) {
      const fileTransferData = getFileDataTransferDataFromDataTransfer(event.dataTransfer, 'files')

      for (const file of fileTransferData.items) {
        const src = `${fileTransferData.path}/${file}`
        const dest = `${currentPath.value}/${file}`
        SocketActions.serverFilesCopy(src, dest)
      }
    } else if (hasFilesInDataTransfer(event.dataTransfer)) {
      const droppedFiles = await getFilesFromDataTransfer(event.dataTransfer)

      if (droppedFiles) {
        handleUpload(droppedFiles, false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .filesystem-wrapper,
  .file-system,
  .file-system :deep(.v-data-table) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }

  .v-text-field .v-select__slot .v-select__selection--comma {
    min-width: min-content;
  }

  .dragOverlay.v-overlay--active {
    border: dashed 3px #616161;
  }

  :deep(.dragOverlay > .v-overlay__content) {
    width: 100%;
  }
</style>

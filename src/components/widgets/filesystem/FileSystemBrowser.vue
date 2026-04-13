<template>
  <div class="file-system">
    <!-- <pre>selected: {{ selected }}</pre> -->
    <!-- <div class="bulk-actions" v-if="selected.length > 0">
      Some bulk actions.
    </div> -->

    <v-data-table
      :value="selected"
      :headers="headers"
      :items="files"
      :dense="dense"
      disable-pagination
      :loading="loading"
      :custom-sort="customSort"
      :search="search"
      :show-select="bulkActions"
      :no-data-text="$t('app.file_system.msg.not_found')"
      :no-results-text="$t('app.file_system.msg.not_found')"
      item-key="name"
      height="100%"
      mobile-breakpoint="0"
      must-sort
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      hide-default-footer
      class="rounded-0"
      fixed-header
      @input="handleSelected"
    >
      <template #item="{ headers: slotHeaders, item, isSelected, select }">
        <app-data-table-row
          :key="item.name"
          :headers="slotHeaders"
          :item="item"
          :is-selected="isSelected && item.name !== '..'"
          :draggable="isItemDraggable(item)"
          :custom-getter="getItemValue"
          @click.prevent="$emit('row-click', item, $event)"
          @contextmenu.prevent="$emit('row-click', item, $event)"
          @dragstart="handleDragStart(item, $event)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver(item, $event)"
          @dragenter.prevent
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop(item, $event)"
        >
          <template #[`item.data-table-select`]>
            <v-simple-checkbox
              v-if="item.name !== '..'"
              :value="isSelected"
              class="mt-1"
              @click.stop="select(!isSelected)"
            />
            <template v-else>
              {{ '' }}
            </template>
          </template>

          <template #[`item.data-table-icons`]>
            <v-layout
              justify-center
              class="no-pointer-events"
            >
              <v-icon
                v-if="!item.thumbnails?.length"
                :small="dense"
                :color="(item.type === 'file') ? 'grey' : 'primary'"
              >
                {{ getItemIcon(item) }}
              </v-icon>
              <img
                v-else
                :style="{
                  'max-width': `${thumbnailSize}px`,
                  'max-height': `${thumbnailSize}px`
                }"
                :src="getThumbUrl(item, root, item.path, thumbnailSize > 16, item.modified)"
              >
            </v-layout>
          </template>

          <template #[`item-value.history.status`]>
            <job-history-item-status :job="item.history" />
          </template>

          <template #[`item-value.filament_colors`]="{ value: cellValue }">
            <app-data-table-cell-colors :colors="cellValue" />
          </template>

          <template #[`item-value.extruder_colors`]="{ value: cellValue }">
            <app-data-table-cell-colors :colors="cellValue" />
          </template>

          <template #[`item-value.filament_temps`]="{ value: cellValue }">
            <app-data-table-cell-temps :temps="cellValue" />
          </template>

          <template #[`item-value.first_layer_bed_temp`]="{ value: cellValue }">
            {{ cellValue }}<small>°C</small>
          </template>

          <template #[`item-value.first_layer_extr_temp`]="{ value: cellValue }">
            {{ cellValue }}<small>°C</small>
          </template>

          <template #[`item-value.chamber_temp`]="{ value: cellValue }">
            {{ cellValue }}<small>°C</small>
          </template>
        </app-data-table-row>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useVuetify } from '@/composables/useVuetify'
import type { FileBrowserEntry, RootProperties } from '@/store/files/types'
import JobHistoryItemStatus from '@/components/widgets/history/JobHistoryItemStatus.vue'
import { SupportedImageFormats, SupportedMarkdownFormats, SupportedVideoFormats } from '@/globals'
import type { TextSortOrder } from '@/store/config/types'
import type { DataTableHeader } from 'vuetify'
import versionStringCompare from '@/util/version-string-compare'
import { get } from 'lodash-es'
import type { DefaultGetterFunction } from '@/components/ui/AppDataTableRow.vue'
import { Filters } from '@/plugins/filters'

const props = defineProps<{
  value: FileBrowserEntry[]
  root: string
  files: FileBrowserEntry[]
  dense?: boolean
  loading?: boolean
  headers: DataTableHeader[]
  search?: string
  dragState: boolean
  bulkActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: FileBrowserEntry[]): void
  (e: 'update:dragState', value: boolean): void
  (e: 'row-click', item: FileBrowserEntry, event: MouseEvent): void
  (e: 'move', items: FileBrowserEntry[], destination: FileBrowserEntry): void
  (e: 'drag-start', item: FileBrowserEntry, items: FileBrowserEntry[], dataTransfer: DataTransfer): void
}>()

const selected = computed(() => props.value)

const { typedState, typedGetters, typedDispatch } = useStore()
const { getThumbUrl } = useFilesMixin()
const vuetify = useVuetify()

const dragItem = ref<FileBrowserEntry | null>(null)
const ghost = ref<HTMLDivElement | undefined>(undefined)

const rootProperties = computed<RootProperties>(() =>
  typedGetters['files/getRootProperties'](props.root)
)

const readonly = computed(() => rootProperties.value.readonly)

const thumbnailSize = computed(() => {
  const size: number = typedState.config.uiSettings.thumbnailSizes[props.root] ?? 32
  return props.dense ? size / 2 : size
})

const textSortOrder = computed<TextSortOrder>(() =>
  typedState.config.uiSettings.general.textSortOrder
)

const filesAndFoldersDragAndDrop = computed(() =>
  typedState.config.uiSettings.general.filesAndFoldersDragAndDrop
)

const draggedItems = computed(() => {
  if (dragItem.value) {
    const filteredSelectedItems = selected.value
      .filter(item => item.name !== '..')

    return filteredSelectedItems.length > 0
      ? filteredSelectedItems
      : [dragItem.value]
  }

  return []
})

const sortBy = computed({
  get: () => {
    const value: string | null = typedState.config.uiSettings.fileSystem.sortBy[props.root]
    return value ?? 'modified'
  },
  set: (value: string | null | undefined) => {
    typedDispatch('config/updateFileSystemSortBy', { root: props.root, value: value ?? null })
  }
})

const sortDesc = computed({
  get: () => {
    const value: boolean | null = typedState.config.uiSettings.fileSystem.sortDesc[props.root]
    return value ?? true
  },
  set: (value: boolean | null | undefined) => {
    typedDispatch('config/updateFileSystemSortDesc', { root: props.root, value: value ?? null })
  }
})

function customSort (items: FileBrowserEntry[], sortByArr: string[], sortDescArr: boolean[], locale: string) {
  if (sortByArr === null || !sortByArr.length) return items

  const stringCollator = new Intl.Collator(locale, {
    sensitivity: 'accent',
    usage: 'sort'
  })

  return items.sort((a, b) => {
    if (a.type === 'directory' && (a.dirname === '..' || b.type !== 'directory')) return -1
    if (b.type === 'directory' && (b.dirname === '..' || a.type !== 'directory')) return 1

    for (let i = 0; i < sortByArr.length; i++) {
      const sortKey = sortByArr[i]

      const sortValues: unknown[] = [
        get(a, sortKey),
        get(b, sortKey)
      ]

      if (sortValues[0] === sortValues[1]) {
        continue
      }

      if (sortDescArr[i]) {
        sortValues.reverse()
      }

      if (
        typeof sortValues[0] === 'number' &&
        typeof sortValues[1] === 'number' &&
        !Number.isNaN(sortValues[0]) &&
        !Number.isNaN(sortValues[1])
      ) {
        return sortValues[0] - sortValues[1]
      }

      const sortValuesAsString = sortValues
        .map(s => s?.toString() ?? '')

      if (textSortOrder.value === 'numeric-prefix') {
        const [sortA, sortB] = sortValuesAsString
          .map(s => s.match(/^\d+/))

        if (sortA && sortB && sortA[0] !== sortB[0]) {
          return +sortA[0] - +sortB[0]
        }
      } else if (textSortOrder.value === 'version') {
        return versionStringCompare(sortValuesAsString[0], sortValuesAsString[1])
      }

      return stringCollator.compare(sortValuesAsString[0], sortValuesAsString[1])
    }

    return 0
  })
}

function handleSelected (sel: FileBrowserEntry[]) {
  let newSel = sel

  if (newSel.length === 1) {
    if (newSel[0].name === '..') {
      newSel = []
    } else {
      newSel = props.files
        .filter(item => item.name === newSel[0].name || item.name === '..')
    }
  }

  emit('input', newSel)
}

function getItemIcon (item: FileBrowserEntry) {
  const isReadonly = !isItemWriteable(item)

  if (item.type === 'file') {
    if (item.extension === '.zip') {
      return isReadonly ? '$fileZipLock' : '$fileZip'
    } else if (
      SupportedImageFormats.includes(item.extension) ||
      SupportedVideoFormats.includes(item.extension)
    ) {
      return isReadonly ? '$fileImageLock' : '$fileImage'
    } else if (
      SupportedMarkdownFormats.includes(item.extension)
    ) {
      return isReadonly ? '$fileDocumentLock' : '$fileDocument'
    } else {
      return isReadonly ? '$fileLock' : '$file'
    }
  } else if (item.name === '..') {
    return '$folderUp'
  } else {
    return isReadonly ? '$folderLock' : '$folder'
  }
}

function isItemDraggable (item: FileBrowserEntry) {
  return (
    filesAndFoldersDragAndDrop.value &&
    item.name !== '..' &&
    props.files.length > 0 &&
    (
      selected.value.length === 0 ||
      selected.value.includes(item)
    )
  )
}

function isItemWriteable (item: FileBrowserEntry) {
  return (
    !readonly.value &&
    (
      item.permissions === undefined ||
      item.permissions.includes('w')
    )
  )
}

function handleDragStart (item: FileBrowserEntry, event: DragEvent) {
  if (props.dragState !== true) {
    dragItem.value = item
    emit('update:dragState', true)
  }

  if (event.dataTransfer) {
    const items = draggedItems.value

    ghost.value = document.createElement('div')
    ghost.value.classList.add('bulk-drag')
    ghost.value.classList.add((vuetify.theme.dark) ? 'theme--dark' : 'theme--light')
    ghost.value.innerHTML = items.length > 1
      ? `${items.length} items`
      : item.name
    document.body.appendChild(ghost.value)
    event.dataTransfer.effectAllowed = 'all'
    event.dataTransfer.setDragImage(ghost.value, 0, 0)

    emit('drag-start', item, items, event.dataTransfer)
  }
}

function handleDrop (item: FileBrowserEntry, event: DragEvent) {
  handleDragLeave(event)

  if (
    item.type === 'directory' &&
    isItemWriteable(item) &&
    event.dataTransfer &&
    dragItem.value &&
    dragItem.value !== item
  ) {
    const items = draggedItems.value

    if (!items.includes(item)) {
      emit('move', items, item)
    }
  }
}

function handleDragOver (item: FileBrowserEntry, event: DragEvent) {
  if (
    item.type === 'directory' &&
    isItemWriteable(item) &&
    event.dataTransfer &&
    dragItem.value &&
    dragItem.value !== item &&
    !draggedItems.value.includes(item)
  ) {
    event.preventDefault()

    event.dataTransfer.dropEffect = 'move'

    if (event.target instanceof HTMLElement) {
      let element: HTMLElement | null = event.target

      while (element) {
        if (element.tagName === 'TR') {
          element.classList.add('active')
          return
        }

        element = element.parentElement
      }
    }
  }
}

function handleDragLeave (event: DragEvent) {
  if (event.target instanceof HTMLElement) {
    let element: HTMLElement | null = event.target

    while (element) {
      if (element.tagName === 'TR') {
        element.classList.remove('active')
        return
      }

      element = element.parentElement
    }
  }
}

function handleDragEnd () {
  const g = ghost.value

  if (g) {
    document.body.removeChild(g)
    ghost.value = undefined
  }

  dragItem.value = null
  emit('update:dragState', false)
}

function getItemValue (item: FileBrowserEntry, header: DataTableHeader, defaultGetter: DefaultGetterFunction) {
  const value = defaultGetter(item, header)

  if (typeof value === 'number') {
    switch (header.value) {
      case 'object_height':
      case 'filament_total':
      case 'history.filament_used':
        return Filters.getReadableLengthString(value)

      case 'first_layer_height':
      case 'layer_height':
      case 'nozzle_diameter':
        return `${value} mm`

      case 'filament_weight_total':
        return Filters.getReadableWeightString(value)

      case 'estimated_time':
      case 'history.print_duration':
      case 'history.total_duration':
        return Filters.formatCounterSeconds(value)

      case 'print_start_time':
      case 'modified':
        return Filters.formatDateTime(value * 1000)

      case 'size':
        return Filters.getReadableFileSizeString(value)
    }
  }

  if (Array.isArray(value) && value.length > 0) {
    switch (header.value) {
      case 'filament_weights':
        return value
          .map(x => typeof x === 'number'
            ? Filters.getReadableWeightString(x)
            : x
          )

      case 'file_processors':
        return value
          .map(x => typeof x === 'string'
            ? Filters.prettyCase(x)
            : x
          )
    }
  }

  return value
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  // Lighten up dark mode checkboxes.
  .theme--dark :deep(.v-simple-checkbox .v-icon) {
    color: rgba(map-deep-get($material-dark, 'inputs', 'box'), 0.25);
  }
</style>

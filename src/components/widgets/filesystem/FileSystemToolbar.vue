<template>
  <v-toolbar
    dense
  >
    <v-toolbar-title class="d-none d-sm-block">
      <div class="file-path">
        &lrm;/{{ path }}
      </div>
    </v-toolbar-title>

    <v-spacer />

    <v-tooltip
      v-if="klippyReady && !loading && lowOnSpace"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          color="warning"
          v-on="on"
        >
          <v-icon color="warning">
            $error
          </v-icon>
        </app-btn>
      </template>
      <slot>
        <span>{{ $t('app.file_system.tooltip.low_on_space') }}</span>
      </slot>
    </v-tooltip>

    <v-tooltip
      v-if="disabled && !loading"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          color="error"
          v-on="on"
        >
          <v-icon color="error">
            $warning
          </v-icon>
        </app-btn>
      </template>
      <slot>
        <span>{{ $t('app.file_system.tooltip.root_disabled', { root }) }}</span>
      </slot>
    </v-tooltip>

    <app-thumbnail-size
      v-if="['gcodes', 'timelapse'].includes(root)"
      v-model="thumbnailSize"
    />

    <app-column-picker
      v-if="headers && canConfigure"
      :key-name="`${root}_${name}`"
      :headers="headers"
    />

    <div>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            :disabled="disabled"
            icon
            text
            @click="$emit('go-to-file')"
            v-on="on"
          >
            <v-icon>$magnify</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('app.general.btn.go_to_file') }}</span>
      </v-tooltip>
    </div>

    <file-system-filter-menu
      v-if="hasFilterTypes"
      :root="root"
      :disabled="disabled"
      @change="$emit('filter', $event)"
    />

    <file-system-add-menu
      v-if="!readonly"
      :root="root"
      :disabled="disabled"
      @add-file="$emit('add-file')"
      @add-dir="$emit('add-dir')"
      @upload="handleUpload"
    />

    <div>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            :disabled="disabled"
            icon
            text
            @click="$emit('refresh')"
            v-on="on"
          >
            <v-icon>$refresh</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('app.general.btn.refresh') }}</span>
      </v-tooltip>
    </div>

    <div
      style="max-width: 160px;"
      class="ml-1"
    >
      <v-text-field
        v-model="searchModel"
        :disabled="disabled"
        outlined
        dense
        single-line
        hide-details
        spellcheck="false"
        append-icon="$magnify"
        @focus="$event.target.select()"
      />
    </div>

    <template
      v-if="roots && roots.length > 1"
      #extension
    >
      <v-tabs show-arrows>
        <v-tab
          v-for="(rootItem, index) in roots"
          :key="index"
          @change="$emit('root-change', rootItem)"
        >
          {{ rootItem }}
        </v-tab>
      </v-tabs>
    </template>
  </v-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import FileSystemAddMenu from './FileSystemAddMenu.vue'
import FileSystemFilterMenu from './FileSystemFilterMenu.vue'
import type { AppDataTableHeader } from '@/types'
import type { RootProperties } from '@/store/files/types'

const props = defineProps<{
  root: string
  name: string
  roots?: string[]
  headers?: AppDataTableHeader[]
  path: string
  disabled?: boolean
  loading?: boolean
  search: string
}>()

const emit = defineEmits<{
  (e: 'root-change', root: string): void
  (e: 'refresh'): void
  (e: 'add-file'): void
  (e: 'add-dir'): void
  (e: 'upload', files: any[], print: boolean): void
  (e: 'filter', filters: any[]): void
  (e: 'go-to-file'): void
  (e: 'update:search', value: string): void
}>()

const { klippyReady } = useStateMixin()
const { typedState, typedGetters, typedDispatch } = useStore()

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value)
})

const rootProperties = computed<RootProperties>(() =>
  typedGetters['files/getRootProperties'](props.root)
)

const readonly = computed(() => rootProperties.value.readonly)

const canConfigure = computed(() => rootProperties.value.canConfigure)

const hasFilterTypes = computed(() => rootProperties.value.filterTypes.length > 0)

const lowOnSpace = computed(() =>
  typedGetters['files/getDiskUsage'](props.root)?.lowOnSpace ?? false
)

const thumbnailSize = computed({
  get: () => typedState.config.uiSettings.thumbnailSizes[props.root] ?? 32,
  set: (value: number) => typedDispatch('config/updateThumbnailSizes', { name: props.root, size: value })
})

function handleUpload (files: FileList | File[], print: boolean) {
  emit('upload', Array.from(files), print)
}
</script>

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
      v-if="canAddToQueue"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          v-on="on"
          @click="$emit('enqueue', selected)"
        >
          <v-icon>
            $enqueueJob
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.add_to_queue') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="canRefreshMetadata"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          v-on="on"
          @click="$emit('refresh-metadata', selected)"
        >
          <v-icon>
            $sync
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.refresh_metadata') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="canPerformTimeAnalysys"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          v-on="on"
          @click="$emit('perform-time-analysis', selected)"
        >
          <v-icon>
            $stopwatch
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.perform_time_analysis') }}</span>
    </v-tooltip>

    <v-tooltip
      v-if="canCreateZip"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          v-on="on"
          @click="$emit('create-zip', selected)"
        >
          <v-icon>
            $fileZipAdd
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.create_zip_archive') }}</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          v-on="on"
          @click="$emit('remove', selected)"
        >
          <v-icon>
            $delete
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.delete') }}</span>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import type { FileBrowserEntry, RootProperties } from '@/store/files/types'

const props = defineProps<{
  root: string
  path: string
  selected: FileBrowserEntry[]
}>()

defineEmits<{
  (e: 'remove', selected: FileBrowserEntry[]): void
  (e: 'create-zip', selected: FileBrowserEntry[]): void
  (e: 'refresh-metadata', selected: FileBrowserEntry[]): void
  (e: 'perform-time-analysis', selected: FileBrowserEntry[]): void
  (e: 'enqueue', selected: FileBrowserEntry[]): void
}>()

const { typedGetters } = useStore()

const rootProperties = computed<RootProperties>(() =>
  typedGetters['files/getRootProperties'](props.root)
)

const canCreateZip = computed(() =>
  (
    props.selected.length > 1 ||
    props.selected[0].type !== 'file' ||
    props.selected[0].extension !== '.zip'
  ) &&
  !rootProperties.value.readonly &&
  typedGetters['server/getIsMinApiVersion']('1.1.0')
)

const isGcodesRootWithAcceptedFiles = computed(() =>
  props.root === 'gcodes' &&
  props.selected.some(x =>
    x.type !== 'directory' &&
    rootProperties.value.accepts.includes(x.extension)
  )
)

const canAddToQueue = computed(() =>
  isGcodesRootWithAcceptedFiles.value &&
  typedGetters['server/componentSupport']('job_queue')
)

const canRefreshMetadata = computed(() =>
  isGcodesRootWithAcceptedFiles.value
)

const canPerformTimeAnalysys = computed(() =>
  isGcodesRootWithAcceptedFiles.value &&
  typedGetters['server/componentSupport']('analysis')
)
</script>

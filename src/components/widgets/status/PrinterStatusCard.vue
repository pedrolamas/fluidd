<template>
  <collapsable-card
    :title="$t('app.printer.title.printer_status')"
    icon="$printer3d"
    draggable
    :collapsable="collapsable"
    layout-path="dashboard.printer-status-card"
  >
    <template #title="{inLayout}">
      <v-tabs
        v-if="!inLayout"
        v-model="tab"
        background-color="transparent"
        mobile-breakpoint="0"
        height="41"
        hide-slider
      >
        <v-tab
          key="status"
        >
          <v-icon left>
            $printer3d
          </v-icon>
          {{ $t('app.printer.state.' + printerState) || printerState }}
        </v-tab>
        <v-tab
          v-if="supportsHistoryComponent && !(printerPrinting || printerPaused)"
          key="reprint"
        >
          {{ $t('app.general.btn.reprint') }}
        </v-tab>
      </v-tabs>
    </template>

    <template #menu>
      <status-controls
        v-if="printerPrinting || printerPaused || filename"
        @print="handlePrint($event)"
      />
    </template>

    <template #collapsed-content>
      <v-progress-linear
        v-if="printerPrinting || printerPaused || filename"
        :height="6"
        :value="estimates.progress"
        color="primary"
      />
    </template>

    <v-tabs-items
      v-model="tab"
      touchless
    >
      <v-tab-item key="status">
        <status-tab />
      </v-tab-item>

      <v-tab-item
        v-if="supportsHistoryComponent"
        key="reprint"
      >
        <reprint-tab
          @print="handlePrint($event)"
        />
      </v-tab-item>
    </v-tabs-items>
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SocketActions } from '@/api/socketActions'
import StatusControls from './StatusControls.vue'
import StatusTab from './StatusTab.vue'
import ReprintTab from './ReprintTab.vue'
import type { TimeEstimates } from '@/store/printer/types'
import getFilePaths from '@/util/get-file-paths'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

const { typedState, typedGetters, typedCommit } = useStore()
const { printerPrinting, printerPaused, printerState } = useStateMixin()

const tab = ref(0)

// If the user has no history plugin, and there's no print running..
// then hide the collapse control.
const supportsHistoryComponent = computed<boolean>(() =>
  typedGetters['server/componentSupport']('history')
)

const filename = computed<string>(() =>
  typedState.printer.printer.print_stats?.filename ?? ''
)

const estimates = computed<TimeEstimates>(() => typedGetters['printer/getTimeEstimates'])

const collapsable = computed(() =>
  printerPrinting.value ||
  supportsHistoryComponent.value ||
  filename.value !== ''
)

function init (name: string) {
  if (name !== '') {
    tab.value = 0
  } else {
    tab.value = 1
  }
}

watch(filename, (val: string) => {
  init(val)
})

init(filename.value)

function handlePrint (name: string) {
  if (typedState.printer.printer.mmu?.enabled === true) {
    const { rootPath, filename: filenameOnly } = getFilePaths(name, 'gcodes')
    const fileWithMeta = typedGetters['files/getFile'](rootPath, filenameOnly)

    if (fileWithMeta != null && 'referenced_tools' in fileWithMeta) {
      const mmuPrint = (fileWithMeta.referenced_tools?.length ?? 1) > 1 || typedState.printer.printer.mmu.gate !== -2

      if (mmuPrint) {
        typedCommit('mmu/setDialogState', {
          show: true,
          filename: name
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
      filename: name
    })

    return
  }

  SocketActions.printerPrintStart(name)
}
</script>

<style lang="scss" scoped>
  :deep(.v-slide-group__prev),
  :deep(.v-slide-group__next) {
    display: none;
  }
</style>

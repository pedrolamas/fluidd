<template>
  <div>
    <app-btn-collapse-group>
      <app-btn
        v-if="printerPrinting || printerPaused"
        :loading="hasWait(Waits.onPrintCancel)"
        :disabled="hasWait([Waits.onPrintCancel, Waits.onPrintResume, Waits.onPrintPause])"
        small
        class="me-1 my-1"
        @click="cancelPrint"
      >
        <v-icon
          small
          left
        >
          $cancelled
        </v-icon>
        <span>{{ $t('app.general.btn.cancel') }}</span>
      </app-btn>

      <pause-resume-btn
        v-if="printerPrinting || printerPaused"
        @pause="pausePrint"
        @resume="resumePrint"
        @pauseAtLayer="showPauseAtLayerDialog = true"
      />

      <app-btn
        v-if="!printerPrinting && !printerPaused && filename"
        small
        class="me-1 my-1"
        @click="resetFile()"
      >
        <v-icon
          small
          left
        >
          $refresh
        </v-icon>
        <span>{{ $t('app.general.btn.reset_file') }}</span>
      </app-btn>

      <app-btn
        v-if="!supportsHistoryComponent && !printerPrinting && !printerPaused && filename"
        small
        class="me-1 my-1"
        @click="$emit('print', filename)"
      >
        <v-icon
          small
          left
        >
          $reprint
        </v-icon>
        <span>{{ $t('app.general.btn.reprint') }}</span>
      </app-btn>
    </app-btn-collapse-group>

    <v-tooltip
      v-if="printerPrinting || printerPaused"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          :disabled="!hasExcludeObjectParts"
          icon
          v-on="on"
          @click="showExcludeObjectDialog = true"
        >
          <v-icon dense>
            $listStatus
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.gcode.label.exclude_object') }}</span>
    </v-tooltip>

    <exclude-objects-dialog
      v-if="showExcludeObjectDialog"
      v-model="showExcludeObjectDialog"
    />

    <pause-at-layer-dialog
      v-if="showPauseAtLayerDialog"
      v-model="showPauseAtLayerDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import PauseResumeBtn from './PauseResumeBtn.vue'
import PauseAtLayerDialog from './PauseAtLayerDialog.vue'

defineEmits<{
  (e: 'print', filename: string): void
}>()

const { printerPrinting, printerPaused, hasWait, cancelPrint, pausePrint, resumePrint, sendGcode } = useStateMixin()
const { typedState, typedGetters } = useStore()

const showExcludeObjectDialog = ref(false)
const showPauseAtLayerDialog = ref(false)

const filename = computed(() => typedState.printer.printer.print_stats?.filename ?? '')
const supportsHistoryComponent = computed(() => typedGetters['server/componentSupport']('history'))
const hasExcludeObjectParts = computed(() => typedGetters['printer/getHasExcludeObjectParts'])

function resetFile () {
  sendGcode('SDCARD_RESET_FILE')
}
</script>

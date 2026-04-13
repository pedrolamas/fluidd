<template>
  <div>
    <!-- Only show the linear progress for mdAndDown -->
    <v-progress-linear
      v-if="
        progressVisible &&
          $vuetify.breakpoint.smAndDown
      "
      :height="6"
      :value="estimates.progress"
      color="primary"
    />

    <v-card-text v-if="visible">
      <v-row>
        <template v-if="progressVisible">
          <v-col
            v-if="printInProgressLayout === 'default' && $vuetify.breakpoint.lgAndUp"
            cols="auto"
            align-self="center"
          >
            <v-progress-circular
              :rotate="-90"
              :size="90"
              :width="7"
              :value="estimates.progress"
              color="primary"
            >
              <span class="percentComplete focus--text">{{ estimates.progress }}%</span>
            </v-progress-circular>
          </v-col>

          <v-col
            v-else-if="printInProgressLayout === 'compact' && $vuetify.breakpoint.mdAndUp"
            cols="auto"
            align-self="center"
          >
            <v-row>
              <v-btn
                text
                class="progress-button mx-2"
                @click="handleViewThumbnail"
              >
                <v-progress-circular
                  :rotate="-90"
                  :size="90"
                  :width="7"
                  :value="estimates.progress"
                  color="primary"
                >
                  <img
                    class="progress-button-image"
                    :src="thumbnail"
                  >
                </v-progress-circular>
              </v-btn>
            </v-row>
            <v-row justify="center">
              <span class="primary--text">{{ estimates.progress }}%</span>
            </v-row>
          </v-col>
        </template>

        <v-col align-self="center">
          <!-- Visible dependent on knowing the file, message or mdAndDown -->
          <v-row
            v-if="
              message ||
                filename !== '' ||
                (progressVisible && $vuetify.breakpoint.mdAndDown)
            "
            no-gutters
          >
            <v-col>
              <status-label
                v-if="progressVisible && $vuetify.breakpoint.mdAndDown"
                :label="$t('app.general.label.progress')"
              >
                <span>{{ estimates.progress }}%</span>
              </status-label>

              <status-label
                v-if="message"
                :label="$t('app.general.label.m117')"
              >
                <span>{{ message }}</span>
              </status-label>

              <status-label
                v-if="filename !== ''"
                :label="$t('app.general.label.file')"
              >
                <span style="word-break: break-all">{{ filename }}</span>
              </status-label>
            </v-col>
          </v-row>

          <!-- During a print. -->
          <v-row
            v-if="printerPrinting"
            no-gutters
          >
            <v-col
              cols="12"
              sm="6"
            >
              <status-label :label="$t('app.general.label.requested_speed')">
                <span v-if="liveVelocity > 0">{{ liveVelocity.toFixed(1) }} mm/s</span>
              </status-label>

              <status-label :label="$t('app.general.label.flow')">
                <span v-if="liveFlow > 0">{{ liveFlow.toFixed(1) }} mm&sup3;/s</span>
              </status-label>

              <status-label :label="$t('app.general.label.filament')">
                <span v-if="filamentUsed > 0">{{ $filters.getReadableLengthString(filamentUsed) }}</span>
              </status-label>

              <status-label :label="$t('app.general.label.layer')">
                <span v-if="layers > 0">{{ layer }} / {{ layers }}</span>
              </status-label>

              <status-label
                v-if="totalToolChangeCount > 0"
                :label="$t('app.general.label.toolchange')"
              >
                <span>{{ currentToolChange }} / {{ totalToolChangeCount }}</span>
              </status-label>
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <status-label
                v-if="estimates.actualLeft > 0"
                :label="$t('app.general.label.actual_time')"
              >
                <span>{{ $filters.formatCounterSeconds(estimates.actualLeft) }}</span>
              </status-label>

              <status-label
                v-else
                :label="$t('app.general.label.file_time')"
              >
                <span v-if="estimates.fileLeft > 0">{{ $filters.formatCounterSeconds(estimates.fileLeft) }}</span>
              </status-label>

              <status-label :label="$t('app.general.label.slicer')">
                <span v-if="estimates.slicerLeft > 0">{{ $filters.formatCounterSeconds(estimates.slicerLeft) }}</span>
              </status-label>

              <status-label :label="$t('app.general.label.total')">
                <span v-if="estimates.printDuration > 0">{{ $filters.formatCounterSeconds(estimates.printDuration) }}</span>
              </status-label>

              <status-label :label="$t('app.general.label.finish_time')">
                <span v-if="estimates.eta > 0">{{ $filters.formatAbsoluteDateTime(estimates.eta) }}</span>
              </status-label>
            </v-col>
          </v-row>

          <!-- After a completed print, with file data and potentially history. -->
          <v-row
            v-if="overviewVisible && printerFile"
            no-gutters
          >
            <v-col>
              <status-label
                v-if="printerFile.history && printerFile.history.filament_used > 0"
                :label="$t('app.general.label.filament')"
              >
                <span>{{ $filters.getReadableLengthString(printerFile.history.filament_used) }}</span>
              </status-label>

              <status-label
                v-else-if="printerFile.filament_total"
                :label="$t('app.general.label.filament')"
              >
                <span>{{ $filters.getReadableLengthString(printerFile.filament_total) }}</span>
              </status-label>

              <status-label
                v-if="printerFile.estimated_time"
                :label="$t('app.general.label.slicer')"
              >
                <span>{{ $filters.formatCounterSeconds(printerFile.estimated_time) }}</span>
              </status-label>

              <status-label
                v-if="printerFile.history && printerFile.history.print_duration > 0"
                :label="$t('app.general.label.actual_time')"
              >
                <span>{{ $filters.formatCounterSeconds(printerFile.history.print_duration) }}</span>
              </status-label>

              <status-label
                v-if="printerFile.history && printerFile.history.total_duration > 0"
                :label="$t('app.general.label.total')"
              >
                <span>{{ $filters.formatCounterSeconds(printerFile.history.total_duration) }}</span>
              </status-label>
            </v-col>
          </v-row>
        </v-col>

        <v-col
          v-if="thumbVisible && printInProgressLayout === 'default'"
          cols="auto"
          align-self="center"
          class="pa-0"
        >
          <v-btn
            text
            height="100%"
            @click="handleViewThumbnail"
          >
            <img
              class="print-thumb"
              :src="thumbnail"
            >
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <file-preview-dialog
      v-if="filePreviewState.open"
      v-model="filePreviewState.open"
      :filename="filePreviewState.filename"
      :src="filePreviewState.src"
      type="image/any"
      :width="filePreviewState.width"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StatusLabel from './StatusLabel.vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'
import { useVuetify } from '@/composables/useVuetify'
import FilePreviewDialog from '../filesystem/FilePreviewDialog.vue'
import type { TimeEstimates } from '@/store/printer/types'
import type { PrintInProgressLayout } from '@/store/config/types'
import type { AppFileWithMeta } from '@/store/files/types'

const { printerPrinting } = useStateMixin()
const { getThumbUrl, getThumb } = useFilesMixin()
const { filamentDiameter } = useToolheadMixin()
const { typedState, typedGetters } = useStore()
const vuetify = useVuetify()

const filePreviewState = ref<any>({
  open: false,
  filename: '',
  src: ''
})

const visible = computed(() => {
  return (
    printerPrinting.value ||
    message.value ||
    printerFile.value != null ||
    thumbVisible.value ||
    (
      progressVisible.value &&
      vuetify.breakpoint.mdAndDown
    )
  )
})

const progressVisible = computed((): boolean => {
  return (
    printerPrinting.value ||
    filename.value !== ''
  )
})

const overviewVisible = computed((): boolean => {
  return (
    !printerPrinting.value &&
    printerFile.value != null
  )
})

const thumbVisible = computed((): boolean => {
  return (
    printerFile.value != null &&
    thumbnail.value != null &&
    vuetify.breakpoint.lgAndUp
  )
})

const printInProgressLayout = computed((): PrintInProgressLayout =>
  typedState.config.uiSettings.general.printInProgressLayout
)

const printerFile = computed((): AppFileWithMeta | undefined => typedGetters['printer/getPrinterFile'])

const filename = computed((): string =>
  typedState.printer.printer.print_stats?.filename ?? ''
)

const message = computed((): string =>
  typedState.printer.printer.display_status?.message ?? ''
)

const thumbnail = computed(() => {
  if (printerFile.value?.thumbnails) {
    return getThumbUrl(printerFile.value, 'gcodes', printerFile.value.path, true, printerFile.value.modified)
  }
  return ''
})

const liveVelocity = computed((): number =>
  typedState.printer.printer.motion_report?.live_velocity ?? 0
)

const liveExtruderVelocity = computed((): number =>
  typedState.printer.printer.motion_report?.live_extruder_velocity ?? 0
)

const liveFlow = computed((): number =>
  Math.PI / 4 * filamentDiameter.value ** 2 * liveExtruderVelocity.value
)

const estimates = computed((): TimeEstimates => typedGetters['printer/getTimeEstimates'])

const layers = computed((): number => typedGetters['printer/getPrintLayers'])
const layer = computed((): number => typedGetters['printer/getPrintLayer'])

const currentToolChange = computed((): number =>
  typedState.printer.printer?.AFC?.current_toolchange ?? 0
)

const totalToolChangeCount = computed((): number =>
  typedState.printer.printer?.AFC?.number_of_toolchanges ?? 0
)

const filamentUsed = computed((): number =>
  typedState.printer.printer.print_stats?.filament_used ?? 0
)

async function handleViewThumbnail () {
  const pf = printerFile.value
  const thumb = pf && getThumb(pf, 'gcodes', pf.path, true, pf.modified)

  if (thumb) {
    filePreviewState.value = {
      open: true,
      filename: pf.filename,
      src: thumb.url,
      width: thumb.width
    }
  }
}
</script>

<style lang="scss" scoped>
  .print-thumb {
    display: block;
    max-height: 110px;
    pointer-events: none;
  }

  .filename {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    // width: 200px;
    direction: rtl;
    text-align: left;
  }

  .progress-button {
    width: 90px !important;
    height: 90px !important;
    border-radius: 50%;
    overflow: hidden;
  }

  .progress-button-image {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
  }
</style>

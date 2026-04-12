<template>
  <app-dialog
    v-model="open"
    scrollable
    :max-width="vuetify.breakpoint.mdAndDown ? '90vw' : '75vw'"
    :title="$tc('app.spoolman.title.spool_selection', targetMacro ? 2 : 1, { macro: targetMacro?.toUpperCase() })"
    title-shadow
  >
    <template #menu>
      <v-menu
        v-if="availableCameras.length > 1"
        left
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on, attrs, value }">
          <app-btn
            v-bind="attrs"
            small
            class="me-1 my-1"
            v-on="on"
          >
            <v-icon
              class="mr-1"
              small
            >
              $camera
            </v-icon>
            {{ $t('app.spoolman.btn.scan_code') }}
            <v-icon
              small
              class="ml-1"
              :class="{ 'rotate-180': value }"
            >
              $chevronDown
            </v-icon>
          </app-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="camera in availableCameras"
            :key="camera.uid"
            @click="cameraScanSource = camera.uid"
          >
            <v-list-item-icon>
              <v-icon>
                $camera
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ camera.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <app-btn
        v-else-if="availableCameras.length"
        small
        class="me-1 my-1"
        @click="cameraScanSource = availableCameras[0].uid"
      >
        <v-icon
          class="mr-1"
          small
        >
          $camera
        </v-icon>
        {{ $t('app.spoolman.btn.scan_code') }}
      </app-btn>
    </template>

    <v-toolbar dense>
      <v-spacer />

      <app-column-picker
        key-name="spoolman"
        :headers="configurableHeaders"
      />

      <v-text-field
        v-model="search"
        outlined
        dense
        single-line
        hide-details
        spellcheck="false"
        append-icon="$magnify"
        style="max-width: 360px"
        class="ml-1"
        @focus="$event.target.select()"
      />
    </v-toolbar>

    <div class="file-system">
      <v-data-table
        :items="availableSpools"
        :headers="headers"
        :search="search"
        :custom-filter="filterResults"
        :no-data-text="$t('app.file_system.msg.not_found')"
        :no-results-text="$t('app.file_system.msg.not_found')"
        :sort-by="sortOrder.key ?? undefined"
        :sort-desc="sortOrder.desc ?? undefined"
        item-key="id"
        mobile-breakpoint="0"
        class="spool-table"
        hide-default-footer
        disable-pagination
        fixed-header
        @update:sort-by="handleSortOrderKeyChange"
        @update:sort-desc="handleSortOrderDescChange"
      >
        <template #item="{ headers: tableHeaders, item }">
          <app-data-table-row
            :key="item.id"
            :headers="tableHeaders"
            :item="item"
            :is-selected="item.id === selectedSpoolId"
            @click.prevent="selectedSpoolId = selectedSpoolId === item.id ? null : item.id"
          >
            <template #[`item.filament_name`]>
              <div class="d-flex my-1">
                <v-progress-circular
                  :rotate="-90"
                  :size="44"
                  :width="3"
                  :value="item.remaining_weight / item.initial_weight * 100"
                  color="primary"
                  class="mr-4 flex-column"
                >
                  <v-icon
                    :color="getSpoolColor(item)"
                    size="42"
                    class="spool-icon"
                  >
                    {{ item.id === selectedSpoolId ? '$markedCircle' : '$filament' }}
                  </v-icon>
                </v-progress-circular>

                <div class="flex-column">
                  <div class="flex-row">
                    {{ item.filament_name }}
                  </div>
                  <div class="flex-row">
                    <small v-if="remainingFilamentUnit === 'weight'">
                      <b>{{ $filters.getReadableWeightString(item.remaining_weight) }}</b>
                      / {{ $filters.getReadableWeightString(item.initial_weight) }}
                    </small>
                    <small v-else-if="remainingFilamentUnit === 'length'">
                      <b>{{ $filters.getReadableLengthString(item.remaining_length) }}</b>
                      / {{ $filters.getReadableLengthString(item.initial_length) }}
                    </small>
                  </div>
                </div>
              </div>
            </template>

            <template #[`item-value.afc_loaded_lane`]="{ value }">
              <v-chip
                v-if="value != null"
                color="primary"
                small
              >
                {{ $filters.prettyCase(value ?? '') }}
              </v-chip>
            </template>

            <template #[`item-value.initial_weight`]="{ value }">
              {{ $filters.getReadableWeightString(value) }}
            </template>

            <template #[`item-value.used_weight`]="{ value }">
              {{ $filters.getReadableWeightString(value) }}
            </template>

            <template #[`item-value.remaining_weight`]="{ value }">
              {{ $filters.getReadableWeightString(value) }}
            </template>

            <template #[`item-value.initial_length`]="{ value }">
              {{ $filters.getReadableLengthString(value) }}
            </template>

            <template #[`item-value.used_length`]="{ value }">
              {{ $filters.getReadableLengthString(value) }}
            </template>

            <template #[`item-value.remaining_length`]="{ value }">
              {{ $filters.getReadableLengthString(value) }}
            </template>

            <template #[`item-value.price`]="{ value }">
              {{ $filters.getReadableCurrencyString(value, currency ?? '') }}
            </template>

            <template #[`item-value.filament.density`]="{ value }">
              {{ value }} g/cm³
            </template>

            <template #[`item-value.filament.diameter`]="{ value }">
              {{ value }} mm
            </template>

            <template #[`item-value.filament.settings_extruder_temp`]="{ value }">
              {{ value }}<small>°C</small>
            </template>

            <template #[`item-value.filament.settings_bed_temp`]="{ value }">
              {{ value }}<small>°C</small>
            </template>

            <template #[`item.first_used`]="{ value }">
              <v-tooltip
                bottom
                :disabled="!value"
              >
                <template #activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{
                      value
                        ? $filters.formatRelativeTimeToNow(value)
                        : $tc('app.setting.label.never')
                    }}
                  </span>
                </template>
                <span>{{ value ? $filters.formatDateTime(value) : null }}</span>
              </v-tooltip>
            </template>

            <template #[`item.last_used`]="{ value }">
              <v-tooltip
                bottom
                :disabled="!value"
              >
                <template #activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{
                      value
                        ? $filters.formatRelativeTimeToNow(value)
                        : $tc('app.setting.label.never')
                    }}
                  </span>
                </template>
                <span>{{ value ? $filters.formatDateTime(value) : null }}</span>
              </v-tooltip>
            </template>

            <template #[`item-value.filament.colors`]="{ value }">
              <app-data-table-cell-colors :colors="value" />
            </template>
          </app-data-table-row>
        </template>
      </v-data-table>
    </div>

    <template #actions>
      <v-spacer v-if="isMobileViewport" />

      <app-btn
        v-if="spoolmanURL"
        :href="spoolmanURL"
        target="_blank"
        color="primary"
        text
        type="button"
      >
        {{ $t('app.spoolman.btn.manage_spools') }}
      </app-btn>

      <v-spacer v-if="!isMobileViewport" />

      <app-btn
        text
        color="warning"
        @click="open = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
      <app-btn
        color="primary"
        @click="handleSelectSpool"
      >
        {{
          filename
            ? $t('app.general.btn.print')
            : $tc('app.spoolman.btn.select', targetMacro ? 2 : 1, { macro: targetMacro })
        }}
      </app-btn>
    </template>

    <QRReader
      v-if="cameraScanSource"
      v-model="cameraScanSource"
      @detected="handleQRCodeDetected"
    />
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { SocketActions } from '@/api/socketActions'
import type { Spool } from '@/store/spoolman/types'
import QRReader from '@/components/widgets/spoolman/QRReader.vue'
import QrScanner from 'qr-scanner'
import type { AppDataTableHeader } from '@/types'
import getFilePaths from '@/util/get-file-paths'
import type { DataTableHeader } from 'vuetify'
import type { AppFileWithMeta } from '@/store/files/types'
import type { SpoolmanRemainingFilamentUnit } from '@/store/config/types'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { useVuetify } from '@/composables/useVuetify'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStateMixin } from '@/composables/useStateMixin'
import { useRoute, useRouter } from 'vue-router/composables'

type SpoolWithAfcLoadedLane = Spool & {
  afc_loaded_lane?: string
}

const { typedState, typedGetters, typedCommit, typedDispatch } = useStore()
const confirm = useConfirm()
const { t, tc } = useI18n()
const vuetify = useVuetify()
const { isMobileViewport } = useBrowserMixin()
const { afc, afcLoadedSpools } = useAfcMixin()
const { printerState, sendGcode } = useStateMixin()
const route = useRoute()
const router = useRouter()

const search = ref('')
const selectedSpoolId = ref<number | null>(null)
const cameraScanSource = ref<null | string>(null)
const hasDeviceCamera = ref(false)

onMounted(async () => {
  hasDeviceCamera.value = await QrScanner.hasCamera()
})

const open = computed({
  get: (): boolean => typedState.spoolman.dialog.show,
  set: (val: boolean) => {
    typedCommit('spoolman/setDialogState', {
      ...typedState.spoolman.dialog,
      show: val
    })
  }
})

watch(open, (val) => {
  if (val) {
    if (spoolSelectionOnly.value) {
      selectedSpoolId.value = typedState.spoolman.dialog.selectedSpoolId ?? null
    } else if (targetMacro.value) {
      const macro = typedGetters['macros/getMacroByName'](targetMacro.value)
      selectedSpoolId.value = typeof macro?.variables?.spool_id === 'number'
        ? macro.variables.spool_id
        : null
    } else {
      selectedSpoolId.value = typedState.spoolman.activeSpool
    }

    if (currentFileName.value && currentFile.value == null) {
      SocketActions.serverFilesMetadata(currentFileName.value)
    }

    if (hasDeviceCamera.value && preferDeviceCamera.value) {
      nextTick(() => (cameraScanSource.value = 'device'))
    } else {
      const autoOpenCameraId = autoOpenQRDetectionCamera.value
      if (autoOpenCameraId && typedGetters['webcams/getWebcamById'](autoOpenCameraId)) {
        nextTick(() => (cameraScanSource.value = autoOpenCameraId))
      }
    }
  }
})

const availableSpools = computed((): SpoolWithAfcLoadedLane[] => {
  const spools: Spool[] = typedGetters['spoolman/getAvailableSpools']
  const loadedSpools = afc.value != null ? afcLoadedSpools.value : {}

  return spools
    .filter(x => !x.archived)
    .map(spool => ({
      ...spool,
      afc_loaded_lane: loadedSpools[spool.id]
    } satisfies SpoolWithAfcLoadedLane))
})

const currency = computed((): string | null => typedState.spoolman.currency)

const configurableHeaders = computed((): AppDataTableHeader[] => {
  const afcHeaders: AppDataTableHeader[] = afc.value != null
    ? [
        {
          text: tc('app.afc.LaneLoaded'),
          value: 'afc_loaded_lane',
          cellClass: 'text-no-wrap'
        }
      ]
    : []

  const headers: AppDataTableHeader[] = [
    {
      text: tc('app.spoolman.label.id'),
      value: 'id',
      cellClass: 'text-no-wrap'
    },
    ...afcHeaders,
    {
      text: tc('app.spoolman.label.material'),
      value: 'filament.material',
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.initial_weight'),
      value: 'initial_weight',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.used_weight'),
      value: 'used_weight',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.remaining_weight'),
      value: 'remaining_weight',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.initial_length'),
      value: 'initial_length',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.used_length'),
      value: 'used_length',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.remaining_length'),
      value: 'remaining_length',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.price'),
      value: 'price',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.lot_nr'),
      value: 'lot_nr',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.density'),
      value: 'filament.density',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.diameter'),
      value: 'filament.diameter',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.extruder_temp'),
      value: 'filament.settings_extruder_temp',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.bed_temp'),
      value: 'filament.settings_bed_temp',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.colors'),
      value: 'filament.colors',
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.location'),
      value: 'location',
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.comment'),
      value: 'comment',
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.first_used'),
      value: 'first_used',
      visible: false,
      cellClass: 'text-no-wrap'
    },
    {
      text: tc('app.spoolman.label.last_used'),
      value: 'last_used',
      cellClass: 'text-no-wrap'
    }
  ]

  const mergedTableHeaders: AppDataTableHeader[] = typedGetters['config/getMergedTableHeaders'](headers, 'spoolman')

  return mergedTableHeaders
})

const headers = computed((): DataTableHeader[] => [
  {
    text: tc('app.spoolman.label.filament_name'),
    value: 'filament_name'
  },
  ...configurableHeaders.value
    .filter(header => header.visible !== false)
])

const filename = computed((): string | undefined => {
  const fname: string | undefined = typedState.spoolman.dialog.filename
  if (fname && fname.startsWith('/')) {
    return fname.slice(1)
  }
  return fname
})

const currentFileName = computed((): string =>
  filename.value || typedState.printer.printer.print_stats?.filename || ''
)

const currentFile = computed((): AppFileWithMeta | undefined => {
  const { filename: fname, rootPath } = getFilePaths(currentFileName.value, 'gcodes')
  return typedGetters['files/getFile'](rootPath, fname)
})

const spoolSelectionOnly = computed((): boolean =>
  typedState.spoolman.dialog.spoolSelectionOnly ?? false
)

const targetMacro = computed((): string | undefined =>
  typedState.spoolman.dialog.targetMacro
)

const enabledWebcams = computed((): Moonraker.Webcam.Entry[] =>
  typedGetters['webcams/getEnabledWebcams']
)

const availableCameras = computed((): Pick<Moonraker.Webcam.Entry, 'uid' | 'name'>[] => {
  const cameras: Pick<Moonraker.Webcam.Entry, 'uid' | 'name'>[] = enabledWebcams.value
    .filter(camera => camera.service !== 'iframe')

  if (hasDeviceCamera.value) {
    cameras.unshift({
      name: t('app.spoolman.label.device_camera').toString(),
      uid: 'device'
    })
  }

  return cameras
})

const remainingFilamentUnit = computed((): SpoolmanRemainingFilamentUnit =>
  typedState.config.uiSettings.spoolman.remainingFilamentUnit
)

const spoolmanURL = computed((): string | undefined =>
  typedGetters['spoolman/getSpoolmanUrl']
)

const preferDeviceCamera = computed(() =>
  typedState.config.uiSettings.spoolman.preferDeviceCamera
)

const autoOpenQRDetectionCamera = computed((): string | null =>
  typedState.config.uiSettings.spoolman.autoOpenQRDetectionCamera
)

const autoSelectSpoolOnMatch = computed((): boolean =>
  typedState.config.uiSettings.spoolman.autoSelectSpoolOnMatch
)

const warnOnNotEnoughFilament = computed((): boolean =>
  typedState.config.uiSettings.spoolman.warnOnNotEnoughFilament
)

const warnOnFilamentTypeMismatch = computed((): boolean =>
  typedState.config.uiSettings.spoolman.warnOnFilamentTypeMismatch
)

const sortOrder = computed(() =>
  typedState.config.uiSettings.spoolman.selectionDialogSortOrder
)

function handleQRCodeDetected (id: number) {
  cameraScanSource.value = null
  selectedSpoolId.value = id
  if (
    !availableSpools.value
      .filter(spool => filterResults('', search.value, spool))
      .some(spool => spool.id === id)
  ) {
    // clear filter if selected spool isn't in filter results
    search.value = ''
  }

  if (autoSelectSpoolOnMatch.value) {
    handleSelectSpool()
  }
}

async function handleSelectSpool () {
  if (spoolSelectionOnly.value) {
    // save selection for parent dialog
    typedCommit('spoolman/setDialogState', {
      show: false,
      selectedSpoolId: selectedSpoolId.value ?? undefined
    })
    return
  }

  if (!selectedSpoolId.value) {
    // no spool selected
    const confirmation = await confirm(
      tc('app.spoolman.msg.no_spool'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
    )

    if (!confirmation) {
      return
    }
  }

  if (targetMacro.value) {
    // no need to run sanity checks or start a print when we target a macro, so we return early

    // set spool_id via SET_GCODE_VARIABLE
    const commands = [
      `SET_GCODE_VARIABLE MACRO=${targetMacro.value} VARIABLE=spool_id VALUE=${selectedSpoolId.value ?? 'None'}`
    ]

    const printerConfig: Klipper.ConfigState = typedGetters['printer/getPrinterConfig']
    const supportsSaveVariables = printerConfig.save_variables
    if (supportsSaveVariables) {
      // persist selected spool across restarts
      commands.push(`SAVE_VARIABLE VARIABLE=${targetMacro.value.toLowerCase()}__spool_id VALUE=${selectedSpoolId.value ?? 'None'}`)
    }

    sendGcode(commands.join('\n'))

    const macro = typedGetters['macros/getMacroByName'](targetMacro.value)
    if (macro?.variables?.active) {
      // selected tool is active, update active spool
      await SocketActions.serverSpoolmanPostSpoolId(selectedSpoolId.value ?? undefined)
    }

    open.value = false
    return
  }

  const spool = availableSpools.value.find(spool => spool.id === selectedSpoolId.value)
  if (spool && currentFileName.value && (warnOnFilamentTypeMismatch.value || warnOnNotEnoughFilament.value)) {
    // trigger sanity checks when we have an active file
    // (current print or new print) and sanity checks are enabled.

    if (currentFile.value && (filename.value || !['complete', 'cancelled'].includes(printerState.value))) {
      // if we're tracking a file and starting a new print or the current one hasn't ended yet

      if (warnOnFilamentTypeMismatch.value) {
        const fileMaterials = currentFile.value.filament_type?.map(x => x.toLowerCase())
        const spoolMaterial = spool.filament.material?.toLowerCase()

        if (spoolMaterial && fileMaterials && !fileMaterials.includes(spoolMaterial)) {
          // filament materials don't match
          const confirmation = await confirm(
            tc('app.spoolman.msg.mismatched_filament'),
            { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
          )

          if (!confirmation) {
            return
          }
        }
      }

      let requiredLength = currentFile.value?.filament_total
      if (requiredLength && ['printing', 'paused'].includes(printerState.value)) {
        // if we're currently running a print job, subtract the already printed amount from the required length
        requiredLength -= typedState.printer.printer.print_stats?.filament_used ?? 0
        requiredLength = Math.max(requiredLength, 0)
      }

      if (!requiredLength) {
        // missing file metadata
        const confirmation = await confirm(
          tc('app.spoolman.msg.no_required_length'),
          { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
        )

        if (!confirmation) {
          return
        }
      } else if (warnOnNotEnoughFilament.value) {
        if (spool.remaining_length != null && requiredLength >= spool.remaining_length) {
          // not enough filament
          const confirmation = await confirm(
            tc('app.spoolman.msg.no_filament'),
            { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
          )

          if (!confirmation) {
            return
          }
        }
      }
    }
  }

  await SocketActions.serverSpoolmanPostSpoolId(selectedSpoolId.value ?? undefined)

  if (filename.value) {
    await SocketActions.printerPrintStart(filename.value)

    if (route.name !== 'home') {
      router.push({ name: 'home' })
    }
  }

  open.value = false
}

function filterResults (value: string, query: string, item: Spool): boolean {
  query = query.toLowerCase()
  return [item.id, item.comment, item.filament.name, item.filament.material, item.filament.vendor?.name]
    .some(val => val?.toString().toLowerCase().includes(query))
}

function handleSortOrderKeyChange (value?: string) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.spoolman.selectionDialogSortOrder.key',
    value: value ?? null,
    server: true
  })
}

function handleSortOrderDescChange (value?: boolean) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.spoolman.selectionDialogSortOrder.desc',
    value: value ?? null,
    server: true
  })
}

function getSpoolColor (spool?: Spool) {
  return spool?.filament.color_hex ?? (vuetify.theme.dark ? '#fff' : '#000')
}
</script>

<style lang="scss" scoped>
  .file-system,
  .file-system :deep(.v-data-table) {
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;
  }
</style>

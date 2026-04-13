<template>
  <div>
    <v-subheader id="general">
      {{ $t('app.setting.title.general') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting :title="$t('app.setting.label.printer_name')">
        <app-text-field
          filled
          dense
          single-line
          hide-details="auto"
          :rules="[
            Rules.required
          ]"
          :value="instanceName"
          :default-value="$globals.APP_NAME"
          submit-on-change
          @submit="setInstanceName"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.language')">
        <v-select
          filled
          dense
          single-line
          hide-details="auto"
          :items="supportedLocales"
          :value="locale"
          item-text="name"
          item-value="code"
          @change="setLocale"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.date_format')">
        <v-select
          v-model="dateFormat"
          filled
          dense
          hide-details="auto"
          :items="availableDateFormats"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.time_format')">
        <v-select
          v-model="timeFormat"
          filled
          dense
          hide-details="auto"
          :items="availableTimeFormats"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.keyboard_shortcuts')"
        :sub-title="$t('app.setting.tooltip.keyboard_shortcuts')"
      >
        <v-switch
          v-model="enableKeyboardShortcuts"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.confirm_on_estop')">
        <v-switch
          v-model="confirmOnEstop"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.show_upload_and_print')">
        <v-switch
          v-model="showUploadAndPrint"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.printer_power_device')">
        <v-select
          v-model="printerPowerDevice"
          filled
          dense
          single-line
          hide-details="auto"
          :items="printerPowerDevicesList"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.power_toggle_in_top_nav')">
        <v-select
          v-model="topNavPowerToggle"
          filled
          dense
          single-line
          hide-details="auto"
          :items="topNavPowerToggleDevicesList"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.confirm_on_power_device_change')">
        <v-switch
          v-model="confirmOnPowerDeviceChange"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.show_save_config_and_restart')">
        <v-switch
          v-model="showSaveConfigAndRestart"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <template v-if="showSaveConfigAndRestart">
        <v-divider />

        <app-setting :title="$t('app.setting.label.confirm_on_save_config_and_restart')">
          <v-switch
            v-model="confirmOnSaveConfigAndRestart"
            hide-details
            @click.native.stop
          />
        </app-setting>
      </template>

      <template v-if="showSaveConfigAndRestart && confirmOnSaveConfigAndRestart">
        <v-divider />

        <app-setting :title="$t('app.setting.label.sections_to_ignore_pending_configuration_changes')">
          <v-combobox
            v-model="sectionsToIgnorePendingConfigurationChanges"
            :items="['bed_mesh default', 'bed_tilt']"
            filled
            dense
            hide-selected
            hide-details="auto"
            multiple
            small-chips
            append-icon=""
            deletable-chips
          />
        </app-setting>
      </template>

      <v-divider />

      <app-setting :title="$t('app.setting.label.print_in_progress_layout')">
        <v-select
          v-model="printInProgressLayout"
          filled
          dense
          hide-details="auto"
          :items="availablePrintInProgressLayouts"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.print_progress_calculation')"
        :sub-title="$t('app.setting.tooltip.average_calculation')"
      >
        <v-select
          v-model="printProgressCalculation"
          multiple
          filled
          dense
          hide-details="auto"
          :rules="[
            Rules.lengthGreaterThanOrEqual(1),
          ]"
          :items="availablePrintProgressCalculation"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.print_eta_calculation')"
        :sub-title="$t('app.setting.tooltip.average_calculation')"
      >
        <v-select
          v-model="printEtaCalculation"
          multiple
          filled
          dense
          hide-details="auto"
          :rules="[
            Rules.lengthGreaterThanOrEqual(1),
          ]"
          :items="availablePrintEtaCalculation"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.enable_diagnostics')"
        :sub-title="$t('app.setting.tooltip.diagnostics_performance')"
      >
        <v-switch
          v-model="enableDiagnostics"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.fluidd_settings_in_moonraker_db')">
        <app-btn
          outlined
          small
          color="primary"
          class="mr-2"
          @click="handleBackupSettings"
        >
          {{ $t('app.setting.btn.backup') }}
        </app-btn>

        <app-btn
          outlined
          small
          color="primary"
          @click="uploadSettingsFile?.click()"
        >
          {{ $t('app.setting.btn.restore') }}
        </app-btn>
      </app-setting>
    </v-card>

    <input
      ref="uploadSettingsFile"
      type="file"
      :accept="isIOS ? undefined : '.json'"
      style="display: none"
      @change="handleRestoreSettings"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SupportedLocales, DateFormats, TimeFormats } from '@/globals'
import type { OutputPin } from '@/store/printer/types'
import type { PrintEtaCalculation, PrintInProgressLayout, PrintProgressCalculation } from '@/store/config/types'
import { SocketActions } from '@/api/socketActions'
import { consola } from 'consola'
import { readFileAsTextAsync } from '@/util/file-system-entry'
import { EventBus } from '@/eventBus'
import { isFluiddContent, toFluiddContent } from '@/util/fluidd-content'
import { getAllLocales } from '@/plugins/i18n'
import downloadUrl from '@/util/download-url'
import { useStore } from '@/composables/useStore'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useI18n } from '@/composables/useI18n'
import { Filters, Rules } from '@/plugins/filters'

const { typedState, typedGetters, typedDispatch } = useStore()
const { isIOS } = useBrowserMixin()
const { t, tc } = useI18n()

const uploadSettingsFile = ref<HTMLInputElement>()

const instanceName = computed(() => typedState.config.uiSettings.general.instanceName)

function setInstanceName (value: string) {
  typedDispatch('config/updateInstance', value)
}

const locale = computed(() => typedState.config.uiSettings.general.locale)

const supportedLocales = computed(() => [
  { name: 'Browser default', code: 'default' },
  ...SupportedLocales
])

function setLocale (value: string) {
  typedDispatch('config/onLocaleChange', value)
}

const dateFormat = computed({
  get: () => typedState.config.uiSettings.general.dateFormat,
  set: (value: string) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.dateFormat',
    value,
    server: true
  })
})

const availableDateFormats = computed(() => {
  const date = new Date()

  return Object.entries(DateFormats)
    .map(([key, entry]) => ({
      value: key,
      text: `${date.toLocaleDateString(entry.locales ?? getAllLocales(), entry.options)}${entry.suffix ?? ''}`
    }))
})

const timeFormat = computed({
  get: () => typedState.config.uiSettings.general.timeFormat,
  set: (value: string) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.timeFormat',
    value,
    server: true
  })
})

const availableTimeFormats = computed(() => {
  const date = new Date()

  return Object.entries(TimeFormats)
    .map(([key, entry]) => ({
      value: key,
      text: `${date.toLocaleTimeString(entry.locales ?? getAllLocales(), entry.options)}${entry.suffix ?? ''}`
    }))
})

const enableKeyboardShortcuts = computed({
  get: () => typedState.config.uiSettings.general.enableKeyboardShortcuts,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.enableKeyboardShortcuts',
    value,
    server: true
  })
})

const confirmOnEstop = computed({
  get: () => typedState.config.uiSettings.general.confirmOnEstop,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.confirmOnEstop',
    value,
    server: true
  })
})

const printerPowerDevice = computed({
  get: () => typedState.config.uiSettings.general.printerPowerDevice,
  set: (value: string | null) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.printerPowerDevice',
    value,
    server: true
  })
})

const printerPowerDevicesList = computed(() => {
  const devices: Moonraker.Power.Device[] = typedGetters['power/getDevices']

  const deviceEntries = devices.map(device => ({
    text: `${Filters.prettyCase(device.device)} (${device.type})`,
    value: device.device
  }))

  const autoDeviceName = devices.some(device => device.device.toLowerCase() === 'printer')
    ? 'Printer'
    : tc('app.setting.label.none')

  return [
    {
      text: `${tc('app.setting.label.auto')} (${autoDeviceName})`,
      value: null
    },
    ...deviceEntries
  ]
})

const topNavPowerToggle = computed({
  get: () => typedState.config.uiSettings.general.topNavPowerToggle,
  set: (value: string | null) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.topNavPowerToggle',
    value,
    server: true
  })
})

const topNavPowerToggleDevicesList = computed(() => {
  const devices: Moonraker.Power.Device[] = typedGetters['power/getDevices']
  const deviceEntries = devices.length
    ? [
        { header: 'Moonraker' },
        ...devices.map(device => ({
          text: `${Filters.prettyCase(device.device)} (${device.type})`,
          value: device.device
        }))
      ]
    : []

  const pins: OutputPin[] = typedGetters['printer/getAllPins']
  const pinEntries = pins.length
    ? [
        { header: 'Klipper' },
        ...pins.map(outputPin => ({
          text: outputPin.prettyName,
          value: `${outputPin.name}:klipper`
        }))
      ]
    : []

  return [
    {
      text: tc('app.setting.label.none'),
      value: null
    },
    ...deviceEntries,
    ...pinEntries
  ]
})

const confirmOnPowerDeviceChange = computed({
  get: () => typedState.config.uiSettings.general.confirmOnPowerDeviceChange,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.confirmOnPowerDeviceChange',
    value,
    server: true
  })
})

const showSaveConfigAndRestart = computed({
  get: () => typedState.config.uiSettings.general.showSaveConfigAndRestart,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showSaveConfigAndRestart',
    value,
    server: true
  })
})

const showUploadAndPrint = computed({
  get: () => typedState.config.uiSettings.general.showUploadAndPrint,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showUploadAndPrint',
    value,
    server: true
  })
})

const confirmOnSaveConfigAndRestart = computed({
  get: () => typedState.config.uiSettings.general.confirmOnSaveConfigAndRestart,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.confirmOnSaveConfigAndRestart',
    value,
    server: true
  })
})

const sectionsToIgnorePendingConfigurationChanges = computed({
  get: () => typedState.config.uiSettings.general.sectionsToIgnorePendingConfigurationChanges,
  set: (value: string[]) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.sectionsToIgnorePendingConfigurationChanges',
    value: [...new Set(value)].sort((a, b) => a.localeCompare(b)),
    server: true
  })
})

const printInProgressLayout = computed({
  get: () => typedState.config.uiSettings.general.printInProgressLayout as PrintInProgressLayout,
  set: (value: PrintInProgressLayout) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.printInProgressLayout',
    value,
    server: true
  })
})

const availablePrintInProgressLayouts = computed(() => [
  {
    value: 'default',
    text: t('app.general.label.default')
  },
  {
    value: 'compact',
    text: t('app.general.label.compact')
  }
])

const availablePrintProgressCalculation = computed(() => [
  {
    value: 'file',
    text: t('app.setting.timer_options.relative_file_position')
  },
  {
    value: 'fileAbsolute',
    text: t('app.setting.timer_options.absolute_file_position')
  },
  {
    value: 'slicer',
    text: t('app.setting.timer_options.slicer_m73')
  },
  {
    value: 'filament',
    text: t('app.setting.timer_options.filament')
  }
])

const printProgressCalculation = computed({
  get: () => typedState.config.uiSettings.general.printProgressCalculation as PrintProgressCalculation[],
  set: (value: PrintProgressCalculation[]) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.printProgressCalculation',
    value,
    server: true
  })
})

const availablePrintEtaCalculation = computed(() => [
  {
    value: 'file',
    text: t('app.setting.timer_options.file')
  },
  {
    value: 'slicer',
    text: t('app.setting.timer_options.slicer')
  }
])

const printEtaCalculation = computed({
  get: () => typedState.config.uiSettings.general.printEtaCalculation as PrintEtaCalculation[],
  set: (value: PrintEtaCalculation[]) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.printEtaCalculation',
    value,
    server: true
  })
})

const enableDiagnostics = computed({
  get: () => typedState.config.uiSettings.general.enableDiagnostics,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.enableDiagnostics',
    value,
    server: true
  })
})

async function handleBackupSettings () {
  try {
    const response = await SocketActions.serverDatabaseGetItem()

    const data = response.value

    if (data) {
      const backupData = toFluiddContent('settings-backup', data)
      const backupDataAsString = JSON.stringify(backupData)

      const filename = `backup-fluidd-v${import.meta.env.VERSION}-${instanceName.value}.json`
      const url = `data:text/plain;charset=utf-8,${encodeURIComponent(backupDataAsString)}`

      downloadUrl(filename, url)
    }
  } catch (e) {
    consola.error('[Settings] backup failed', e)

    EventBus.$emit(t('app.general.msg.fluidd_settings_backup_failed').toString(), { type: 'error' })
  }
}

async function handleRestoreSettings () {
  try {
    if (uploadSettingsFile.value?.files?.length === 1) {
      const backupDataAsString = await readFileAsTextAsync(uploadSettingsFile.value.files[0])

      if (backupDataAsString) {
        const backupData = JSON.parse(backupDataAsString)

        if (
          !isFluiddContent<Record<string, unknown>>('settings-backup', backupData)
        ) {
          EventBus.$emit(t('app.general.msg.not_valid_fluidd_backup_file').toString(), { type: 'error' })

          return
        }

        for (const key in backupData.data) {
          await SocketActions.serverDatabasePostItem(key, backupData.data[key])
        }

        window.location.reload()
      }
    }
  } catch (e) {
    consola.error('[Settings] restore failed', e)

    EventBus.$emit(t('app.general.msg.fluidd_settings_restore_failed').toString(), { type: 'error' })
  } finally {
    if (uploadSettingsFile.value) {
      uploadSettingsFile.value.value = ''
    }
  }
}
</script>

<template>
  <v-app-bar
    app
    clipped-left
    :extension-height="46 * (isMobileViewport ? 3 : 2)"
    :color="$vuetify.theme.currentTheme.appbar"
    :height="$globals.HEADER_HEIGHT"
  >
    <router-link
      v-if="!isMobileViewport"
      :to="{ name: 'home' }"
      class="toolbar-logo"
    >
      <app-icon />
    </router-link>

    <div class="toolbar-title">
      <app-btn
        v-if="isMobileViewport"
        icon
        text
        @click="$emit('navdrawer')"
      >
        <v-icon>$menuAlt</v-icon>
      </app-btn>

      <v-toolbar-title class="printer-title text--secondary">
        <router-link
          v-safe-html="instanceName"
          :to="{ name: 'home' }"
        />
      </v-toolbar-title>
    </div>

    <!-- <v-spacer /> -->

    <div class="toolbar-supplemental">
      <div v-if="socketConnected && authenticated && klippyReady && showSaveConfigAndRestartForPendingChanges">
        <app-save-config-and-restart-btn
          :loading="hasWait(Waits.onSaveConfig)"
          :disabled="printerPrinting || printerPaused"
          @click="saveConfigAndRestart"
        />
      </div>

      <div v-if="socketConnected && authenticated && !isMobileViewport">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <app-btn
              :disabled="!klippyReady"
              v-bind="attrs"
              class="mx-1"
              color=""
              v-on="on"
              @click="emergencyStop()"
            >
              <v-icon color="error">
                $estop
              </v-icon>
            </app-btn>
          </template>
          <span>
            {{ $t('app.general.tooltip.estop') }}
            <template v-if="enableKeyboardShortcuts">
              <br>
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>e</kbd>
            </template>
          </span>
        </v-tooltip>
      </div>

      <div v-if="socketConnected && authenticated && showUploadAndPrint">
        <app-upload-and-print-btn
          :disabled="printerPrinting || printerPaused || !klippyReady"
          @upload="handleUploadAndPrint"
        />
      </div>

      <div v-if="socketConnected && authenticated && topNavPowerToggle">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <app-btn
              icon
              text
              :disabled="topNavPowerDeviceDisabled"
              v-bind="attrs"
              v-on="on"
              @click="handlePowerToggle()"
            >
              <v-icon>
                {{ topNavPowerDeviceOn ? '$powerOn' : '$powerOff' }}
              </v-icon>
            </app-btn>
          </template>
          <span>{{ $t(`app.general.label.turn_device_${topNavPowerDeviceOn ? 'off' : 'on'}`, { device: topNavPowerToggle.name }) }}</span>
        </v-tooltip>
      </div>

      <div v-if="socketConnected && authenticated">
        <app-notification-menu />
      </div>

      <div v-if="socketConnected && authenticated && supportsAuth">
        <app-user-menu @change-password="userPasswordDialogOpen = true" />
      </div>

      <app-btn
        icon
        text
        @click="$emit('toolsdrawer')"
      >
        <v-icon>$menu</v-icon>
      </app-btn>
    </div>

    <template
      v-if="inLayout"
      #extension
    >
      <v-container>
        <div class="d-flex justify-center ma-2">
          <v-chip
            v-if="currentUser"
            class="mx-1"
            label
          >
            <v-icon left>
              $account
            </v-icon>
            {{ currentUser.username }}
          </v-chip>
          <v-chip
            class="mx-1"
            label
          >
            <v-icon left>
              $screenshot
            </v-icon>
            {{ currentBreakpoint.toUpperCase() }}
          </v-chip>
        </div>
        <div class="d-flex justify-center ma-2">
          <app-btn-group class="mx-1">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <app-btn
                  small
                  v-bind="attrs"
                  color="primary"
                  @click.stop="handleExitLayout"
                  v-on="on"
                >
                  <v-icon left>
                    $close
                  </v-icon>
                  {{ $t('app.general.btn.exit_layout') }}
                </app-btn>
              </template>
              <span>{{ $t('app.general.tooltip.exit_layout') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <app-btn
                  small
                  v-bind="attrs"
                  color="primary"
                  @click.stop="handleResetLayout"
                  v-on="on"
                >
                  <v-icon left>
                    $accountSettings
                  </v-icon>
                  {{ $t('app.general.btn.reset_layout') }}
                </app-btn>
              </template>
              <span>{{ $t('app.general.tooltip.reset_layout') }}</span>
            </v-tooltip>
          </app-btn-group>

          <app-btn-group
            v-if="isDashboard"
            class="mx-1"
          >
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <app-btn
                  small
                  v-bind="attrs"
                  color="primary"
                  @click.stop="handleSetDefaultLayout"
                  v-on="on"
                >
                  <v-icon left>
                    $saveDefault
                  </v-icon>
                  {{ $t('app.general.btn.set_default_layout') }}
                </app-btn>
              </template>
              <span>{{ $t('app.general.tooltip.set_default_layout') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <app-btn
                  small
                  v-bind="attrs"
                  color="primary"
                  @click.stop="handleResetDefaultLayout"
                  v-on="on"
                >
                  <v-icon left>
                    $resetDefaults
                  </v-icon>
                  {{ $t('app.general.btn.reset_default_layout') }}
                </app-btn>
              </template>
              <span>{{ $t('app.general.tooltip.reset_default_layout') }}</span>
            </v-tooltip>
          </app-btn-group>
        </div>
      </v-container>
    </template>

    <user-password-dialog
      v-if="userPasswordDialogOpen"
      v-model="userPasswordDialogOpen"
    />

    <pending-changes-dialog
      v-if="pendingChangesDialogOpen"
      v-model="pendingChangesDialogOpen"
      @save="saveConfigAndRestart(true)"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UserPasswordDialog from '@/components/settings/auth/UserPasswordDialog.vue'
import PendingChangesDialog from '@/components/settings/PendingChangesDialog.vue'
import AppSaveConfigAndRestartBtn from './AppSaveConfigAndRestartBtn.vue'
import AppUploadAndPrintBtn from './AppUploadAndPrintBtn.vue'
import { defaultState } from '@/store/layout/state'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { useVuetify } from '@/composables/useVuetify'
import { SocketActions } from '@/api/socketActions'
import { Waits } from '@/globals'
import { Filters } from '@/plugins/filters'
import type { OutputPin } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'
import type { AppUser } from '@/store/auth/types'
import { useRoute } from 'vue-router/composables'

defineEmits<{
  (e: 'navdrawer'): void
  (e: 'toolsdrawer'): void
}>()

const { hasWait, sendGcode, emergencyStop, klippyReady, socketConnected, authenticated, printerPrinting, printerPaused } = useStateMixin()
const { uploadFile } = useFilesMixin()
const { isMobileViewport } = useBrowserMixin()
const { typedGetters, typedState, typedCommit, typedDispatch } = useStore()
const confirm = useConfirm()
const { tc } = useI18n()
const vuetify = useVuetify()
const route = useRoute()

const userPasswordDialogOpen = ref(false)
const pendingChangesDialogOpen = ref(false)

const supportsAuth = computed<boolean>(() => typedGetters['server/componentSupport']('authorization'))

const instanceName = computed<string>(() => typedState.config.uiSettings.general.instanceName)

const saveConfigPending = computed<boolean>(() => typedGetters['printer/getSaveConfigPending'])

const saveConfigPendingItems = computed<Klipper.ConfigState>(() => typedGetters['printer/getSaveConfigPendingItems'])

const showSaveConfigAndRestartForPendingChanges = computed<boolean>(() => {
  if (!showSaveConfigAndRestart.value || !saveConfigPending.value) {
    return false
  }

  const sectionsToIgnore = sectionsToIgnorePendingConfigurationChanges.value

  return (
    sectionsToIgnore.length === 0 ||
    Object.keys(saveConfigPendingItems.value)
      .filter(key => !sectionsToIgnore.includes(key))
      .length > 0
  )
})

const devicePowerComponentEnabled = computed<boolean>(() => typedGetters['server/componentSupport']('power'))

const inLayout = computed<boolean>(() => typedState.config.layoutMode)

const showSaveConfigAndRestart = computed<boolean>(() => typedState.config.uiSettings.general.showSaveConfigAndRestart)

const sectionsToIgnorePendingConfigurationChanges = computed<string[]>(
  () => typedState.config.uiSettings.general.sectionsToIgnorePendingConfigurationChanges
)

const showUploadAndPrint = computed<boolean>(() => typedState.config.uiSettings.general.showUploadAndPrint)

const topNavPowerToggle = computed(() => {
  const topNavPowerToggle: string | null = typedState.config.uiSettings.general.topNavPowerToggle

  if (!topNavPowerToggle) return null

  const [name, type] = topNavPowerToggle.split(':')

  switch (type) {
    case 'klipper': {
      const device: OutputPin | undefined = typedGetters['printer/getPinByName'](name)

      if (!device) return null

      return {
        type,
        name: device?.prettyName ?? name,
        device
      }
    }

    default: {
      const device: Moonraker.Power.Device | undefined = typedGetters['power/getDeviceByName'](topNavPowerToggle)

      if (!device) return null

      return {
        type: 'moonraker' as const,
        name: Filters.prettyCase(topNavPowerToggle),
        device
      }
    }
  }
})

const topNavPowerDeviceOn = computed<boolean>(() => {
  const { type, device } = topNavPowerToggle.value || {}

  if (!device) return false

  switch (type) {
    case 'moonraker':
      return device.status === 'on'

    case 'klipper':
      return device.value !== 0
  }

  return false
})

const topNavPowerDeviceDisabled = computed<boolean>(() => {
  const { type, device } = topNavPowerToggle.value || {}

  if (!device) return true

  switch (type) {
    case 'moonraker':
      return (printerPrinting.value && device.locked_while_printing) || ['init', 'error'].includes(device.status) || (!devicePowerComponentEnabled.value)

    case 'klipper':
      return !klippyReady.value
  }

  return true
})

const enableKeyboardShortcuts = computed<boolean>(() => typedState.config.uiSettings.general.enableKeyboardShortcuts)

function handleExitLayout () {
  typedCommit('config/setLayoutMode', false)
}

const isDashboard = computed(() => route.name === 'home')

function handleResetLayout () {
  const pathLayouts = [
    'diagnostics'
  ]

  const pathLayout = pathLayouts.includes(route.name ?? '')
    ? route.name
    : undefined
  const layoutDefaultState = pathLayout
    ? defaultState().layouts[pathLayout]
    : typedGetters['layout/getLayout']('dashboard')!

  const toReset = pathLayout ?? typedGetters['layout/getSpecificLayoutName']

  typedDispatch('layout/onLayoutChange', {
    name: toReset,
    value: layoutDefaultState
  })
}

const currentLayoutName = computed(() => typedGetters['layout/getSpecificLayoutName'])

const currentUser = computed<AppUser | null>(() => typedState.auth.currentUser)

const currentBreakpoint = computed(() => vuetify.framework.breakpoint.name)

function handleSetDefaultLayout () {
  typedDispatch('layout/onLayoutChange', {
    name: 'dashboard',
    value: typedGetters['layout/getLayout'](currentLayoutName.value)!
  })
}

function handleResetDefaultLayout () {
  typedDispatch('layout/onLayoutChange', {
    name: 'dashboard',
    value: defaultState().layouts.dashboard
  })
}

async function handlePowerToggle () {
  const { type, device } = topNavPowerToggle.value || {}

  if (!device) return

  const confirmOnPowerDeviceChange: boolean = typedState.config.uiSettings.general.confirmOnPowerDeviceChange

  const result = (
    !confirmOnPowerDeviceChange ||
    await confirm(
      tc('app.general.simple_form.msg.confirm_power_device_toggle'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    switch (type) {
      case 'moonraker': {
        const state = (device.status === 'on') ? 'off' : 'on'
        SocketActions.machineDevicePowerSetDevice(device.device, state)
        break
      }

      case 'klipper': {
        const value = (device.value !== 0) ? 0 : device.scale
        sendGcode(`SET_PIN PIN=${encodeGcodeParamValue(device.name)} VALUE=${value}`, `${Waits.onSetOutputPin}${device.name}`)
        break
      }
    }
  }
}

function handleUploadAndPrint (file: File) {
  uploadFile(file, '/', 'gcodes', true)
}

function saveConfigAndRestart (force = false) {
  if (!force) {
    const confirmOnSaveConfigAndRestart: boolean = typedState.config.uiSettings.general.confirmOnSaveConfigAndRestart

    if (confirmOnSaveConfigAndRestart) {
      pendingChangesDialogOpen.value = true

      return
    }
  }

  sendGcode('SAVE_CONFIG', Waits.onSaveConfig)
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  .toolbar-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: inherit;
  }

  .theme--dark .toolbar-logo {
    border-right: thin solid rgba(map-get($shades, 'white'), 0.12);
    background-color: #28282b;
  }

  .theme--light .toolbar-logo {
    border-right: thin solid rgba(map-get($shades, 'black'), 0.12);
    background-color: #FFFFFF;
  }

  .toolbar-title {
    display: flex;
    flex: 1 1;
    max-width: 50%;
    height: inherit;
    align-items: center;
    padding-left: 16px;
  }

  .toolbar-supplemental {
    display: flex;
    justify-content: flex-end;
    flex: 0 0 50%;
    max-width: 50%;
    align-items: center;
    height: inherit;
  }

  .printer-title {
    font-size: 1.25rem;
    font-weight: 300;
    font-family: raleway, sans-serif;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    @media #{map-get($display-breakpoints, 'sm-and-up')} {
      font-size: 1.875rem;
    }
  }

  .printer-title > a {
    color: inherit;
    text-decoration: none;
  }

  .v-toolbar--extended :deep(.v-toolbar__content) {
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
  }

  :deep(.v-toolbar__extension) {
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  :deep(.v-toolbar__content) {
    padding-left: 0;
  }

  .v-btn.v-btn--disabled.v-btn--has-bg.bg-transparent {
    background: none !important;
  }
</style>

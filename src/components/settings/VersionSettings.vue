<template>
  <div>
    <v-subheader id="versions">
      {{ t('app.version.title') }}
      <!-- <v-icon small color="info" class="ml-2" v-if="hasUpdates">$warning</v-icon> -->
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          class="mr-2"
          :disabled="!hasUpdates || hasInvalidComponent || isRefreshing || printerPrinting"
          @click="handleUpdateComponent('all')"
        >
          <v-icon left>
            $download
          </v-icon>
          {{ t('app.version.btn.update_all') }}
        </app-btn>

        <app-btn
          outlined
          small
          color="primary"
          :disabled="isRefreshing || printerPrinting"
          @click="forceCheck()"
        >
          <v-icon
            left
            :class="{ 'spin-alt': isRefreshing }"
          >
            $refresh
          </v-icon>
          {{ t('app.version.btn.check_for_updates') }}
        </app-btn>
      </app-setting>

      <v-divider />

      <app-setting
        :title="t('app.setting.label.enable_notifications')"
      >
        <v-switch
          v-model="enableNotifications"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <template v-for="(component, i) in components">
        <app-setting :key="`component-${component.name}-${i}`">
          <template #title>
            {{ packageTitle(component) }}
            <v-tooltip
              v-if="'remote_url' in component && component.remote_url !== '?'"
              bottom
            >
              <template #activator="{ attrs, on }">
                <a
                  v-bind="attrs"
                  :href="component.remote_url"
                  target="_blank"
                  v-on="on"
                >
                  <v-icon
                    small
                    right
                  >
                    $openInNew
                  </v-icon>
                </a>
              </template>
              <span>{{ component.remote_url }}</span>
            </v-tooltip>
          </template>

          <template #sub-title>
            <span v-if="'full_version_string' in component">
              {{ component.full_version_string }}
            </span>
            <span v-else-if="'version' in component">
              {{ component.version }}
            </span>

            <span v-if="'remote_version' in component && hasUpdate(component.name)">
              -> {{ component.remote_version }}
            </span>
            <span v-if="'package_count' in component && component.package_count > 0">
              {{ tc('app.version.label.packages', component.package_count) }}
            </span>
          </template>

          <v-tooltip
            v-if="hasUpdate(component.name)"
            left
          >
            <template #activator="{ attrs, on }">
              <app-btn
                v-bind="attrs"
                color="primary"
                icon
                small
                @click="handleInformationDialog(component)"
                v-on="on"
              >
                <v-icon small>
                  $info
                </v-icon>
              </app-btn>
            </template>
            <span v-if="'name' in component && component.name !== 'system'">{{ t('app.version.tooltip.release_notes') }}</span>
            <span v-else-if="'commits_behind' in component">{{ t('app.version.tooltip.commit_history') }}</span>
            <span v-else-if="'package_list' in component">{{ t('app.version.tooltip.packages') }}</span>
          </v-tooltip>

          <version-status
            :has-update="hasUpdate(component.name)"
            :disabled="isRefreshing || printerPrinting"
            :loading="isRefreshing"
            :dirty="isDirty(component)"
            :valid="isValid(component)"
            @on-update="handleUpdateComponent(component.name)"
            @on-recover="handleRecoverComponent(component)"
          />
        </app-setting>

        <template v-if="'warnings' in component">
          <v-alert
            v-for="(warning, index) in component.warnings ?? []"
            :key="`warning-${component.name}-${index}`"
            dense
            type="warning"
            text
            class="mx-4"
          >
            {{ warning }}
          </v-alert>
        </template>

        <template v-if="'anomalies' in component">
          <v-alert
            v-for="(anomaly, index) in component.anomalies ?? []"
            :key="`anomaly-${component.name}-${index}`"
            dense
            icon="$info"
            text
            class="mx-4"
          >
            {{ anomaly }}
          </v-alert>
        </template>

        <v-divider
          v-if="i < components.length - 1 && components.length > 0"
          :key="`component-${component.name}-${i}-_divider`"
        />
      </template>
    </v-card>

    <version-commit-history-dialog
      v-if="informationDialogState.open"
      v-model="informationDialogState.open"
      :component="informationComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useStateMixin } from '@/composables/useStateMixin'
import { SocketActions } from '@/api/socketActions'
import { Waits } from '@/globals'
import VersionStatus from './VersionStatus.vue'
import VersionCommitHistoryDialog from './VersionInformationDialog.vue'
import type { VersionInfo } from '@/store/version/types'

const { typedState, typedGetters, typedDispatch } = useStore()
const { t, tc } = useI18n()
const { printerPrinting, hasWait } = useStateMixin()

const informationComponent = computed<VersionInfo>(() => informationDialogState.component as VersionInfo)
const informationDialogState = reactive<{ open: boolean; component: VersionInfo | null }>({
  open: false,
  component: null
})

const components = computed((): VersionInfo[] => typedGetters['version/getVisibleComponents'])

const isRefreshing = computed(() => hasWait(Waits.onVersionRefresh))

const hasUpdates = computed(() => typedGetters['version/hasUpdates'])

const hasInvalidComponent = computed(() =>
  components.value.some(component => !isValid(component))
)

const enableNotifications = computed({
  get: (): boolean => typedState.config.uiSettings.general.enableVersionNotifications,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.enableVersionNotifications',
      value,
      server: true
    })
  }
})

function packageTitle (component: VersionInfo) {
  if (component.name === 'system') {
    return t('app.version.label.os_packages')
  }
  return component.name
}

function hasUpdate (component: string) {
  return typedGetters['version/hasUpdate'](component)
}

function isDirty (component: VersionInfo) {
  return (
    'is_dirty' in component &&
    component.is_dirty
  )
}

function isValid (component: VersionInfo) {
  return (
    !('is_valid' in component) ||
    component.is_valid
  )
}

function handleUpdateComponent (key: string) {
  typedDispatch('version/onUpdateStatus', { busy: true })

  switch (key) {
    case 'klipper':
      SocketActions.machineUpdateKlipper()
      break
    case 'moonraker':
      SocketActions.machineUpdateMoonraker()
      break
    case 'system':
      SocketActions.machineUpdateSystem()
      break
    case 'all':
      SocketActions.machineUpdateAll()
      break
    default: // assume a client update
      SocketActions.machineUpdateClient(key)
      break
  }
}

function handleRecoverComponent (component: VersionInfo) {
  typedDispatch('version/onUpdateStatus', { busy: true })

  if (isDirty(component)) {
    SocketActions.machineUpdateRecover(component.name, false)
  } else if (!isValid(component)) {
    SocketActions.machineUpdateRecover(component.name, true)
  }
}

function forceCheck () {
  if (typedGetters['server/getIsMinApiVersion']('1.2.0')) {
    SocketActions.machineUpdateRefresh()
  } else {
    SocketActions.machineUpdateStatus(true)
  }
}

function getBaseUrl (component: VersionInfo) {
  if ('remote_url' in component && component.remote_url) {
    return component.remote_url
  }
  if ('owner' in component) {
    return `https://github.com/${component.owner}/${component.repo_name || component.name}`
  }
  return ''
}

function handleInformationDialog (component: VersionInfo) {
  switch (component.configured_type) {
    case 'python':
      if (component.channel === 'dev') {
        window.open(`${getBaseUrl(component)}/compare/${component.current_hash}..${component.remote_hash}`)
      } else {
        window.open(component.changelog_url)
      }
      break

    case 'git_repo':
    case 'system':
      informationDialogState.open = true
      informationDialogState.component = component
      break

    default:
      window.open(`${getBaseUrl(component)}/releases`)
      break
  }
}
</script>

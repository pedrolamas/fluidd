<template>
  <v-alert
    text
    dense
    icon="$warning"
    type="warning"
    class="ma-0"
  >
    <template v-if="printerWarnings.length > 0">
      <div class="mb-2">
        {{ $t('app.general.error.app_warnings_found', { appName }) }}
      </div>
      <ul class="mb-4">
        <li
          v-for="(warning, index) in printerWarnings"
          :key="index"
          v-safe-html="linkExternalUrls(warning)"
        />
      </ul>
    </template>

    <template v-if="klipperWarnings.length > 0">
      <div class="mb-2">
        {{ $t('app.general.error.app_warnings_found', { appName: 'Klipper' }) }}
      </div>
      <ul class="mb-4">
        <li
          v-for="(warning, index) in klipperWarnings"
          :key="index"
          v-safe-html="linkExternalUrls(warning.message)"
        />
      </ul>
    </template>

    <template v-if="moonrakerFailedComponents.length > 0">
      <div class="mb-2">
        {{ $t('app.general.error.failed_components') }}
      </div>
      <ul class="mb-4">
        <li
          v-for="(failedComponent, index) in moonrakerFailedComponents"
          :key="index"
          v-safe-html="linkExternalUrls(failedComponent)"
        />
      </ul>
    </template>

    <template v-if="moonrakerWarnings.length > 0">
      <div class="mb-2">
        {{ $t('app.general.error.app_warnings_found', { appName: 'Moonraker' }) }}
      </div>
      <ul class="mb-4">
        <li
          v-for="(warning, index) in moonrakerWarnings"
          :key="index"
          v-safe-html="linkExternalUrls(warning)"
        />
      </ul>
    </template>

    <div v-if="printerWarnings.length > 0">
      <span v-safe-html="printerWarningsTxt" />
    </div>
    <div v-if="moonrakerFailedComponents.length > 0">
      <span v-safe-html="moonrakerFailedComponentsTxt" />
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Globals } from '@/globals'
import linkExternalUrls from '@/util/link-external-urls'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { typedGetters } = useStore()
const { t } = useI18n()

const appName = Globals.APP_NAME
const docsUrl = Globals.DOCS_REQUIRED_CONFIGURATION
const moonrakerDocsUrl = Globals.DOCS_MOONRAKER_COMPONENTS

const printerWarningsTxt = computed(() => t('app.general.error.app_setup_link', { url: docsUrl }))
const moonrakerFailedComponentsTxt = computed(() => t('app.general.error.components_config', { url: moonrakerDocsUrl }))

const printerWarnings = computed<string[]>(() => typedGetters['printer/getPrinterWarnings'])
const klipperWarnings = computed<Klipper.ConfigFileWarningState[]>(() => typedGetters['printer/getKlipperWarnings'])
const moonrakerFailedComponents = computed<string[]>(() => typedGetters['printer/getMoonrakerFailedComponents'])
const moonrakerWarnings = computed<string[]>(() => typedGetters['printer/getMoonrakerWarnings'])
</script>

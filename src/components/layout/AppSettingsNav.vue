<template>
  <v-list
    dense
    width="180"
    class="grow pt-0"
    :color="($vuetify.theme.dark) ? '#1E1E20' : '#FFFFFF'"
  >
    <template
      v-for="item in items"
    >
      <v-list-item
        v-if="item.visible"
        :key="item.name"
        :to="{ name: 'settings', hash: item.hash }"
        :exact="false"
        link
      >
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { typedState, typedGetters } = useStore()
const { t, tc } = useI18n()

const supportsVersions = computed(() => typedGetters['server/componentSupport']('update_manager'))
const supportsTimelapse = computed(() => typedGetters['server/componentSupport']('timelapse'))
const supportsSpoolman = computed(() => typedGetters['server/componentSupport']('spoolman'))
const supportsMmu = computed(() => typedState.printer.printer.mmu != null)

const items = computed(() => [
  { name: t('app.setting.title.general'), hash: '#general', visible: true },
  { name: t('app.setting.title.warnings'), hash: '#warnings', visible: true },
  { name: t('app.setting.title.theme'), hash: '#theme', visible: true },
  { name: t('app.setting.title.authentication'), hash: '#auth', visible: true },
  { name: t('app.setting.title.console'), hash: '#console', visible: true },
  { name: t('app.setting.title.file_browser'), hash: '#browser', visible: true },
  { name: t('app.setting.title.file_editor'), hash: '#editor', visible: true },
  { name: t('app.setting.title.macros'), hash: '#macros', visible: true },
  { name: tc('app.setting.title.camera', 2), hash: '#camera', visible: true },
  { name: t('app.setting.title.tool'), hash: '#toolhead', visible: true },
  { name: t('app.setting.title.thermal_presets'), hash: '#presets', visible: true },
  { name: t('app.setting.title.gcode_preview'), hash: '#gcodePreview', visible: true },
  { name: t('app.general.title.timelapse'), hash: '#timelapse', visible: supportsTimelapse.value },
  { name: t('app.mmu.title.headline'), hash: '#mmu', visible: supportsMmu.value },
  { name: t('app.spoolman.title.spoolman'), hash: '#spoolman', visible: supportsSpoolman.value },
  { name: t('app.version.title'), hash: '#versions', visible: supportsVersions.value }
])
</script>

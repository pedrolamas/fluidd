<template>
  <div>
    <app-setting :title="t('app.setting.label.title')">
      <v-text-field
        v-model="config.title"
        filled
        dense
        single-line
        hide-details="auto"
        :rules="[
          Rules.required
        ]"
      />
    </app-setting>

    <v-divider />

    <app-setting :title="t('app.setting.label.icon')">
      <v-select
        v-model="config.icon"
        filled
        dense
        single-line
        hide-details="auto"
        :items="icons"
      >
        <template #item="{item}">
          <v-icon
            dense
            color="primary"
          >
            ${{ item.text }}
          </v-icon>
          <span class="ml-2">{{ item.text }}</span>
        </template>
        <template #selection="{item}">
          <v-icon
            color="primary"
          >
            ${{ item.text }}
          </v-icon>
          <span class="ml-2">{{ item.text }}</span>
        </template>
      </v-select>
    </app-setting>

    <v-divider />

    <app-setting :title="t('app.setting.label.height')">
      <v-text-field
        v-model="config.height"
        filled
        dense
        single-line
        hide-details="auto"
        suffix="px"
        :rules="[
          Rules.required,
          Rules.numberGreaterThanOrEqual(1)
        ]"
      />
    </app-setting>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { Rules } from '@/plugins/filters'
import { Icons } from '@/globals'
import type { DiagnosticsCardConfig } from '@/store/diagnostics/types'

const props = defineProps<{
  config: DiagnosticsCardConfig
}>()

const config = reactive<DiagnosticsCardConfig>(JSON.parse(JSON.stringify(props.config)) as DiagnosticsCardConfig)

watch(() => props.config, (v) => Object.assign(config, JSON.parse(JSON.stringify(v)) as DiagnosticsCardConfig), { deep: true })

const { t } = useI18n()

const icons = computed(() => {
  const iconKeys = Object.keys(Icons)
  return iconKeys.sort().map(icon => ({ text: icon, value: icon }))
})
</script>

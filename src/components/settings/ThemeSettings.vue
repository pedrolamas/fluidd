<template>
  <div>
    <v-subheader id="theme">
      {{ t('app.setting.title.theme') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <template #title>
          <span>{{ t('app.setting.label.theme_preset') }}</span>
          <app-inline-help
            bottom
            small
            :tooltip="t('app.setting.tooltip.theme_disclaimer')"
          />
        </template>
        <v-select
          :value="themePreset"
          filled
          dense
          single-line
          hide-details="auto"
          :items="themePresets"
          item-value="icon.src"
          item-text="name"
          return-object
          @change="applyThemePreset"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="t('app.setting.label.primary_color')">
        <app-btn
          outlined
          small
          color="primary"
          class="mr-2"
          @click="handleReset"
        >
          {{ t('app.setting.btn.reset') }}
        </app-btn>

        <app-color-picker
          v-if="theme"
          v-model="themeColor"
          :title="t('app.setting.btn.select_theme')"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="t('app.setting.label.dark_mode')">
        <v-switch
          v-model="isDark"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="t('app.setting.label.show_logo_on_background')">
        <v-switch
          v-model="backgroundLogo"
          hide-details
          @click.native.stop
        />
      </app-setting>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import type { ThemePreset, ThemeConfig } from '@/store/config/types'

const { typedState, typedDispatch } = useStore()
const { t } = useI18n()

const theme = computed((): ThemeConfig => typedState.config.uiSettings.theme)

const themePresets = computed((): ThemePreset[] => typedState.config.hostConfig.themePresets)

const themePreset = computed((): ThemePreset | undefined =>
  themePresets.value.find(p => p.logo.src === theme.value.logo.src)
)

function applyThemePreset (value: ThemePreset) {
  const { color, isDark, logo } = value
  updateTheme({ color, isDark, logo })
}

const themeColor = computed({
  get: () => theme.value.color,
  set: (value: string) => {
    if (theme.value.color.toLowerCase() !== value.toLowerCase()) {
      updateTheme({ color: value })
    }
  }
})

const isDark = computed({
  get: () => theme.value.isDark,
  set: (value: boolean) => {
    updateTheme({ isDark: value })
  }
})

const backgroundLogo = computed({
  get: () => theme.value.backgroundLogo,
  set: (value: boolean) => {
    updateTheme({ backgroundLogo: value })
  }
})

function updateTheme (updatedTheme: Partial<ThemeConfig>) {
  typedDispatch('config/updateTheme', updatedTheme)
}

function handleReset () {
  const preset = themePreset.value
  if (preset) {
    updateTheme({ color: preset.color, isDark: preset.isDark, logo: preset.logo })
  }
}
</script>

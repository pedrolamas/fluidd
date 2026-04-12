<template>
  <collapsable-card
    :title="$t('app.timelapse.title.timelapse_settings')"
    icon="$cog"
  >
    <app-setting
      :title="$t('app.timelapse.setting.enable')"
      :sub-title="subtitleIfBlocked(enabledBlocked)"
      :r-cols="2"
    >
      <v-switch
        v-model="enabled"
        hide-details
        :disabled="enabledBlocked"
        @click.native.stop
      />
    </app-setting>

    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.auto_render')"
      :sub-title="subtitleIfBlocked(autoRenderBlocked)"
      :r-cols="2"
    >
      <v-switch
        v-model="autoRender"
        hide-details
        :disabled="autoRenderBlocked"
        @click.native.stop
      />
    </app-setting>

    <v-divider />
    <app-setting :title="$tc('app.timelapse.title.render_settings')">
      <app-btn
        outlined
        small
        color="primary"
        @click="$emit('openRenderDialog', false)"
      >
        <v-icon
          small
          left
        >
          $pencil
        </v-icon>
        {{ $t('app.general.btn.edit') }}
      </app-btn>
    </app-setting>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'

defineEmits<{
  (e: 'openRenderDialog', value: boolean): void
}>()

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const enabledBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('enabled')
)

const enabled = computed({
  get: () => settings.value.enabled,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ enabled: value })
  }
})

const autoRenderBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('autorender')
)

const autoRender = computed({
  get: () => settings.value.autorender,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ autorender: value })
  }
})

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

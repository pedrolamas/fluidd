<template>
  <div>
    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.hyperlapse_cycle')"
      :sub-title="subtitleIfBlocked(hyperlapseCycleBlocked)"
    >
      <app-text-field
        :value="hyperlapseCycle"
        :rules="[
          Rules.required,
          Rules.numberValid,
          Rules.numberGreaterThanOrEqual(1)
        ]"
        :disabled="hyperlapseCycleBlocked"
        hide-details="auto"
        filled
        dense
        single-line
        suffix="s"
        submit-on-change
        @submit="setHyperlapseCycle"
      />
    </app-setting>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Rules } from '@/plugins/filters'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const hyperlapseCycleBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('hyperlapse_cycle')
)

const hyperlapseCycle = computed(() => settings.value.hyperlapse_cycle)

function setHyperlapseCycle (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ hyperlapse_cycle: Number(value) })
}

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

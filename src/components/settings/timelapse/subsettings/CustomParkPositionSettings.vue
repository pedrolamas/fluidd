<template>
  <div>
    <template v-if="['custom', 'x_only'].includes(parkpos)">
      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.park_custom_pos_x')"
        :sub-title="subtitleIfBlocked(getCustomParkPosBlocked('x'))"
      >
        <app-text-field
          :value="parkPosX"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(bedSize.minX),
            Rules.numberLessThanOrEqual(bedSize.maxX)
          ]"
          :disabled="getCustomParkPosBlocked('x')"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="mm"
          submit-on-change
          @submit="setParkPosX"
        />
      </app-setting>
    </template>

    <template v-if="['custom', 'y_only'].includes(parkpos)">
      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.park_custom_pos_y')"
        :sub-title="subtitleIfBlocked(getCustomParkPosBlocked('y'))"
      >
        <app-text-field
          :value="parkPosY"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(bedSize.minY),
            Rules.numberLessThanOrEqual(bedSize.maxY)
          ]"
          :disabled="getCustomParkPosBlocked('y')"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="mm"
          submit-on-change
          @submit="setParkPosY"
        />
      </app-setting>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Rules } from '@/plugins/filters'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'
import type { BedSize } from '@/store/printer/types'

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

function getCustomParkPosBlocked (axis: 'x' | 'y'): boolean {
  return typedGetters['timelapse/isBlockedSetting'](`park_custom_pos_${axis}`)
}

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const parkpos = computed((): Moonraker.Timelapse.ParkPosition =>
  settings.value.parkpos ?? defaultWritableSettings.parkpos
)

const parkPosX = computed((): number =>
  settings.value.park_custom_pos_x ?? defaultWritableSettings.park_custom_pos_x
)

function setParkPosX (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_custom_pos_x: Number(value) })
}

const parkPosY = computed((): number =>
  settings.value.park_custom_pos_y ?? defaultWritableSettings.park_custom_pos_y
)

function setParkPosY (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_custom_pos_y: Number(value) })
}

const bedSize = computed((): BedSize => typedGetters['printer/getBedSize'])

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

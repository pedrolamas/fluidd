<template>
  <div>
    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.park_retract_distance')"
      :sub-title="subtitleIfBlocked(parkRetractDistanceBlocked)"
    >
      <app-text-field
        :value="parkRetractDistance"
        :rules="[
          Rules.required,
          Rules.numberValid,
          Rules.numberGreaterThanOrEqual(0)
        ]"
        :disabled="parkRetractDistanceBlocked"
        hide-details="auto"
        filled
        dense
        single-line
        suffix="mm"
        submit-on-change
        @submit="setParkRetractDistance"
      />
    </app-setting>

    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.park_retract_speed')"
      :sub-title="subtitleIfBlocked(parkRetractSpeedBlocked)"
    >
      <app-text-field
        :value="parkRetractSpeed"
        :rules="[
          Rules.required,
          Rules.numberValid,
          Rules.numberGreaterThan(0)
        ]"
        :disabled="parkRetractSpeedBlocked"
        hide-details="auto"
        filled
        dense
        single-line
        suffix="mm/s"
        submit-on-change
        @submit="setParkRetractSpeed"
      />
    </app-setting>

    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.park_extrude_distance')"
      :sub-title="subtitleIfBlocked(parkExtrudeDistanceBlocked)"
    >
      <app-text-field
        :value="parkExtrudeDistance"
        :rules="[
          Rules.required,
          Rules.numberValid,
          Rules.numberGreaterThanOrEqual(0)
        ]"
        :disabled="parkExtrudeDistanceBlocked"
        hide-details="auto"
        filled
        dense
        single-line
        suffix="mm"
        submit-on-change
        @submit="setParkExtrudeDistance"
      />
    </app-setting>

    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.park_extrude_speed')"
      :sub-title="subtitleIfBlocked(parkExtrudeSpeedBlocked)"
    >
      <app-text-field
        :value="parkExtrudeSpeed"
        :rules="[
          Rules.required,
          Rules.numberValid,
          Rules.numberGreaterThan(0)
        ]"
        :disabled="parkExtrudeSpeedBlocked"
        hide-details="auto"
        filled
        dense
        single-line
        suffix="mm/s"
        submit-on-change
        @submit="setParkExtrudeSpeed"
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

const parkRetractDistanceBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_retract_distance')
)

const parkRetractDistance = computed((): number => settings.value.park_retract_distance)

function setParkRetractDistance (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_retract_distance: Number(value) })
}

const parkRetractSpeedBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_retract_speed')
)

const parkRetractSpeed = computed((): number => settings.value.park_retract_speed)

function setParkRetractSpeed (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_retract_speed: Number(value) })
}

const parkExtrudeDistanceBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_extrude_distance')
)

const parkExtrudeDistance = computed((): number => settings.value.park_extrude_distance)

function setParkExtrudeDistance (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_extrude_distance: Number(value) })
}

const parkExtrudeSpeedBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_extrude_speed')
)

const parkExtrudeSpeed = computed((): number => settings.value.park_extrude_speed)

function setParkExtrudeSpeed (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_extrude_speed: Number(value) })
}

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

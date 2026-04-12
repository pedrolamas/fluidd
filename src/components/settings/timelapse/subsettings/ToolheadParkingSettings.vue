<template>
  <div>
    <v-divider />
    <app-setting
      :title="$t('app.timelapse.setting.parkhead')"
      :sub-title="subtitleIfBlocked(parkheadBlocked)"
    >
      <v-switch
        v-model="parkhead"
        hide-details
        :disabled="parkheadBlocked"
        @click.native.stop
      />
    </app-setting>

    <div v-if="parkhead">
      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.park_time')"
        :sub-title="subtitleIfBlocked(parkTimeBlocked)"
      >
        <app-text-field
          :value="parkTime"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="parkTimeBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="ms"
          submit-on-change
          @submit="setParkTime"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.park_travel_speed')"
        :sub-title="subtitleIfBlocked(parkTravelSpeedBlocked)"
      >
        <app-text-field
          :value="parkTravelSpeed"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="parkTravelSpeedBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="mm/s"
          submit-on-change
          @submit="setParkTravelSpeed"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.parkpos.label')"
        :sub-title="subtitleIfBlocked(parkposBlocked)"
      >
        <v-select
          v-model="parkpos"
          filled
          dense
          hide-details="auto"
          :items="parkPositions"
          :disabled="parkposBlocked"
        />
      </app-setting>

      <custom-park-position-settings v-if="['custom', 'x_only', 'y_only'].includes(parkpos)" />

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.park_custom_pos_dz')"
        :sub-title="subtitleIfBlocked(parkPosZBlocked)"
      >
        <app-text-field
          :value="parkPosZ"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="parkPosZBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="mm"
          submit-on-change
          @submit="setParkPosZ"
        />
      </app-setting>

      <v-divider />
      <app-setting
        :title="$t('app.timelapse.setting.fw_retract')"
        :sub-title="subtitleIfBlocked(firmwareRetractBlocked)"
      >
        <v-switch
          v-model="firmwareRetract"
          hide-details
          :disabled="firmwareRetractBlocked"
          @click.native.stop
        />
      </app-setting>

      <park-extrude-retract-settings v-if="!firmwareRetract" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Rules } from '@/plugins/filters'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'
import ParkExtrudeRetractSettings from './ParkExtrudeRetractSettings.vue'
import CustomParkPositionSettings from './CustomParkPositionSettings.vue'

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const parkPositions = computed((): { text: string, value: Moonraker.Timelapse.ParkPosition }[] => {
  const values: Moonraker.Timelapse.ParkPosition[] = ['front_left', 'front_right', 'center', 'back_left', 'back_right', 'x_only', 'y_only', 'custom']

  return values.map(value => ({
    text: tc(`app.timelapse.setting.parkpos.${value}`),
    value
  }))
})

const parkheadBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('parkhead')
)

const parkhead = computed({
  get: (): boolean => settings.value.parkhead,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ parkhead: value })
  }
})

const parkposBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('parkpos')
)

const parkpos = computed({
  get: (): Moonraker.Timelapse.ParkPosition => settings.value.parkpos,
  set: (value: Moonraker.Timelapse.ParkPosition) => {
    SocketActions.machineTimelapsePostSettings({ parkpos: value })
  }
})

const parkTimeBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_time')
)

const parkTime = computed((): number => settings.value.park_time * 1000)

function setParkTime (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_time: Number(value) / 1000 })
}

const parkTravelSpeedBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_travel_speed')
)

const parkTravelSpeed = computed((): number => settings.value.park_travel_speed)

function setParkTravelSpeed (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_travel_speed: Number(value) })
}

const parkPosZBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('park_custom_pos_dz')
)

const parkPosZ = computed((): number => settings.value.park_custom_pos_dz)

function setParkPosZ (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ park_custom_pos_dz: Number(value) })
}

const firmwareRetractBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('fw_retract')
)

const firmwareRetract = computed({
  get: (): boolean => settings.value.fw_retract,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ fw_retract: value })
  }
})

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

<template>
  <div>
    <v-subheader id="toolhead">
      {{ $t('app.setting.title.tool') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        :title="$t('app.setting.label.gcode_coords')"
        :sub-title="$t('app.setting.tooltip.gcode_coords')"
        :r-cols="2"
      >
        <v-switch
          v-model="useGcodeCoords"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.toolhead_control_style')">
        <v-select
          v-model="toolheadControlStyle"
          filled
          dense
          hide-details="auto"
          :items="availableToolheadControlStyles"
        />
      </app-setting>

      <v-divider />

      <template v-if="toolheadControlStyle === 'cross' || toolheadControlStyle === 'circle'">
        <app-setting :title="$t('app.setting.label.invert_x_control')">
          <v-switch
            v-model="invertX"
            hide-details
            class="mt-0 mb-4"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.invert_y_control')">
          <v-switch
            v-model="invertY"
            hide-details
            class="mt-0 mb-4"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.invert_z_control')">
          <v-switch
            v-model="invertZ"
            hide-details
            class="mt-0 mb-4"
          />
        </app-setting>

        <v-divider />
      </template>

      <template v-if="toolheadControlStyle === 'cross'">
        <app-setting :title="$t('app.setting.label.toolhead_move_distances')">
          <v-combobox
            ref="toolheadMoveDistancesElement"
            v-model="toolheadMoveDistances"
            filled
            dense
            hide-selected
            hide-details="auto"
            suffix="mm"
            multiple
            small-chips
            append-icon=""
            deletable-chips
            :rules="[
              Rules.lengthGreaterThanOrEqual(1),
              Rules.lengthLessThanOrEqual(6),
              Rules.numberArrayValid,
              Rules.numberArrayGreaterThan(0)
            ]"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.default_toolhead_move_length')">
          <v-select
            :value="defaultToolheadMoveLength"
            :items="toolheadMoveDistances"
            :rules="[
              Rules.required,
              Rules.numberValid
            ]"
            filled
            dense
            single-line
            hide-details="auto"
            suffix="mm"
            @change="setDefaultToolheadMoveLength"
          />
        </app-setting>

        <v-divider />
      </template>

      <template v-else-if="toolheadControlStyle === 'bars'">
        <app-setting :title="$t('app.setting.label.toolhead_xy_move_distances')">
          <v-combobox
            ref="toolheadXYMoveDistancesElement"
            v-model="toolheadXYMoveDistances"
            filled
            dense
            hide-selected
            hide-details="auto"
            suffix="mm"
            multiple
            small-chips
            append-icon=""
            deletable-chips
            :rules="[
              Rules.lengthGreaterThanOrEqual(1),
              Rules.lengthLessThanOrEqual(3),
              Rules.numberArrayValid,
              Rules.numberArrayGreaterThan(0)
            ]"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.toolhead_z_move_distances')">
          <v-combobox
            ref="toolheadZMoveDistancesElement"
            v-model="toolheadZMoveDistances"
            filled
            dense
            hide-selected
            hide-details="auto"
            suffix="mm"
            multiple
            small-chips
            append-icon=""
            deletable-chips
            :rules="[
              Rules.lengthGreaterThanOrEqual(1),
              Rules.lengthLessThanOrEqual(3),
              Rules.numberArrayValid,
              Rules.numberArrayGreaterThan(0)
            ]"
          />
        </app-setting>

        <v-divider />
      </template>

      <template v-else-if="toolheadControlStyle === 'circle'">
        <app-setting :title="$t('app.setting.label.toolhead_xy_move_distances')">
          <v-combobox
            ref="toolheadCircleXYMoveDistancesElement"
            v-model="toolheadCircleXYMoveDistances"
            filled
            dense
            hide-selected
            hide-details="auto"
            suffix="mm"
            multiple
            small-chips
            append-icon=""
            deletable-chips
            :rules="[
              Rules.lengthGreaterThanOrEqual(4),
              Rules.lengthLessThanOrEqual(4),
              Rules.numberArrayValid,
              Rules.numberArrayGreaterThan(0)
            ]"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.toolhead_z_move_distances')">
          <v-combobox
            ref="toolheadCircleZMoveDistancesElement"
            v-model="toolheadCircleZMoveDistances"
            filled
            dense
            hide-selected
            hide-details="auto"
            suffix="mm"
            multiple
            small-chips
            append-icon=""
            deletable-chips
            :rules="[
              Rules.lengthGreaterThanOrEqual(4),
              Rules.lengthLessThanOrEqual(4),
              Rules.numberArrayValid,
              Rules.numberArrayGreaterThan(0)
            ]"
          />
        </app-setting>

        <v-divider />

        <app-setting :title="$t('app.setting.label.enable_xy_homing')">
          <v-switch
            v-model="toolheadCircleXYHomingEnabled"
            hide-details
            class="mt-0 mb-4"
          />
        </app-setting>

        <v-divider />
      </template>

      <app-setting :title="$t('app.setting.label.default_toolhead_xy_speed')">
        <app-text-field
          :value="defaultToolheadXYSpeed"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(1)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm/s"
          submit-on-change
          @submit="setDefaultToolheadXYSpeed"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.default_toolhead_z_speed')">
        <app-text-field
          :value="defaultToolheadZSpeed"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(1)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm/s"
          submit-on-change
          @submit="setDefaultToolheadZSpeed"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.z_adjust_values')">
        <v-combobox
          ref="zAdjustValuesElement"
          v-model="zAdjustValues"
          filled
          dense
          hide-selected
          hide-details="auto"
          suffix="mm"
          multiple
          small-chips
          append-icon=""
          deletable-chips
          :rules="[
            Rules.lengthGreaterThanOrEqual(1),
            Rules.lengthLessThanOrEqual(4),
            Rules.numberArrayValid,
            Rules.numberArrayGreaterThan(0)
          ]"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.default_extrude_length')">
        <app-text-field
          :value="defaultExtrudeLength"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(1)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          submit-on-change
          @submit="setDefaultExtrudeLength"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.default_extrude_speed')">
        <app-text-field
          :value="defaultExtrudeSpeed"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(1)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm/s"
          submit-on-change
          @submit="setDefaultExtrudeSpeed"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.show_manual_probe_dialog_automatically')"
        :sub-title="$t('app.setting.tooltip.show_manual_probe_dialog_automatically')"
      >
        <v-switch
          v-model="showManualProbeDialogAutomatically"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.show_bed_screws_adjust_dialog_automatically')"
        :sub-title="$t('app.setting.tooltip.show_bed_screws_adjust_dialog_automatically')"
      >
        <v-switch
          v-model="showBedScrewsAdjustDialogAutomatically"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.show_screws_tilt_adjust_dialog_automatically')"
        :sub-title="$t('app.setting.tooltip.show_screws_tilt_adjust_dialog_automatically')"
      >
        <v-switch
          v-model="showScrewsTiltAdjustDialogAutomatically"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <template v-if="printerSupportsForceMove">
        <app-setting :title="$t('app.setting.label.force_move_toggle_warning')">
          <v-switch
            v-model="forceMoveToggleWarning"
            hide-details
            class="mt-0 mb-4"
          />
        </app-setting>

        <v-divider />
      </template>

      <app-setting :title="$t('app.setting.label.reset')">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleReset"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
      </app-setting>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defaultState } from '@/store/config/state'
import type { VCombobox } from 'vuetify/lib'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Rules } from '@/plugins/filters'
import type { GeneralConfig, ToolheadControlStyle } from '@/store/config/types'

const { typedState, typedGetters, typedDispatch } = useStore()
const { t } = useI18n()

const toolheadMoveDistancesElement = ref<VCombobox>()
const toolheadXYMoveDistancesElement = ref<VCombobox>()
const toolheadZMoveDistancesElement = ref<VCombobox>()
const toolheadCircleXYMoveDistancesElement = ref<VCombobox>()
const toolheadCircleZMoveDistancesElement = ref<VCombobox>()
const zAdjustValuesElement = ref<VCombobox>()

const defaultExtrudeSpeed = computed(() => typedState.config.uiSettings.general.defaultExtrudeSpeed)

function setDefaultExtrudeSpeed (value: string) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.defaultExtrudeSpeed',
    value: +value,
    server: true
  })
}

const defaultExtrudeLength = computed(() => typedState.config.uiSettings.general.defaultExtrudeLength)

function setDefaultExtrudeLength (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.defaultExtrudeLength',
    value: +value,
    server: true
  })
}

const defaultToolheadMoveLength = computed(() => typedState.config.uiSettings.general.defaultToolheadMoveLength)

function setDefaultToolheadMoveLength (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.defaultToolheadMoveLength',
    value: +value,
    server: true
  })
}

const defaultToolheadXYSpeed = computed(() => typedState.config.uiSettings.general.defaultToolheadXYSpeed)

function setDefaultToolheadXYSpeed (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.defaultToolheadXYSpeed',
    value: +value,
    server: true
  })
}

const defaultToolheadZSpeed = computed(() => typedState.config.uiSettings.general.defaultToolheadZSpeed)

function setDefaultToolheadZSpeed (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.defaultToolheadZSpeed',
    value: +value,
    server: true
  })
}

const zAdjustValues = computed({
  get: () => typedState.config.uiSettings.general.zAdjustDistances,
  set: (value: (number | string)[]) => {
    if (!zAdjustValuesElement.value?.validate(true)) {
      return
    }

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.zAdjustDistances',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
})

const toolheadCircleXYHomingEnabled = computed({
  get: () => typedState.config.uiSettings.general.toolheadCircleXYHomingEnabled,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.toolheadCircleXYHomingEnabled',
    value,
    server: true
  })
})

const toolheadControlStyle = computed({
  get: () => typedState.config.uiSettings.general.toolheadControlStyle as ToolheadControlStyle,
  set: (value: ToolheadControlStyle) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.toolheadControlStyle',
    value,
    server: true
  })
})

const availableToolheadControlStyles = computed(() => [
  {
    value: 'cross',
    text: t('app.general.label.cross')
  },
  {
    value: 'bars',
    text: t('app.general.label.bars')
  },
  {
    value: 'circle',
    text: t('app.general.label.circle')
  }
])

const toolheadMoveDistances = computed({
  get: () => typedState.config.uiSettings.general.toolheadMoveDistances,
  set: (value: (number | string)[]) => {
    if (!toolheadMoveDistancesElement.value?.validate(true)) {
      return
    }

    const distances = [...new Set(value.map(Number))]
      .sort((a, b) => a - b)

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.toolheadMoveDistances',
      value: distances,
      server: true
    })

    if (distances.includes(defaultToolheadMoveLength.value) === false) {
      setDefaultToolheadMoveLength(distances[0])
    }
  }
})

const toolheadXYMoveDistances = computed({
  get: () => typedState.config.uiSettings.general.toolheadXYMoveDistances,
  set: (value: (number | string)[]) => {
    if (!toolheadXYMoveDistancesElement.value?.validate(true)) {
      return
    }

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.toolheadXYMoveDistances',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
})

const toolheadCircleXYMoveDistances = computed({
  get: () => typedState.config.uiSettings.general.toolheadCircleXYMoveDistances,
  set: (value: (number | string)[]) => {
    if (!toolheadCircleXYMoveDistancesElement.value?.validate(true)) {
      return
    }

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.toolheadCircleXYMoveDistances',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
})

const toolheadZMoveDistances = computed({
  get: () => typedState.config.uiSettings.general.toolheadZMoveDistances,
  set: (value: (number | string)[]) => {
    if (!toolheadZMoveDistancesElement.value?.validate(true)) {
      return
    }

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.toolheadZMoveDistances',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
})

const toolheadCircleZMoveDistances = computed({
  get: () => typedState.config.uiSettings.general.toolheadCircleZMoveDistances,
  set: (value: (number | string)[]) => {
    if (!toolheadCircleZMoveDistancesElement.value?.validate(true)) {
      return
    }

    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.toolheadCircleZMoveDistances',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
})

const useGcodeCoords = computed({
  get: () => typedState.config.uiSettings.general.useGcodeCoords,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.useGcodeCoords',
    value,
    server: true
  })
})

const invertX = computed({
  get: () => typedState.config.uiSettings.general.axis.x.inverted,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.axis.x.inverted',
    value,
    server: true
  })
})

const invertY = computed({
  get: () => typedState.config.uiSettings.general.axis.y.inverted,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.axis.y.inverted',
    value,
    server: true
  })
})

const invertZ = computed({
  get: () => typedState.config.uiSettings.general.axis.z.inverted,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.axis.z.inverted',
    value,
    server: true
  })
})

const printerSupportsForceMove = computed(() => {
  const printerSettings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']
  return printerSettings.force_move?.enable_force_move ?? false
})

const showManualProbeDialogAutomatically = computed({
  get: () => typedState.config.uiSettings.general.showManualProbeDialogAutomatically,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showManualProbeDialogAutomatically',
    value,
    server: true
  })
})

const showBedScrewsAdjustDialogAutomatically = computed({
  get: () => typedState.config.uiSettings.general.showBedScrewsAdjustDialogAutomatically,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showBedScrewsAdjustDialogAutomatically',
    value,
    server: true
  })
})

const showScrewsTiltAdjustDialogAutomatically = computed({
  get: () => typedState.config.uiSettings.general.showScrewsTiltAdjustDialogAutomatically,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.showScrewsTiltAdjustDialogAutomatically',
    value,
    server: true
  })
})

const forceMoveToggleWarning = computed({
  get: () => typedState.config.uiSettings.general.forceMoveToggleWarning,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.forceMoveToggleWarning',
    value,
    server: true
  })
})

function handleReset () {
  const { instanceName, chartVisible, hideTempWaits }: GeneralConfig = typedState.config.uiSettings.general

  const value: GeneralConfig = {
    ...defaultState().uiSettings.general,
    instanceName,
    chartVisible,
    hideTempWaits
  }

  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general',
    value,
    server: true
  })
}
</script>

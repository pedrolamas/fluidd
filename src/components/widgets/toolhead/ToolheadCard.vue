<template>
  <collapsable-card
    :title="$t('app.general.title.tool')"
    icon="$printer3dNozzle"
    draggable
    layout-path="dashboard.toolhead-card"
    menu-breakpoint="lg"
  >
    <template #title>
      <v-icon left>
        $printer3dNozzle
      </v-icon>
      <span class="font-weight-light">{{ $t('app.general.title.tool') }}</span>

      <v-tooltip
        v-if="extruderDisconnected"
        bottom
      >
        <template #activator="{ on, attrs }">
          <v-icon
            v-bind="attrs"
            class="ml-3"
            color="warning"
            small
            v-on="on"
          >
            $warning
          </v-icon>
        </template>
        <span>{{ $t('app.general.label.disconnected') }}</span>
      </v-tooltip>

      <v-tooltip
        v-else
        bottom
      >
        <template #activator="{ on, attrs }">
          <v-icon
            v-show="hasExtruder && !extruderReady"
            v-bind="attrs"
            class="ml-3"
            color="info"
            v-on="on"
          >
            $snowflakeAlert
          </v-icon>
        </template>
        <span v-safe-html="$t('app.tool.tooltip.extruder_disabled', { min: activeExtruder?.min_extrude_temp })" />
      </v-tooltip>
    </template>

    <template #menu>
      <app-btn-collapse-group :collapsed="narrow">
        <app-btn
          v-if="isManualProbeActive"
          :disabled="!klippyReady || printerPrinting"
          small
          class="me-1 my-1"
          @click="manualProbeDialogOpen = true"
        >
          {{ $t('app.tool.tooltip.manual_probe') }}
        </app-btn>

        <app-btn
          v-if="isBedScrewsAdjustActive"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          small
          class="me-1 my-1"
          @click="bedScrewsAdjustDialogOpen = true"
        >
          BED_SCREWS_ADJUST
        </app-btn>

        <app-btn
          v-if="printerSupportsForceMove"
          :disabled="!klippyReady || printerPrinting"
          small
          class="me-1 my-1"
          :color="forceMoveEnabled ? 'error' : undefined"
          @click="toggleForceMove"
        >
          FORCE_MOVE
        </app-btn>

        <app-btn
          v-if="hasSteppersEnabled"
          :disabled="!klippyReady || printerPrinting"
          small
          class="me-1 my-1"
          @click="sendGcode('M84')"
        >
          {{ $t('app.tool.tooltip.motors_off') }}
        </app-btn>

        <v-menu
          v-if="availableTools.length"
          left
          offset-y
          transition="slide-y-transition"
        >
          <template #activator="{ on, attrs, value }">
            <app-btn
              v-bind="attrs"
              small
              class="me-1 my-1"
              :disabled="!klippyReady || printerPrinting"
              v-on="on"
            >
              <v-icon
                small
                class="me-1"
              >
                $tools
              </v-icon>
              {{ $t('app.tool.tooltip.tools') }}
              <v-icon
                small
                class="ms-1"
                :class="{ 'rotate-180': value }"
              >
                $chevronDown
              </v-icon>
            </app-btn>
          </template>
          <v-list dense>
            <template v-for="(tool, index) of availableTools">
              <v-list-item
                v-if="tool.name !== '-'"
                :key="tool.name"
                :disabled="tool.disabled || (tool.wait && hasWait(tool.wait))"
                @click="sendGcode(tool.name, tool.wait)"
              >
                <v-list-item-icon>
                  <v-icon>
                    {{ tool.icon || '$tools' }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ tool.label || tool.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider
                v-else
                :key="`sep=${index}`"
              />
            </template>
          </v-list>
        </v-menu>
      </app-btn-collapse-group>
    </template>

    <toolhead />
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import Toolhead from './Toolhead.vue'
import type { Macro } from '@/store/macros/types'
import type { KlippyApp } from '@/store/printer/types'

type Tool = {
  name: string
  label?: string
  disabled?: boolean
  wait?: string
  icon?: string
}

defineProps<{
  narrow?: boolean
}>()

const { typedState, typedGetters, typedDispatch } = useStore()
const {
  klippyReady, printerPrinting, hasWait, sendGcode
} = useStateMixin()
const {
  hasExtruder, activeExtruder, extruderReady, extruderDisconnected,
  allHomed,
  isManualProbeActive, isBedScrewsAdjustActive,
  manualProbeDialogOpen, bedScrewsAdjustDialogOpen,
  forceMoveEnabled
} = useToolheadMixin()
const confirm = useConfirm()
const { tc } = useI18n()

const klippyApp = computed<KlippyApp>(() => typedGetters['printer/getKlippyApp'])
const printerSettings = computed<Klipper.SettingsState>(() => typedGetters['printer/getPrinterSettings'])

const printerSupportsQuadGantryLevel = computed(() => printerSettings.value.quad_gantry_level != null)

const printerSupportsZTiltAdjust = computed(() =>
  printerSettings.value.z_tilt != null ||
  (klippyApp.value.isKalico && printerSettings.value.z_tilt_ng != null)
)

const printerSupportsBedScrewsAdjust = computed(() => printerSettings.value.bed_screws != null)

const printerSupportsBedScrewsCalculate = computed(() => printerSettings.value.screws_tilt_adjust != null)

const printerSupportsBedTiltCalibrate = computed(() => printerSettings.value.bed_tilt != null)

const printerSupportsDeltaCalibrate = computed(() => printerSettings.value.delta_calibrate != null)

const printerSupportsProbeCalibrate = computed(() =>
  printerSettings.value.probe != null ||
  printerSettings.value.bltouch != null ||
  printerSettings.value.smart_effector != null ||
  printerSettings.value.cartographer != null ||
  (
    printerSettings.value.scanner != null &&
    'sensor' in printerSettings.value.scanner &&
    printerSettings.value.scanner.sensor === 'cartographer'
  ) ||
  Object.keys(printerSettings.value)
    .some(x => x.startsWith('probe_eddy_current '))
)

const printerSupportsBeaconCalibrate = computed(() => printerSettings.value.beacon != null)

const printerSupportsCartographerCalibrate = computed(() => printerSettings.value.cartographer != null)

const printerSupportsZEndstopCalibrate = computed(() =>
  printerSettings.value.stepper_z?.position_endstop != null
)

const loadFilamentMacro = computed<Macro | undefined>(() =>
  typedGetters['macros/getMacroByName']('LOAD_FILAMENT', 'FILAMENT_LOAD', 'M701')
)

const unloadFilamentMacro = computed<Macro | undefined>(() =>
  typedGetters['macros/getMacroByName']('UNLOAD_FILAMENT', 'FILAMENT_UNLOAD', 'M702')
)

const cleanNozzleMacro = computed<Macro | undefined>(() =>
  typedGetters['macros/getMacroByName']('CLEAN_NOZZLE', 'NOZZLE_CLEAN', 'WIPE_NOZZLE', 'NOZZLE_WIPE', 'G12')
)

const parkToolheadMacro = computed<Macro | undefined>(() =>
  typedGetters['macros/getMacroByName']('PARK_TOOLHEAD', 'TOOLHEAD_PARK', 'G27')
)

const availableTools = computed(() => {
  const tools: Tool[] = []

  const loadMacro = loadFilamentMacro.value
  if (loadMacro) {
    const ignoreMinExtrudeTemp = loadMacro.variables?.ignore_min_extrude_temp ?? false
    tools.push({
      name: loadMacro.name.toUpperCase(),
      label: loadMacro.name.toLowerCase() === 'm701' ? `M701 (${loadMacro.description || tc('app.general.label.load_filament')})` : undefined,
      icon: '$loadFilament',
      disabled: !(ignoreMinExtrudeTemp || extruderReady.value) || extruderDisconnected.value
    })
  }

  const unloadMacro = unloadFilamentMacro.value
  if (unloadMacro) {
    const ignoreMinExtrudeTemp = unloadMacro.variables?.ignore_min_extrude_temp ?? false
    tools.push({
      name: unloadMacro.name.toUpperCase(),
      label: unloadMacro.name.toLowerCase() === 'm702' ? `M702 (${unloadMacro.description || tc('app.general.label.unload_filament')})` : undefined,
      icon: '$unloadFilament',
      disabled: !(ignoreMinExtrudeTemp || extruderReady.value) || extruderDisconnected.value
    })
  }

  const cleanMacro = cleanNozzleMacro.value
  if (cleanMacro) {
    tools.push({
      name: cleanMacro.name.toUpperCase(),
      label: cleanMacro.name.toLowerCase() === 'g12' ? `G12 (${cleanMacro.description || tc('app.general.label.clean_nozzle')})` : undefined,
      icon: '$cleanNozzle'
    })
  }

  const parkMacro = parkToolheadMacro.value
  if (parkMacro) {
    tools.push({
      name: parkMacro.name.toUpperCase(),
      label: parkMacro.name.toLowerCase() === 'g27' ? `G27 (${parkMacro.description || tc('app.general.label.park_toolhead')})` : undefined,
      icon: '$parkToolhead',
      disabled: !allHomed.value
    })
  }

  if (tools.length > 0) {
    tools.push({ name: '-' })
  }

  if (printerSupportsBeaconCalibrate.value) {
    tools.push({
      name: 'BEACON_AUTO_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onBeaconCalibrate
    })
  }

  if (printerSupportsBedScrewsAdjust.value) {
    tools.push({
      name: 'BED_SCREWS_ADJUST',
      disabled: !allHomed.value || isBedScrewsAdjustActive.value,
      wait: Waits.onBedScrewsAdjust
    })
  }

  if (printerSupportsBedTiltCalibrate.value) {
    tools.push({
      name: 'BED_TILT_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onBedTiltCalibrate
    })
  }

  if (printerSupportsCartographerCalibrate.value) {
    tools.push({
      name: 'CARTOGRAPHER_SCAN_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onCartographerScanCalibrate
    })
    tools.push({
      name: 'CARTOGRAPHER_TOUCH_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onCartographerTouchCalibrate
    })
  }

  if (printerSupportsDeltaCalibrate.value) {
    tools.push({
      name: 'DELTA_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onDeltaCalibrate
    })
  }

  tools.push({
    name: 'MANUAL_PROBE',
    disabled: !allHomed.value || isManualProbeActive.value,
    wait: Waits.onManualProbe
  })

  if (printerSupportsProbeCalibrate.value) {
    tools.push({
      name: 'PROBE_ACCURACY',
      disabled: !allHomed.value,
      wait: Waits.onProbeAccuracy
    })
    tools.push({
      name: 'PROBE_CALIBRATE',
      disabled: !allHomed.value,
      wait: Waits.onProbeCalibrate
    })
  }

  if (printerSupportsQuadGantryLevel.value) {
    tools.push({
      name: 'QUAD_GANTRY_LEVEL',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onQGL
    })
  }

  if (printerSupportsBedScrewsCalculate.value) {
    tools.push({
      name: 'SCREWS_TILT_CALCULATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onBedScrewsCalculate
    })
  }

  if (printerSupportsZEndstopCalibrate.value) {
    tools.push({
      name: 'Z_ENDSTOP_CALIBRATE',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onZEndstopCalibrate
    })
  }

  if (printerSupportsZTiltAdjust.value) {
    tools.push({
      name: 'Z_TILT_ADJUST',
      disabled: !allHomed.value || isManualProbeActive.value,
      wait: Waits.onZTilt
    })
  }

  return tools
})

const printerSupportsForceMove = computed(() =>
  (printerSettings.value.force_move?.enable_force_move ?? false) &&
  !hasRoundBed.value
)

const hasSteppersEnabled = computed<boolean>(() => typedGetters['printer/getHasSteppersEnabled'])

const hasRoundBed = computed<boolean>(() => typedGetters['printer/getHasRoundBed'])

async function toggleForceMove () {
  const result = (
    forceMoveEnabled.value ||
    !typedState.config.uiSettings.general.forceMoveToggleWarning ||
    await confirm(
      tc('app.general.simple_form.msg.confirm_forcemove_toggle'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
    )
  )

  if (result) {
    typedDispatch('printer/forceMoveEnabled', !forceMoveEnabled.value)
  }
}
</script>

<template>
  <v-menu
    :offset-y="true"
    :close-on-content-click="false"
    :title="$t('app.afc.Functions')"
    left
  >
    <template #activator="{ on, attrs }">
      <app-btn
        icon
        v-bind="attrs"
        v-on="on"
      >
        <v-icon dense>
          $menu
        </v-icon>
      </app-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="command in commands"
        :key="command.command"
      >
        <v-tooltip
          top
          :disabled="!command.description"
        >
          <template #activator="{ on, attrs }">
            <app-btn
              class="fill-width"
              :disabled="!klippyReady || command.disabled"
              small
              v-bind="attrs"
              v-on="on"
              @click="sendGcode(command.command)"
            >
              <v-icon
                v-if="command.icon"
                small
                left
              >
                {{ command.icon }}
              </v-icon>
              {{ command.text }}
            </app-btn>
          </template>
          <span>
            {{ command.description }}
          </span>
        </v-tooltip>
      </v-list-item>
      <v-list-item
        v-for="macro in macros"
        :key="macro.macroName"
      >
        <v-tooltip
          top
          :disabled="!macro.macro.description"
        >
          <template #activator="{ on, attrs }">
            <macro-btn
              v-bind="attrs"
              :macro="macro.macro"
              small
              class="fill-width"
              v-on="on"
              @click="sendGcode($event)"
            >
              {{ macro.text }}
            </macro-btn>
          </template>
          <span>
            {{ macro.macro.description }}
          </span>
        </v-tooltip>
      </v-list-item>
      <v-list-item>
        <app-btn
          class="fill-width"
          small
          @click="showAfcSettings = true"
        >
          <v-icon
            small
            left
          >
            $afcSettings
          </v-icon>
          {{ $t('app.afc.AfcSettings') }}
        </app-btn>
        <afc-settings-dialog v-model="showAfcSettings" />
      </v-list-item>
      <v-list-item>
        <app-btn
          class="fill-width"
          small
          @click="downloadDebugJson"
        >
          <v-icon
            small
            left
          >
            $afcDebugJson
          </v-icon>
          {{ $t('app.afc.DebugJson') }}
        </app-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import MacroBtn from '@/components/widgets/macros/MacroBtn.vue'
import AfcSettingsDialog from '@/components/widgets/afc/dialogs/AfcSettingsDialog.vue'
import type { GcodeCommands } from '@/store/printer/types'
import downloadUrl from '@/util/download-url'
import type { Macro } from '@/store/macros/types'

type AfcCommand = {
  icon: string,
  text: string,
  command: string,
  description?: string,
  disabled?: boolean
}

type AfcMacro = {
  text: string,
  macroName: string,
  macro: Macro,
  disabled?: boolean
}

const { klippyReady, sendGcode, printerPrinting } = useStateMixin()
const { afc } = useAfcMixin()
const { typedState, typedGetters } = useStore()
const { t } = useI18n()

const showAfcSettings = ref(false)

const printerSettings = computed((): Klipper.SettingsState =>
  typedGetters['printer/getPrinterSettings']
)

const printerConfig = computed((): Klipper.ConfigState =>
  typedGetters['printer/getPrinterConfig']
)

const availableCommands = computed((): GcodeCommands =>
  typedGetters['printer/getAvailableCommands']
)

const commands = computed(() => {
  const available = availableCommands.value
  const cmds: AfcCommand[] = []

  if ('AFC_CALIBRATION' in available) {
    cmds.push({
      icon: '$afcCalibration',
      text: t('app.afc.Calibrate'),
      command: 'AFC_CALIBRATION',
      description: available['AFC_CALIBRATION'].help,
      disabled: printerPrinting.value
    })
  }

  if (afc.value?.led_state === true) {
    if ('TURN_OFF_AFC_LED' in available) {
      cmds.push({
        icon: '$afcTurnOffLed',
        text: t('app.afc.LedOff'),
        command: 'TURN_OFF_AFC_LED',
        description: available['TURN_OFF_AFC_LED'].help
      })
    }
  } else {
    if ('TURN_ON_AFC_LED' in available) {
      cmds.push({
        icon: '$afcTurnOnLed',
        text: t('app.afc.LedOn'),
        command: 'TURN_ON_AFC_LED',
        description: available['TURN_ON_AFC_LED'].help
      })
    }
  }

  if (
    afc.value?.td1_present === true &&
    'AFC_GET_TD_ONE_DATA' in available
  ) {
    cmds.push({
      icon: '',
      text: t('app.afc.CaptureTd'),
      command: 'AFC_GET_TD_ONE_DATA',
      description: available['AFC_GET_TD_ONE_DATA'].help,
      disabled: printerPrinting.value
    })
  }

  return cmds
})

const macros = computed(() => {
  const settings: Klipper.AfcSettings | undefined = printerSettings.value.afc
  const afcMacros: AfcMacro[] = []

  if (settings?.wipe) {
    const macroName: string = settings.wipe_cmd || 'AFC_BRUSH'
    const macro: Macro | undefined = typedGetters['macros/getMacroByName'](macroName)

    if (macro != null) {
      afcMacros.push({
        text: t('app.afc.BrushNozzle'),
        macroName,
        macro,
        disabled: printerPrinting.value
      })
    }
  }

  if (settings?.park) {
    const macroName: string = settings.park_cmd || 'AFC_PARK'
    const macro: Macro | undefined = typedGetters['macros/getMacroByName'](macroName)

    if (macro != null) {
      afcMacros.push({
        text: t('app.afc.ParkNozzle'),
        macroName,
        macro,
        disabled: printerPrinting.value
      })
    }
  }

  return afcMacros
})

function downloadDebugJson () {
  const printer: Klipper.PrinterState = typedState.printer.printer

  const output = {
    config: Object.fromEntries(
      Object.entries(printerConfig.value)
        .filter(([key]) => /^afc(?:$|_)/.test(key))
    ),
    settings: Object.fromEntries(
      Object.entries(printerSettings.value)
        .filter(([key]) => /^afc(?:$|_)/.test(key))
    ),
    printer: Object.fromEntries(
      Object.entries(printer)
        .filter(([key]) => /^afc(?:$|_)/.test(key))
    ),
  }

  const jsonString = JSON.stringify(output)
  const url = `data:text/plain;charset=utf-8,${encodeURIComponent(jsonString)}`

  downloadUrl('afc_debug.json', url)
}
</script>

<template>
  <v-row v-if="toolChangeCommands.length > 0">
    <v-col
      v-for="(toolChangeCommandsGroup, index2) in toolChangeCommandsGrouped"
      :key="index2"
      cols="12"
    >
      <app-btn-group
        class="app-toolchanger-control d-flex"
        :class="{
          [vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
        }"
      >
        <v-tooltip
          v-for="(macro, index) of toolChangeCommandsGroup"
          :key="index"
          top
        >
          <template #activator="{ on, attrs }">
            <app-btn
              v-bind="attrs"
              min-width="10"
              :color="macro.active ? 'primary' : undefined"
              :disabled="!klippyReady || printerPrinting"
              class="px-0 flex-grow-1"
              v-on="on"
              @click="sendGcode(macro.name)"
            >
              <v-icon
                v-if="macro.spoolId && getSpoolById(macro.spoolId)"
                class="mr-1 spool-icon"
                :color="getSpoolColor(getSpoolById(macro.spoolId))"
              >
                $filament
              </v-icon>
              <span
                v-else-if="macro.color"
                class="extruder-color mr-1"
                :class="{
                  active: macro.active
                }"
                :style="{
                  background: macro.color
                }"
              />
              {{ macro.name }}
            </app-btn>
          </template>
          {{ macro.description }}
        </v-tooltip>
      </app-btn-group>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useVuetify } from '@/composables/useVuetify'
import type { GcodeCommands } from '@/store/printer/types'
import type { Spool } from '@/store/spoolman/types'
import { chunk } from 'lodash-es'
import type { Macro } from '@/store/macros/types'

type ToolChangeCommand = {
  name: string,
  description: string,
  color?: string,
  active?: boolean,
  spoolId?: number
}

const { klippyReady, printerPrinting, sendGcode } = useStateMixin()
const { typedGetters } = useStore()
const { t } = useI18n()
const vuetify = useVuetify()

const availableCommands = computed((): GcodeCommands => typedGetters['printer/getAvailableCommands'])

const toolChangeCommands = computed((): ToolChangeCommand[] => {
  const commands = availableCommands.value

  return Object.keys(commands)
    .filter(command => /^t\d+$/i.test(command))
    .map((command): ToolChangeCommand => {
      const { help } = commands[command]
      const description = help && help !== 'G-Code macro'
        ? help
        : t('app.tool.tooltip.select_tool', { tool: command.substring(1) })

      const macro: Macro | undefined = typedGetters['macros/getMacroByName'](command)

      return {
        name: command,
        description,
        color: macro?.variables?.color ? `#${macro.variables.color}` : undefined,
        active: macro?.variables?.active === true,
        spoolId: macro?.variables?.spool_id ? +macro.variables.spool_id : undefined
      }
    })
    .sort((a, b) => +a.name.substring(1) - +b.name.substring(1))
})

const toolChangeCommandsGrouped = computed((): ToolChangeCommand[][] => {
  const commands = toolChangeCommands.value
  const cols = Math.ceil(commands.length / Math.ceil(commands.length / 6))
  return chunk(commands, cols)
})

function getSpoolById (id: number): Spool | undefined {
  return typedGetters['spoolman/getSpoolById'](id)
}

function getSpoolColor (spool: Spool | undefined) {
  return spool?.filament.color_hex ?? (vuetify.theme.dark ? '#fff' : '#000')
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  @include theme(app-toolchanger-control) using ($material) {
    .extruder-color {
      border-color: map-deep-get($material, 'text', 'primary');
    }
  }

  .app-toolchanger-control .extruder-color {
    width: 15px;
    height: 15px;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;

    &.active {
      border-color: map-deep-get($material-dark, 'text', 'primary');
    }
  }
</style>

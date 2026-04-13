<template>
  <app-btn-group divided>
    <app-btn
      v-bind="$attrs"
      :disabled="(macro.disabledWhilePrinting && printerPrinting) || !klippyReady"
      :style="borderStyle"
      class="flex-grow-1"
      v-on="filteredListeners"
      @click="handleClick"
    >
      <slot />
    </app-btn>
    <v-menu
      v-if="hasParams"
      left
      offset-y
      transition="slide-y-transition"
      :close-on-content-click="false"
    >
      <template #activator="{ on, attrs, value }">
        <app-btn
          v-bind="{...$attrs, ...attrs}"
          min-width="24"
          class="px-0"
          :disabled="(macro.disabledWhilePrinting && printerPrinting) || !klippyReady"
          v-on="on"
        >
          <v-icon
            small
            :class="{ 'rotate-180': value }"
          >
            $chevronDown
          </v-icon>
        </app-btn>
      </template>
      <v-form @submit.prevent="$emit('click', runCommand)">
        <v-card>
          <v-card-text class="pb-3 px-3">
            <v-row
              v-for="(param, key) in params"
              :key="key"
              style="max-width: 150px;"
            >
              <v-col>
                <v-text-field
                  v-model="param.value"
                  :type="isBasicGcodeCommand && !paramNameForRawGcodeCommand ? 'number' : undefined"
                  :label="key"
                  persistent-placeholder
                  outlined
                  dense
                  hide-details="auto"
                  spellcheck="false"
                  class="console-command"
                  :append-icon="param.value !== param.reset ? '$reset' : undefined"
                  @click:append="param.value = param.reset"
                  @focus="$event.target.select()"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions class="px-3 py-3">
            <app-btn
              block
              type="submit"
            >
              {{ $t('app.general.btn.send') }}
            </app-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-menu>
  </app-btn-group>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useListeners, set } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'
import type { Macro } from '@/store/macros/types'
import gcodeMacroParams from '@/util/gcode-macro-params'
import { gcodeCommandBuilder, isBasicGcodeCommand as checkIsBasicGcodeCommand, getParamNameForRawGcodeCommand } from '@/util/gcode-helpers'
import type { KlippyApp } from '@/store/printer/types'

defineOptions({ inheritAttrs: false })

type MacroParameter = {
  value: string | number
  reset: string | number
}

const props = defineProps<{
  macro: Macro
}>()

const emit = defineEmits<{
  (e: 'click', command: string): void
}>()

const { klippyReady, printerPrinting } = useStateMixin()
const { typedGetters } = useStore()
const listeners = useListeners()

const params = ref<Record<string, MacroParameter>>({})

const hasParams = computed(() => Object.keys(params.value).length > 0)

const macroName = computed(() => props.macro.name.toUpperCase())

const isBasicGcodeCommand = computed(() => checkIsBasicGcodeCommand(macroName.value))

const paramNameForRawGcodeCommand = computed(() => getParamNameForRawGcodeCommand(macroName.value))

const filteredListeners = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { click, ...rest } = listeners

  return rest
})

/**
 * The formatted run command for a macro.
 */
const runCommand = computed(() => gcodeCommandBuilder(macroName.value, params.value))

const borderStyle = computed(() => {
  if (props.macro?.color) {
    return `border-color: ${props.macro.color} !important; border-left: solid 4px ${props.macro.color} !important;`
  }
  return ''
})

const klippyApp = computed((): KlippyApp => typedGetters['printer/getKlippyApp'])

const supportsPythonGcodeMacros = computed(() => klippyApp.value.isKalicoOrDangerKlipper)

function handleClick () {
  emit('click', macroName.value)
}

onMounted(() => {
  const gcode = props.macro.config?.gcode

  if (!gcode) return

  const paramName = paramNameForRawGcodeCommand.value

  if (paramName) {
    set(params.value, paramName, { value: '', reset: '' })
  } else {
    if (
      supportsPythonGcodeMacros.value &&
      /^\s*!/.test(gcode)
    ) {
      return
    }

    for (const { name, value } of gcodeMacroParams(gcode)) {
      if (!name.startsWith('_') && !params.value[name]) {
        set(params.value, name, { value, reset: value })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
  .macro-params {
    height: 160px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
  .macro-params > * {
    flex: 1 1 40px;
  }

  .console-command :deep(.v-text-field__slot input) {
    font-family: monospace;
  }
</style>

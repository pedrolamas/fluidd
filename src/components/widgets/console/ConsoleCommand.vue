<template>
  <v-row class="ma-2">
    <v-col>
      <v-textarea
        ref="input"
        :rows="1"
        :value="newValue"
        :items="history"
        :disabled="disabled"
        :autofocus="autofocus"
        auto-grow
        clearable
        outlined
        single-line
        dense
        hide-details
        spellcheck="false"
        class="console-command"
        @input="emitChange"
        @keyup.enter.exact="emitSend(newValue)"
        @keydown.enter.exact.prevent
        @keydown.up.exact.prevent="historyUp()"
        @keydown.down.exact.prevent="historyDown()"
        @keydown.prevent.tab="autoComplete()"
      />
    </v-col>
    <v-col cols="auto">
      <app-btn
        :disabled="disabled"
        @click="emitSend(newValue)"
      >
        {{ $t('app.general.btn.send') }}
      </app-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Globals } from '@/globals'
import type { VTextField } from 'vuetify/lib'
import type { GcodeCommands } from '@/store/printer/types'
import { useStore } from '@/composables/useStore'

const { typedState, typedGetters, typedDispatch } = useStore()

const props = defineProps<{
  value?: string
  disabled?: boolean
  autofocus?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', val: string): void
  (e: 'send', val: string): void
}>()

const input = ref<VTextField>()
const newValue = ref('')
const commandHistoryCount = Globals.CONSOLE_COMMAND_HISTORY
const history = ref<string[]>([])
const originalHistory = ref<string[]>([])
const isFirst = ref(true)

const availableCommands = computed<GcodeCommands>(
  () => typedGetters['printer/getAvailableCommands']
)

watch(() => props.value, (val) => {
  if (val) {
    newValue.value = val
    input.value?.focus()
  } else {
    newValue.value = ''
  }
})

onMounted(() => {
  newValue.value = props.value ?? ''
  const savedHistory: string[] = typedState.console.commandHistory
  history.value = [...savedHistory]
  originalHistory.value = [...savedHistory]
})

function emitChange (val: string) {
  newValue.value = val
  emit('input', val)
}

function emitSend (val: string) {
  if (val && val.length > 0) {
    if (history.value.length >= commandHistoryCount) {
      originalHistory.value.pop()
    }
    originalHistory.value.unshift(val)
    typedDispatch('console/onUpdateCommandHistory', [...originalHistory.value])
    history.value = [...originalHistory.value]
    isFirst.value = true
    emit('send', val)
  }
}

function historyUp () {
  if (history.value.length >= 1) {
    if (!isFirst.value) {
      const f = history.value.shift()
      if (f != null) history.value.push(f)
    }
    emitChange(history.value[0])
    isFirst.value = false
  }
}

function historyDown () {
  if (history.value.length >= 1) {
    if (!isFirst.value) {
      const f = history.value.pop()
      if (f != null) history.value.unshift(f)
    }
    emitChange(history.value[0])
    isFirst.value = false
  }
}

function autoComplete () {
  if (newValue.value.length) {
    const commands = Object.keys(availableCommands.value)
      .filter(command => command.startsWith(newValue.value.toUpperCase()))

    if (commands.length === 1) {
      emitChange(commands[0])
    } else if (commands.length > 0) {
      const message = commands
        .map(command => `// ${command}: ${availableCommands.value[command].help ?? ''}`)
        .join('\n')
      typedDispatch('console/onAddConsoleEntry', { message, type: 'response' })
    }
  }
}
</script>

<style lang="scss" scoped>
  .console-command {
    font-family: monospace;
  }
</style>

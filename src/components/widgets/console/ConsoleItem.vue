<template>
  <v-layout class="console-item">
    <span
      v-if="value.time"
      class="secondary--text mr-3 d-none d-sm-block text-no-wrap"
    >
      {{ itemTime }}&nbsp;
    </span>
    <span
      v-safe-html="itemMessage"
      :class="itemClass"
      @click.capture="itemClick"
    />
  </v-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Globals } from '@/globals'
import { Filters } from '@/plugins/filters'
import type { ConsoleEntry } from '@/store/console/types'
import { useStore } from '@/composables/useStore'

const { typedGetters } = useStore()

const props = withDefaults(defineProps<{
  value?: ConsoleEntry
}>(), {
  value: () => ({}) as ConsoleEntry
})

const emit = defineEmits<{
  (e: 'click', command: string): void
}>()

const knownCommands = computed<Moonraker.KlippyApis.GcodeHelpResponse>(
  () => typedGetters['console/getAllKnownCommands']
)

const itemMessage = computed(() => {
  let message = props.value.message
  if (props.value.type === 'response') {
    message = props.value.message.replace(/([A-Z_][A-Z0-9_.]+)/g, (match, command) => {
      if (command in knownCommands.value) return `<a class="primary--text text--lighten-1">${command.toUpperCase()}</a>`
      return match
    })
  }
  return (props.value.type === 'command')
    ? `${Globals.CONSOLE_SEND_PREFIX}<a class="primary--text text--lighten-1">${message}</a>`
    : message
})

const itemTime = computed(() => (props.value.time)
  ? Filters.formatTimeWithSeconds(props.value.time * 1000)
  : ''
)

const itemClass = computed(() => {
  if (props.value.message?.startsWith('!!')) {
    return { 'error--text': true }
  }
  if (props.value.type === 'command') {
    return { 'primary--text': true }
  }
  return { 'secondary--text': true }
})

function itemClick (event: Event) {
  if (event.target instanceof HTMLAnchorElement) {
    const command = event.target.innerHTML
      .replace(/<br>/g, '\n')
      .replace(/^\s+|\s+$/gm, '')

    emit('click', command)
  }
}
</script>

<style lang="scss" scoped>
  .console-item {
    flex: 0 0 auto;
  }
</style>

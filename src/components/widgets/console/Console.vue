<template>
  <div class="console">
    <console-command
      v-if="!readonly && flipLayout"
      v-model="currentCommand"
      :disabled="!klippyConnected"
      :autofocus="fullscreen"
      @send="sendCommand"
    />
    <v-card
      ref="console-wrapper"
      flat
      class="console-wrapper"
    >
      <DynamicScroller
        ref="scroller"
        :items="flipLayout ? [...items].reverse() : items"
        :min-item-size="24"
        class="console-scroller"
        :class="{
          'console-scroller-fullscreen': fullscreen
        }"
        key-field="id"
        :buffer="600"
        @resize="scrollToLatest()"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[
              item.message,
            ]"
            :data-index="index"
          >
            <console-item
              :key="item.id"
              :value="item"
              class="console-item"
              @click="handleEntryClick"
            />
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </v-card>
    <console-command
      v-if="!readonly && !flipLayout"
      v-model="currentCommand"
      :disabled="!klippyConnected"
      :autofocus="fullscreen"
      @send="sendCommand"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { SocketActions } from '@/api/socketActions'
import ConsoleCommand from './ConsoleCommand.vue'
import ConsoleItem from './ConsoleItem.vue'
import type { DinamicScroller } from 'vue-virtual-scroller'
import type { ConsoleEntry } from '@/store/console/types'
import type { UpdateResponse } from '@/store/version/types'

const props = defineProps<{
  items: ConsoleEntry[] | UpdateResponse[]
  fullscreen?: boolean
  readonly?: boolean
  scrollingPaused?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:scrollingPaused', value: boolean): void
}>()

const { typedState, typedCommit } = useStore()
const { klippyConnected, sendGcode } = useStateMixin()

const scroller = ref<DinamicScroller>()
const _pauseScroll = ref(false)

const currentCommand = computed({
  get: (): string => typedState.console.consoleCommand,
  set: (val: string) => {
    typedCommit('console/setConsoleCommand', val)
  }
})

const flipLayout = computed((): boolean =>
  typedState.config.uiSettings.general.flipConsoleLayout
)

watch(flipLayout, () => {
  scrollToLatest(true)
})

onMounted(() => {
  if (scroller.value) {
    scroller.value.$el.addEventListener('scroll', onScroll)
  }
})

onBeforeUnmount(() => {
  if (scroller.value) {
    scroller.value.$el.removeEventListener('scroll', onScroll)
  }
})

watch(() => props.items, (_, oldItems) => {
  if (scroller.value) {
    const el = scroller.value.$el

    if (flipLayout.value && (_pauseScroll.value || !typedState.console.autoScroll)) {
      const { scrollHeight, clientHeight } = el

      if (scrollHeight > clientHeight) {
        nextTick(() => {
          el.scrollTop += el.scrollHeight - scrollHeight
        })
      }
    } else {
      scrollToLatest(oldItems?.length === 0)
    }
  }
}, { immediate: true })

function updateScrollingPaused () {
  nextTick(() => {
    if (!scroller.value) return
    const { scrollTop, scrollHeight, clientHeight } = scroller.value.$el

    const pauseScroll = flipLayout.value ? scrollTop > 1 : scrollHeight - scrollTop - clientHeight > 1

    if (_pauseScroll.value !== pauseScroll) {
      _pauseScroll.value = pauseScroll
      emit('update:scrollingPaused', pauseScroll)
    }
  })
}

function onScroll () {
  updateScrollingPaused()
}

function scrollToLatest (force?: boolean) {
  if (_pauseScroll.value && !force) return

  if (scroller.value) {
    if (
      typedState.console.autoScroll ||
      props.readonly ||
      force
    ) {
      if (flipLayout.value) {
        scroller.value.scrollToItem(0)
      } else {
        scroller.value.scrollToBottom()
      }
    }

    if (force) {
      // The fixed/floating nature of the console may only change if the scroll is forced.
      updateScrollingPaused()
    }
  }
}

function sendCommand (command?: string) {
  if (command && command.length) {
    // If clients detect M112 input from the console, we should invoke the emergency_stop endpoint
    if (command.trim().toLowerCase() === 'm112') {
      SocketActions.printerEmergencyStop()
    }
    sendGcode(command)
    currentCommand.value = ''
  }
}

function handleEntryClick (command: string) {
  currentCommand.value = command
}

defineExpose({ scrollToLatest, flipLayout })
</script>

<style lang="scss" scoped>
  .console-item {
    white-space: pre-wrap;
  }

  .console-wrapper {
    font-family: monospace;
    font-size: 1rem; // 15 px
    font-weight: 100 !important;
    padding-left: 4px;
  }

  .console-scroller {
    height: 300px;
  }
  .console-scroller-fullscreen {
    height: calc(100vh - 260px);
    height: calc(100svh - 260px);
  }

  .v-input {
    flex: 0 0 auto;
  }

  :deep(.vue-recycle-scroller__item-wrapper) {
    overflow: revert;
  }

</style>

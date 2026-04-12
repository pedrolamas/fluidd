<template>
  <v-tooltip
    right
    :disabled="isMobileViewport"
  >
    <template #activator="{ attrs, on }">
      <v-list-item
        :to="{ name: to }"
        :exact="exact"
        link
        color="secondary"
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon>{{ icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title><slot /></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <span>
      <slot />
      <kbd
        v-if="accelerator && enableKeyboardShortcuts"
        class="ml-2"
      >{{ accelerator }}</kbd>
    </span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { eventTargetIsContentEditable, keyboardEventToKeyboardShortcut } from '@/util/event-helpers'
import { Globals } from '@/globals'
import isKeyOf from '@/util/is-key-of'
import { useRoute, useRouter } from 'vue-router/composables'

const props = defineProps<{
  title?: string
  to: string
  exact?: boolean
  icon?: string
}>()

const { isMobileViewport } = useBrowserMixin()
const { typedState } = useStore()
const route = useRoute()
const router = useRouter()

const accelerator = computed<string | undefined>(() =>
  isKeyOf(props.to, Globals.KEYBOARD_SHORTCUTS)
    ? Globals.KEYBOARD_SHORTCUTS[props.to]
    : undefined
)

const enableKeyboardShortcuts = computed<boolean>(
  () => typedState.config.uiSettings.general.enableKeyboardShortcuts
)

function handleKeyDown (event: KeyboardEvent) {
  if (
    !enableKeyboardShortcuts.value ||
    !accelerator.value
  ) {
    return
  }

  const shortcut = keyboardEventToKeyboardShortcut(event)

  if (
    shortcut === accelerator.value &&
    !eventTargetIsContentEditable(event) &&
    route.name !== props.to
  ) {
    event.preventDefault()

    router.push({ name: props.to })
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, false)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  button {
    // font-size: 0.875rem;
    // font-family: raleway, sans-serif;
    // font-weight: 300;
    // text-decoration: none;

    height: inherit;
    padding: 16px 0px;
    width: 100%;

    overflow: hidden;
    display: inline-flex;
    flex-direction: column;
    flex: 0 1 auto;
    position: relative;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    outline: 0;
    user-select: none;
    white-space: nowrap;
  }

  button:before {
    background-color: currentColor;
    border-radius: inherit;
    bottom: 0;
    color: inherit;
    content: "";
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }

  button.active:before,
  button:hover::before {
    opacity: 0.08;
  }
</style>

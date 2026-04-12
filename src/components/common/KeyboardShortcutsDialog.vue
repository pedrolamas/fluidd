<template>
  <app-dialog
    v-model="open"
    :title="$t('app.keyboard_shortcuts.title.keyboard_shortcuts')"
    max-width="400"
    no-actions
  >
    <v-card-text class="pa-0">
      <v-card flat>
        <v-card-title>{{ $t('app.keyboard_shortcuts.label.navigation') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr>
              <th>{{ $t('app.general.title.home') }}</th>
              <td><kbd>{{ keyboardShortcuts.home }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.console') }}</th>
              <td><kbd>{{ keyboardShortcuts.console }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.gcode_preview') }}</th>
              <td><kbd>{{ keyboardShortcuts.gcode_preview }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.jobs') }}</th>
              <td><kbd>{{ keyboardShortcuts.jobs }}</kbd></td>
            </tr>
            <tr v-if="supportsHistory">
              <th>{{ $t('app.general.title.history') }}</th>
              <td><kbd>{{ keyboardShortcuts.history }}</kbd></td>
            </tr>
            <tr v-if="supportsTimelapse">
              <th>{{ $t('app.general.title.timelapse') }}</th>
              <td><kbd>{{ keyboardShortcuts.timelapse }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.tune') }}</th>
              <td><kbd>{{ keyboardShortcuts.tune }}</kbd></td>
            </tr>
            <tr v-if="enableDiagnostics">
              <th>{{ $t('app.general.title.diagnostics') }}</th>
              <td><kbd>{{ keyboardShortcuts.diagnostics }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.configure') }}</th>
              <td><kbd>{{ keyboardShortcuts.configure }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.system') }}</th>
              <td><kbd>{{ keyboardShortcuts.system }}</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.general.title.settings') }}</th>
              <td><kbd>{{ keyboardShortcuts.settings }}</kbd></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>

      <v-card flat>
        <v-card-title>{{ $t('app.keyboard_shortcuts.label.tool') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr>
              <th>{{ $t('app.keyboard_shortcuts.label.home_all') }}</th>
              <td><kbd>Shift</kbd> + <kbd>h</kbd></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>

      <v-card flat>
        <v-card-title>{{ $t('app.keyboard_shortcuts.label.printing') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr>
              <th>{{ $t('app.keyboard_shortcuts.label.pause') }}</th>
              <td><kbd>Shift</kbd> + <kbd>p</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.keyboard_shortcuts.label.cancel') }}</th>
              <td><kbd>Shift</kbd> + <kbd>c</kbd></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>

      <v-card flat>
        <v-card-title>{{ $t('app.keyboard_shortcuts.label.actions') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr>
              <th>{{ $t('app.keyboard_shortcuts.label.emergency_stop') }}</th>
              <td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>e</kbd></td>
            </tr>
            <tr>
              <th>{{ $t('app.keyboard_shortcuts.label.open_keyboard_shortcut_help') }}</th>
              <td><kbd>?</kbd></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Globals } from '@/globals'
import { eventTargetIsContentEditable, keyboardEventToKeyboardShortcut } from '@/util/event-helpers'
import { useStore } from '@/composables/useStore'

const { typedState, typedGetters } = useStore()

const open = ref(false)
const keyboardShortcuts = Globals.KEYBOARD_SHORTCUTS

const enableKeyboardShortcuts = computed(() => typedState.config.uiSettings.general.enableKeyboardShortcuts)
const supportsHistory = computed(() => typedGetters['server/componentSupport']('history'))
const supportsTimelapse = computed(() => typedGetters['server/componentSupport']('timelapse'))
const enableDiagnostics = computed(() => typedState.config.uiSettings.general.enableDiagnostics)

function handleKeyDown (event: KeyboardEvent) {
  if (!enableKeyboardShortcuts.value) return
  const shortcut = keyboardEventToKeyboardShortcut(event)
  if (['?', 'Shift+?'].includes(shortcut) && !eventTargetIsContentEditable(event)) {
    event.preventDefault()
    open.value = true
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown, false))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style lang="scss" scoped>
  td:nth-child(2) {
    text-align: right;
  }
</style>

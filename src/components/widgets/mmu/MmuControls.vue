<template>
  <v-container class="d-flex flex-column">
    <v-row dense>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              ref="refBtn"
              block
              small
              :class="btnClass"
              :disabled="!klippyReady || !canSend || [GATE_AVAILABLE, GATE_AVAILABLE_FROM_BUFFER].includes(currentGateStatus)"
              :loading="hasWait($waits.onMmuPreload)"
              v-on="on"
              @click="sendGcode('MMU_PRELOAD', $waits.onMmuPreload)"
            >
              <v-icon left>
                $mmuPreload
              </v-icon>
              {{ $t('app.mmu.btn.preload') }}
            </v-btn>
          </template>
          {{ $t('app.mmu.btn.preload') }}
        </v-tooltip>
      </v-col>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              block
              small
              :class="btnClass"
              :disabled="!klippyReady || !canSend || [GATE_EMPTY].includes(currentGateStatus)"
              :loading="hasWait($waits.onMmuEject)"
              v-on="on"
              @click="sendGcode('MMU_EJECT', $waits.onMmuEject)"
            >
              <v-icon left>
                $mmuEject
              </v-icon>
              {{ $t('app.mmu.btn.eject') }}
            </v-btn>
          </template>
          {{ $t('app.mmu.btn.eject') }}
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              block
              small
              :class="btnClass"
              :disabled="!klippyReady || !canSend"
              :loading="hasWait($waits.onMmuCheckGate)"
              v-on="on"
              @click="sendGcode('MMU_CHECK_GATE', $waits.onMmuCheckGate)"
            >
              <v-icon left>
                $mmuCheckGate
              </v-icon>
              {{ $t('app.mmu.btn.check_gate') }}
            </v-btn>
          </template>
          {{ $t('app.mmu.btn.check_gate') }}
        </v-tooltip>
      </v-col>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              block
              small
              :class="btnClass"
              :disabled="!klippyReady || !canSend"
              :loading="hasWait($waits.onMmuRecover)"
              v-on="on"
              @click="sendGcode('MMU_RECOVER', $waits.onMmuRecover)"
            >
              <v-icon left>
                $mmuRecover
              </v-icon>
              {{ $t('app.mmu.btn.recover') }}
            </v-btn>
          </template>
          {{ $t('app.mmu.btn.recover') }}
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="2" />
      <v-col cols="8">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              block
              small
              :class="btnClass"
              :disabled="!klippyReady || !canSend || !isMmuPausedAndLocked"
              :loading="hasWait($waits.onMmuUnload)"
              v-on="on"
              @click="sendGcode('MMU_UNLOCK', $waits.onMmuUnload)"
            >
              <v-icon left>
                $mmuUnlock
              </v-icon>
              {{ $t('app.mmu.btn.unlock') }}
            </v-btn>
          </template>
          {{ $t('app.mmu.btn.unlock') }}
        </v-tooltip>
      </v-col>
      <v-col cols="2" />
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              large
              block
              class="wrap-text-btn"
              :class="btnClass"
              :disabled="!klippyReady || !canSend || filamentPos === FILAMENT_POS_UNLOADED"
              :loading="hasWait($waits.onMmuUnload)"
              v-on="on"
              @click="sendGcode('MMU_UNLOAD', $waits.onMmuUnload)"
            >
              <v-icon left>
                $mmuUnload
              </v-icon>
              {{ unloadButtonText }}
            </v-btn>
          </template>
          {{ unloadButtonText }}
        </v-tooltip>
      </v-col>
      <v-col cols="6">
        <v-tooltip
          :disabled="!showTooltip"
          top
          color="secondary"
        >
          <template #activator="{ on }">
            <v-btn
              large
              block
              class="wrap-text-btn"
              :class="btnClass"
              :disabled="!klippyReady || !canSend || filamentPos !== FILAMENT_POS_UNLOADED"
              :loading="hasWait($waits.onMmuLoad)"
              v-on="on"
              @click="sendGcode('MMU_LOAD', $waits.onMmuLoad)"
            >
              <v-icon left>
                $mmuLoad
              </v-icon>
              {{ loadButtonText }}
            </v-btn>
          </template>
          {{ loadButtonText }}
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import type { VBtn } from 'vuetify/lib'
import { useStateMixin } from '@/composables/useStateMixin'
import { useMmuMixin, TOOL_GATE_BYPASS, FILAMENT_POS_UNLOADED, GATE_AVAILABLE, GATE_AVAILABLE_FROM_BUFFER, GATE_EMPTY } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { klippyReady, sendGcode, hasWait } = useStateMixin()
const { gate, filamentPos, canSend, isMmuPausedAndLocked } = useMmuMixin()
const { typedState } = useStore()
const { t } = useI18n()

const btnSize = ref(2)
const refBtn = ref<VBtn | null>(null)

const unloadButtonText = computed(() =>
  gate.value === TOOL_GATE_BYPASS ? t('app.mmu.btn.unload_ext') : t('app.mmu.btn.unload')
)

const loadButtonText = computed(() =>
  gate.value === TOOL_GATE_BYPASS ? t('app.mmu.btn.load_ext') : t('app.mmu.btn.load')
)

const btnClass = computed(() => {
  const classes = ['base-btn']
  if (btnSize.value === 0) classes.push('btn-no-text')
  else if (btnSize.value === 1) classes.push('btn-small-text')
  return classes
})

const showTooltip = computed(() => btnSize.value === 0)

const currentGateStatus = computed(() =>
  typedState.printer.printer.mmu?.gate_status?.[gate.value] ?? -1
)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function checkButtonWidth () {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    nextTick(() => {
      if (refBtn.value) {
        const width = (refBtn.value.$el as HTMLElement).offsetWidth ?? 0
        if (width === 0) btnSize.value = 2
        else if (width < 95) btnSize.value = 0
        else if (width < 120) btnSize.value = 1
        else btnSize.value = 2
      }
    })
  }, 500)
}

watch(() => typedState.config.uiSettings.mmu.largeFilamentStatus, () => {
  checkButtonWidth()
})

onMounted(() => {
  checkButtonWidth()
  window.addEventListener('resize', checkButtonWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkButtonWidth)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.base-btn {
    max-width: 100%;
    overflow: hidden;
}

.wrap-text-btn {
    min-height: 3em;
    display: inline-block;
    white-space: normal;
}

.btn-small-text {
    font-size: 0.6em;
}

.btn-small-text .v-icon {
    margin-right: 2px;
}

.btn-no-text {
    font-size: 0;
}

.btn-no-text .v-icon {
    margin-right: 0;
}
</style>

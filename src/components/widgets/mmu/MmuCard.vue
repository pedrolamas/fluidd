<template>
  <collapsable-card
    :title="title"
    icon="$mmu "
    draggable
    layout-path="dashboard.mmu-card"
  >
    <template #menu>
      <v-menu
        bottom
        left
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on, attrs, value }">
          <app-btn
            :disabled="!klippyReady || !enabled"
            v-bind="attrs"
            small
            class="me-1 my-1"
            v-on="on"
          >
            <v-icon
              small
              class="me-1"
            >
              $tools
            </v-icon>
            Tools
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
          <v-list-item @click="handleOpenEditTtgMapDialog">
            <v-list-item-icon>
              <v-icon left>
                $mmuEditTtgMap
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.edit_ttg_map') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="openEditGateMapDialog()">
            <v-list-item-icon>
              <v-icon left>
                $mmuEditGateMap
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.edit_gate_map') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!canSend"
            @click="showRecoverStateDialog = true"
          >
            <v-list-item-icon>
              <v-icon left>
                $mmuRecoverState
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.recover_state') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!canSend"
            @click="showMaintenanceDialog = true"
          >
            <v-list-item-icon>
              <v-icon left>
                $mmuMaintenance
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.mmu_maintenance') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider />

          <v-list-item
            :loading="hasWait($waits.onMmuStats)"
            @click="sendGcode('MMU_STATS SHOWCOUNTS=1', $waits.onMmuStats)"
          >
            <v-list-item-icon>
              <v-icon left>
                $mmuPrintStats
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.print_stats') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="spoolmanSupport === 'off'"
            :loading="hasWait($waits.onMmuSpoolman)"
            @click="handleSyncSpoolman()"
          >
            <v-list-item-icon>
              <v-icon left>
                $mmuSyncSpoolman
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.sync_spoolman') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            :disabled="!canSend"
            :loading="hasWait($waits.onMmuCheckGates)"
            @click="sendGcode('MMU_CHECK_GATES', $waits.onMmuCheckGates)"
          >
            <v-list-item-icon>
              <v-icon left>
                $mmuCheckAllGates
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.mmu.btn.check_all_gates') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <mmu-settings />
    </template>

    <div
      v-if="hasMmu"
      :class="{ 'mmu-disabled': !klippyReady || !enabled }"
    >
      <v-container
        fluid
        pa-2
      >
        <v-row align="start">
          <mmu-machine
            @select-gate="selectGate"
            @edit-filament="editFilament"
          />
        </v-row>
        <v-row align="start">
          <v-col
            :cols="col1Size"
            class="pt-0 d-flex flex-column align-center justify-center"
          >
            <div class="text--disabled smaller-font">
              {{ toolchangeText }}
            </div>
            <mmu-filament-status />
            <template v-if="showClogDetection">
              <div class="text-center">
                <mmu-clog-meter
                  v-if="hasEncoder"
                  width="40%"
                />
                <mmu-flowguard-meter
                  v-if="hasSyncFeedback"
                  width="40%"
                />
                <div class="text--disabled body-1">
                  {{ $t('app.mmu.label.clog_tangle_detection') }}
                </div>
              </div>
            </template>
          </v-col>
          <v-col
            :cols="12 - col1Size"
            class="d-flex flex-column align-center justify-center"
          >
            <template v-if="showDetails">
              <v-row
                class="pb-3 pt-0"
                style="align-self: flex-start; width: 100%"
              >
                <v-col class="pa-0">
                  <mmu-gate-summary :gate-index="gate" />
                </v-col>
              </v-row>
            </template>
            <v-divider style="width: 100%" />
            <mmu-controls />
            <v-divider style="width: 100%" />
            <template v-if="showTtgMap">
              <mmu-ttg-map
                :start-y="20"
                width="75%"
                :map="ttgMap"
                :groups="endlessSpoolGroups"
                :selected-tool="tool"
                :selected-gate="gate"
                @click="handleOpenEditTtgMapDialog"
              />
              <div class="text--disabled">
                {{ $t('app.mmu.label.tool_mapping') }}
              </div>
            </template>
          </v-col>
        </v-row>
        <v-row>
          <v-divider />
        </v-row>
        <v-row v-if="reasonForPause">
          <v-col
            cols="auto"
            class="d-flex align-center justify-center"
          >
            <v-icon class="error-icon">
              $mmuError
            </v-icon>
          </v-col>
          <v-col class="d-flex align-center">
            <div>
              <div class="text--secondary">
                <strong>Last Error</strong>
              </div>
              <div class="text--disabled smaller-font">
                {{ reasonForPause }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <mmu-recover-state-dialog v-model="showRecoverStateDialog" />
    <mmu-maintenance-dialog v-model="showMaintenanceDialog" />
    <mmu-edit-gate-map-dialog
      v-model="showEditGateMapDialog"
      :initial-gate="initialEditGate"
      @close="initialEditGate = null"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useMmuMixin, TOOL_GATE_BYPASS } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import MmuMachine from '@/components/widgets/mmu/MmuMachine.vue'
import MmuFilamentStatus from '@/components/widgets/mmu/MmuFilamentStatus.vue'
import MmuTtgMap from '@/components/widgets/mmu/MmuTtgMap.vue'
import MmuControls from '@/components/widgets/mmu/MmuControls.vue'
import MmuGateSummary from '@/components/widgets/mmu/MmuGateSummary.vue'
import MmuClogMeter from '@/components/widgets/mmu/MmuClogMeter.vue'
import MmuFlowguardMeter from '@/components/widgets/mmu/MmuFlowguardMeter.vue'
import MmuSettings from '@/components/widgets/mmu/MmuSettings.vue'
import MmuRecoverStateDialog from '@/components/widgets/mmu/MmuRecoverStateDialog.vue'
import MmuEditGateMapDialog from '@/components/widgets/mmu/MmuEditGateMapDialog.vue'
import MmuMaintenanceDialog from '@/components/widgets/mmu/MmuMaintenanceDialog.vue'

const { klippyReady, sendGcode, hasWait } = useStateMixin()
const {
  hasMmu, enabled, sensors, hasEncoder,
  ttgMap, endlessSpoolGroups, tool, gate,
  reasonForPause, toolchangeText, canSend,
  spoolmanSupport,
} = useMmuMixin()
const { typedState, typedCommit } = useStore()
const { tc } = useI18n()

const showRecoverStateDialog = ref(false)
const showEditGateMapDialog = ref(false)
const showMaintenanceDialog = ref(false)
const initialEditGate = ref<number | null>(null)

const col1Size = computed(() =>
  typedState.config.uiSettings.mmu.largeFilamentStatus ? 6 : 5
)

const title = computed(() => {
  const headline = tc('app.mmu.title.headline')
  if (hasMmu.value && !enabled.value) return `${headline} (disabled)`
  return headline
})

const hasFilamentProportionalSensor = computed(() => 'filament_proportional' in sensors.value)
const hasFilamentCompressionSensor = computed(() => 'filament_compression' in sensors.value)
const hasFilamentTensionSensor = computed(() => 'filament_tension' in sensors.value)

const hasSyncFeedback = computed(() =>
  hasFilamentCompressionSensor.value || hasFilamentTensionSensor.value || hasFilamentProportionalSensor.value
)

const showClogDetection = computed(() =>
  (hasEncoder.value || hasSyncFeedback.value) && typedState.config.uiSettings.mmu.showClogDetection
)

const showTtgMap = computed(() => typedState.config.uiSettings.mmu.showTtgMap)
const showDetails = computed(() => typedState.config.uiSettings.mmu.showDetails)

function handleSyncSpoolman () {
  sendGcode('MMU_SPOOLMAN REFRESH=1 QUIET=1', Waits.onMmuSpoolman)
}

function handleOpenEditTtgMapDialog () {
  typedCommit('mmu/setDialogState', { show: true })
}

function openEditGateMapDialog (g?: number | null) {
  initialEditGate.value = typeof g === 'number' ? g : null
  showEditGateMapDialog.value = true
}

function selectGate (g: number) {
  if (g === TOOL_GATE_BYPASS) {
    sendGcode('MMU_SELECT BYPASS=1', Waits.onMmuSelect)
    return
  }
  sendGcode(`MMU_SELECT GATE=${g}`, Waits.onMmuSelect)
}

function editFilament (g: number) {
  openEditGateMapDialog(g)
}
</script>

<style scoped>
.mmu-disabled {
    pointer-events: none !important;
    opacity: 0.5 !important;
}

.error-icon {
    color: red;
}

.smaller-font {
    font-size: 0.8em;
    min-height: 1.0em;
    line-height: 1.0em;
}
</style>

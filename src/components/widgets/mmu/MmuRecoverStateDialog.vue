<template>
  <app-dialog
    v-model="open"
    width="600"
    title-shadow
    :fullscreen="isMobileViewport"
    :title="$t('app.mmu.title.recover_state')"
    :save-button-text="$t('app.mmu.label.ok')"
    @save="commit"
  >
    <v-card-subtitle>
      {{ $t('app.mmu.msg.recover_intro') }}
    </v-card-subtitle>

    <v-card-text>
      <v-row class="fixed-height">
        <v-col class="col-1" />
        <v-col class="col-5 d-flex justify-center">
          <v-row class="d-flex flex-row">
            <v-col class="d-flex justify-center flex-column">
              <span class="settings-row-title">Tool</span>
              <span class="settings-row-subtitle">
                {{ $t('app.mmu.msg.set_tool') }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="col-5 d-flex justify-end align-center">
          <v-select
            v-model="selectedTool"
            :items="toolsList"
            :error-messages="toolErrorMessage"
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-divider class="my-2" />
      <v-row class="fixed-height">
        <v-col class="col-1" />
        <v-col class="col-5 d-flex justify-center">
          <v-row class="d-flex flex-row">
            <v-col class="d-flex justify-center flex-column">
              <span class="settings-row-title">Gate</span>
              <span class="settings-row-subtitle">
                {{ $t('app.mmu.msg.set_gate') }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="col-5 d-flex justify-end align-center">
          <v-select
            v-model="selectedGate"
            :items="gatesList"
            :error-messages="gateErrorMessage"
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-divider class="my-2" />
      <v-row class="fixed-height">
        <v-col class="col-1" />
        <v-col class="col-5 d-flex justify-center">
          <v-row class="d-flex flex-row">
            <v-col class="d-flex justify-center flex-column">
              <span class="settings-row-title">Filament Position</span>
              <span class="settings-row-subtitle">
                {{ $t('app.mmu.msg.filament_loaded') }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="col-5 d-flex justify-end align-center">
          <v-select
            v-model="selectedPos"
            :items="posList"
            :error-messages="posErrorMessage"
            outlined
            dense
          />
        </v-col>
      </v-row>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStateMixin } from '@/composables/useStateMixin'
import { useMmuMixin, TOOL_GATE_UNKNOWN, TOOL_GATE_BYPASS, FILAMENT_POS_UNKNOWN, FILAMENT_POS_UNLOADED, FILAMENT_POS_LOADED } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import isKeyOf from '@/util/is-key-of'

const props = defineProps<{
  value?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const open = computed({
  get: () => props.value ?? false,
  set: (v) => emit('input', v),
})

const { isMobileViewport } = useBrowserMixin()
const { sendGcode } = useStateMixin()
const { gate, tool, filamentPos, numGates, hasBypass, ttgMap } = useMmuMixin()
const { typedState } = useStore()
const { t } = useI18n()

const localGate = ref(-1)
const localTool = ref(-1)
const localFilamentPos = ref(-1)

watch(open, (newValue) => {
  if (newValue) {
    localGate.value = gate.value
    localTool.value = tool.value
    localFilamentPos.value = filamentPos.value
  }
})

function gateIndexText (gateIndex: number): string {
  const mmuMachine = typedState.printer.printer?.mmu_machine
  if (mmuMachine != null && mmuMachine.num_units > 1) {
    for (let i = 0; i < mmuMachine.num_units; i++) {
      const unitRef = `unit_${i}` as Klipper.MmuUnitKey
      if (isKeyOf(unitRef, mmuMachine)) {
        const unitObj = mmuMachine[unitRef]
        if (i > 0 && unitObj != null && gateIndex >= unitObj.first_gate && gateIndex < unitObj.first_gate + unitObj.num_gates) {
          return `${gateIndex} (unit #${i + 1})`
        }
      }
    }
  }
  return `${gateIndex}`
}

const toolsList = computed(() => {
  const tools: string[] = []
  for (let i = 0; i < numGates.value; i++) tools.push(`T${i}`)
  if (hasBypass.value) tools.push('Bypass')
  return tools
})

const selectedTool = computed({
  get: () => {
    if (localTool.value === TOOL_GATE_UNKNOWN) return 'Unknown'
    if (localTool.value === TOOL_GATE_BYPASS) return 'Bypass'
    return `T${localTool.value}`
  },
  set: (newTool: string) => {
    const index = toolsList.value.findIndex((item) => item === newTool)
    localTool.value = index === numGates.value ? TOOL_GATE_BYPASS : index
  },
})

const toolErrorMessage = computed(() => {
  if (localTool.value === TOOL_GATE_UNKNOWN) return t('app.mmu.msg.no_tool')
  if (localGate.value === TOOL_GATE_BYPASS && localTool.value !== TOOL_GATE_BYPASS) return t('app.mmu.msg.gate_bypass')
  return ''
})

const gatesList = computed(() => {
  const gates: string[] = []
  for (let g = 0; g < numGates.value; g++) gates.push(gateIndexText(g))
  if (hasBypass.value) gates.push('Bypass')
  return gates
})

const selectedGate = computed({
  get: () => {
    if (localGate.value === TOOL_GATE_UNKNOWN) return 'Unknown'
    if (localGate.value === TOOL_GATE_BYPASS) return 'Bypass'
    return `${gateIndexText(localGate.value)}`
  },
  set: (newGate: string) => {
    const index = gatesList.value.findIndex((item) => item === newGate)
    localGate.value = index === numGates.value ? TOOL_GATE_BYPASS : index
  },
})

const gateErrorMessage = computed(() => {
  if (localGate.value === TOOL_GATE_UNKNOWN) return t('app.mmu.msg.no_gate')
  if (localTool.value === TOOL_GATE_BYPASS && localGate.value !== TOOL_GATE_BYPASS) return t('app.mmu.msg.tool_bypass')
  if (localGate.value >= 0 && ttgMap.value[localGate.value] !== localTool.value) {
    const msg = t('app.mmu.msg.remap', { tool: `T${localTool.value}` })
    return `${t('app.mmu.msg.warning_prefix')} ${msg}`
  }
  return ''
})

const posList = ['UNKNOWN', 'UNLOADED', 'LOADED']

const selectedPos = computed({
  get: () => {
    if (localFilamentPos.value === FILAMENT_POS_UNLOADED) return 'UNLOADED'
    if (localFilamentPos.value === FILAMENT_POS_LOADED) return 'LOADED'
    return 'UNKNOWN'
  },
  set: (newPos: string) => {
    if (newPos === 'UNLOADED') localFilamentPos.value = FILAMENT_POS_UNLOADED
    else if (newPos === 'LOADED') localFilamentPos.value = FILAMENT_POS_LOADED
    else localFilamentPos.value = FILAMENT_POS_UNKNOWN
  },
})

const posErrorMessage = computed(() => {
  if (localFilamentPos.value === FILAMENT_POS_UNKNOWN) {
    return `${t('app.mmu.msg.warning_prefix')} ${t('app.mmu.msg.no_position')}`
  }
  return ''
})

function commit () {
  let cmd = `MMU_RECOVER TOOL=${localTool.value} GATE=${localGate.value}`
  if (localFilamentPos.value === FILAMENT_POS_UNLOADED) cmd += ' LOADED=0'
  else if (localFilamentPos.value === FILAMENT_POS_LOADED) cmd += ' LOADED=1'
  sendGcode(cmd)
  open.value = false
}
</script>

<style scoped>
.settings-row-title {
    display: block;
    width: 100%;
    font-weight: bold;
}

.settings-row-subtitle {
    display: block;
    font-size: 0.8em;
    line-height: 1.3;
    margin-top: 3px;
}

.fixed-height {
    min-height: 100px;
}
</style>

<template>
  <v-container>
    <v-row dense>
      <v-col
        v-for="index in unitArray"
        :key="index"
        cols="auto"
      >
        <div :class="unitClasses(index)">
          <mmu-unit
            :unit-index="index"
            :edit-gate-map="editGateMap"
            :edit-gate-selected="editGateSelected"
            :show-context-menu="showContextMenu"
            :show-details="showDetails"
            :hide-bypass="hideBypass"
            @select-gate="selectGate"
            @edit-filament="editFilament"
          />
        </div>
      </v-col>
      <v-col
        v-if="showStandaloneBypass && !hideBypass"
        key="bypass"
        cols="auto"
      >
        <div :class="unitClasses(-1)">
          <mmu-unit
            :unit-index="-1"
            :edit-gate-map="null"
            :show-context-menu="showContextMenu"
            :show-details="false"
            :show-footer="false"
            @select-gate="selectGate"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin } from '@/composables/useMmuMixin'
import { useVuetify } from '@/composables/useVuetify'
import type { MmuGateDetails } from '@/types'
import MmuUnit from '@/components/widgets/mmu/MmuUnit.vue'

withDefaults(defineProps<{
  editGateMap?: MmuGateDetails[] | null
  editGateSelected?: number
  showContextMenu?: boolean
  showDetails?: boolean
  hideBypass?: boolean
}>(), {
  editGateMap: null,
  editGateSelected: -1,
  showContextMenu: true,
  showDetails: true,
  hideBypass: false,
})

const emit = defineEmits<{
  (e: 'select-gate', gate: number): void
  (e: 'edit-filament', gate: number): void
}>()

const { numUnits, unitDetails } = useMmuMixin()
const vuetify = useVuetify()

const unitArray = computed(() =>
  Array.from({ length: numUnits.value }, (_, k) => k)
)

function unitClasses (index: number) {
  return {
    'mmu-unit': true,
    'mmu-unit-dark-theme': vuetify.theme.dark,
    'mmu-unit-light-theme': !vuetify.theme.dark,
    'mmu-unit-clear': index < 0,
  }
}

const showStandaloneBypass = computed(() => {
  for (let i = 0; i < numUnits.value; i++) {
    if (unitDetails(i).hasBypass) return false
  }
  return true
})

function selectGate (gate: number) {
  emit('select-gate', gate)
}

function editFilament (gate: number) {
  emit('edit-filament', gate)
}
</script>

<style scoped>
.mmu-unit {
    overflow: hidden;
    margin-left: 4px;
    margin-right: 4px;
    padding-left: 16px;
    padding-right: 16px;
    border-radius: 32px 32px 8px 8px;
}

.mmu-unit-light-theme {
    background: #f0f0f0;
    box-shadow: inset 0px 4px 2px -4px #2c2c2c80;
}

.mmu-unit-dark-theme {
    background: #2c2c2c;
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
}

.mmu-unit-clear {
    background: none !important;
    box-shadow: none !important;
}
</style>

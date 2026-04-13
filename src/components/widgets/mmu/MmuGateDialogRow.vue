<template>
  <tr
    :class="rowClass"
    @click="$emit('select-gate', details.index)"
    @mouseover="$emit('mouseover', details.index)"
    @mouseleave="$emit('mouseleave', details.index)"
  >
    <td>{{ details.index }}</td>
    <td class="pr-0 py-2">
      <mmu-spool
        :gate-index="details.index"
        :show-percent="false"
        style="height: 60px; float: left"
        class="mr-0"
      />
    </td>
    <td
      class="py-0"
      style="min-width: 250px; max-width: 250px"
    >
      <mmu-gate-summary
        :gate-index="details.index"
        :show-details="true"
        :show-gate="false"
        :compact="true"
      />
    </td>
    <td>
      <span
        class="es-group-icon"
        :style="{
          background: details.endlessSpoolGroup === selectedEsGroup ? 'limegreen' : 'none',
          cursor: 'context-menu',
        }"
        @click.stop="$emit('select-es', details.index)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GATE_EMPTY } from '@/composables/useMmuMixin'
import type { MmuGateDetails } from '@/types'
import MmuSpool from '@/components/widgets/mmu/MmuSpool.vue'
import MmuGateSummary from '@/components/widgets/mmu/MmuGateSummary.vue'

const props = defineProps<{
  details: MmuGateDetails
  selectedGate: number | null
  selectedEsGroup: number | null
}>()

defineEmits<{
  (e: 'select-gate', gate: number): void
  (e: 'select-es', gate: number): void
  (e: 'mouseover', gate: number): void
  (e: 'mouseleave', gate: number): void
}>()

const rowClass = computed(() => {
  const classes = ['cursor-pointer']
  if (props.details.index === props.selectedGate) classes.push('selected-row')
  if (props.details.status === GATE_EMPTY) classes.push('disabled-row')
  return classes
})
</script>

<style scoped>
.v-data-table__table {
    table-layout: fixed;
}

.selected-row {
    background: #595959;
}

.disabled-row {
    opacity: 0.7;
}

.es-group-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 25%;
    border: 1px solid var(--v-secondary-lighten3);
    vertical-align: middle;
}

.cursor-pointer {
    cursor: pointer;
}
</style>

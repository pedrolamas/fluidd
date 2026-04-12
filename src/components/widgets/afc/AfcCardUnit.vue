<template>
  <div>
    <v-row>
      <v-col class="pb-0 d-flex flex-row justify-space-between align-center">
        <h3 class="text-h6">
          <v-icon
            v-if="unitIcon"
            left
          >
            {{ unitIcon }}
          </v-icon>
          {{ $filters.prettyCase(unitName) }}
        </h3>
        <v-spacer />
        <afc-card-unit-hub
          v-for="hub in hubs"
          :key="hub"
          :name="hub"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex flex-row flex-wrap afc-unit-container">
        <afc-card-unit-lane
          v-for="lane in lanes"
          :key="lane"
          :name="lane"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'
import AfcCardUnitHub from '@/components/widgets/afc/AfcCardUnitHub.vue'
import AfcCardUnitLane from '@/components/widgets/afc/AfcCardUnitLane.vue'

const props = defineProps<{
  name: string
}>()

const { afcShowUnitIcons } = useAfcMixin()
const { typedState } = useStore()

const unitType = computed(() =>
  props.name.substring(0, props.name.indexOf(' ')).replace(/_/g, '')
)

const unitName = computed(() => props.name.substring(props.name.indexOf(' ') + 1))

const unit = computed((): Klipper.AfcUnitState | undefined => {
  const printer: Klipper.PrinterState = typedState.printer.printer
  const unitObjectName = `AFC_${unitType.value} ${unitName.value}`.toLowerCase()
  const unitObjectKey = Object.keys(printer)
    .find((key): key is Klipper.AfcUnitKey => key.toLowerCase() === unitObjectName)
  return unitObjectKey != null ? printer[unitObjectKey] : undefined
})

const hubs = computed(() => unit.value?.hubs ?? [])

const lanes = computed(() => unit.value?.lanes ?? [])

const unitIcon = computed((): string | null => {
  if (!afcShowUnitIcons.value) return null
  switch (unitType.value.toLowerCase()) {
    case 'boxturtle':
      return '$afcIconBoxTurtle'
    case 'htlf':
      return '$afcIconHtlf'
    case 'nightowl':
      return '$afcIconNightOwl'
    case 'quattrobox':
      return '$afcIconQuattroBox'
    default:
      return null
  }
})
</script>

<style scoped>
.afc-unit-container {
  gap: 16px;
}
</style>

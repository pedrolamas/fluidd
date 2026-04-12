<template>
  <div
    class="grey flex-grow-1 afc-unit-lane d-flex flex-column"
    :class="laneStatusClass"
  >
    <afc-card-unit-lane-header :name="name" />
    <template v-if="laneReady">
      <afc-card-unit-lane-body :name="name" />
      <afc-card-unit-lane-actions :name="name" />
    </template>
    <afc-card-unit-lane-empty
      v-else
      :name="name"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useVuetify } from '@/composables/useVuetify'
import AfcCardUnitLaneEmpty from '@/components/widgets/afc/AfcCardUnitLaneEmpty.vue'
import AfcCardUnitLaneHeader from '@/components/widgets/afc/AfcCardUnitLaneHeader.vue'
import AfcCardUnitLaneBody from '@/components/widgets/afc/AfcCardUnitLaneBody.vue'
import AfcCardUnitLaneActions from '@/components/widgets/afc/AfcCardUnitLaneActions.vue'

const props = defineProps<{
  name: string
}>()

const { afcCurrentLane, afcErrorState, getAfcLaneObject } = useAfcMixin()
const vuetify = useVuetify()

const lane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const laneActive = computed(() => props.name === afcCurrentLane.value?.name)

const laneStatusClass = computed(() => ({
  'darken-3': vuetify.theme.dark,
  'lighten-2': !vuetify.theme.dark,
  'border-error': laneActive.value && afcErrorState.value,
  'border-success': laneActive.value && !afcErrorState.value,
}))

const laneReady = computed(() =>
  lane.value?.load === true && lane.value.prep === true
)
</script>

<style scoped>
.afc-unit-lane {
  border-radius: 8px;
  box-sizing: border-box !important;
  border-width: 1px;
  border-style: solid;
  flex-basis: 0;
}

.v-application .border-error {
  border-color: var(--v-error-base) !important;
}

.v-application .border-success {
  border-color: var(--v-primary-base) !important;
}
</style>

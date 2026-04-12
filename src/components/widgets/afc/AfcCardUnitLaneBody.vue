<template>
  <div>
    <v-row class="my-3">
      <v-col class="pl-6 pr-0 pt-0 pb-0 d-flex flex-column">
        <v-tooltip
          top
          :disabled="!spoolId"
        >
          <template #activator="{ on, attr }">
            <span
              class="d-flex align-center justify-center"
              v-bind="attr"
              v-on="on"
            >
              <afc-filament-reel
                :percent="spoolPercent"
                :color="spoolColor"
                class="filamentSpool"
                @click-spool="onFilamentClick"
              />
            </span>
          </template>
          <span>
            #{{ spoolId }} | {{ spoolVendor }}
            <br>
            {{ spoolFilamentName }}
          </span>
        </v-tooltip>
        <afc-unit-lane-filament-dialog
          v-model="showFilamentDialog"
          :name="name"
        />
      </v-col>
      <v-col class="pr-6 pl-2 pt-0 pb-0 d-flex flex-column justify-space-between align-end">
        <v-btn
          v-if="afcShowLaneInfinite"
          x-small
          @click="showInfintiyDialog = true"
        >
          <v-icon
            v-if="runoutLane === 'NONE'"
            color="error"
            small
          >
            $afcIconInfinity
          </v-icon>
          <template v-else>
            {{ runoutLane }}
          </template>
        </v-btn>
        <afc-unit-lane-infinite-dialog
          v-model="showInfintiyDialog"
          :name="name"
        />
        <span class="font-weight-bold">
          {{ spoolMaterial }}
        </span>
        <span class="text--disabled">
          {{ spoolRemainingWeightOutput }}
        </span>
        <v-tooltip
          v-if="tdPresent"
          top
        >
          <template #activator="{ on, attr }">
            <span
              v-if="tdPresent"
              class="d-flex align-center justify-center text--disable"
              v-bind="attr"
              v-on="on"
            >
              TD - {{ td }}
            </span>
          </template>
          <span>
            Color - #{{ tdColor }}
          </span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row
      v-if="afcShowFilamentName"
      class="mb-0 mt-n3"
    >
      <v-col class="px-6 pt-1">
        <div class="position-relative pb-4">
          <span class="position-absolute text-truncate text-truncate-element text-center">
            {{ spoolFilamentName }}
          </span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import type { Spool, SpoolSelectionDialogState } from '@/store/spoolman/types'
import AfcUnitLaneInfiniteDialog from '@/components/widgets/afc/dialogs/AfcUnitLaneInfiniteDialog.vue'
import AfcUnitLaneFilamentDialog from '@/components/widgets/afc/dialogs/AfcUnitLaneFilamentDialog.vue'
import AfcFilamentReel from './AfcFilamentReel.vue'

const props = defineProps<{
  name: string
}>()

const { sendGcode } = useStateMixin()
const { afc, afcShowLaneInfinite, afcShowFilamentName, afcShowTd1Color, afcExistsSpoolman, getAfcLaneObject } = useAfcMixin()
const { typedState, typedGetters, typedCommit } = useStore()
const { t } = useI18n()

const showInfintiyDialog = ref(false)
const showFilamentDialog = ref(false)
const spoolmanSelection = ref(false)

const lane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const runoutLane = computed(() => lane.value?.runout_lane ?? 'NONE')

const spoolId = computed(() => lane.value?.spool_id ?? undefined)

const spool = computed((): Spool | null => {
  if (!spoolId.value) return null
  return typedGetters['spoolman/getSpoolById'](spoolId.value) ?? null
})

const spoolColor = computed(() => {
  if (
    afc.value?.td1_present &&
    lane.value?.td1_color &&
    afcShowTd1Color.value
  ) {
    return `#${lane.value.td1_color}`
  }
  return lane.value?.color || '#000000'
})

const spoolRemainingWeight = computed(() => Math.round(lane.value?.weight ?? 0))

const spoolRemainingWeightOutput = computed(() => `${spoolRemainingWeight.value} g`)

const spoolFullWeight = computed(() => spool.value?.initial_weight ?? 1000)

const spoolPercent = computed(() => {
  if (spoolFullWeight.value === 0) return 100
  return Math.round((spoolRemainingWeight.value / spoolFullWeight.value) * 100)
})

const spoolMaterial = computed(() => lane.value?.material || '--')

const spoolVendor = computed(() =>
  spool.value?.filament?.vendor?.name ?? t('app.afc.Unknown')
)

const spoolFilamentName = computed(() =>
  afcExistsSpoolman.value
    ? spool.value?.filament?.name ?? t('app.afc.Unknown')
    : ''
)

const tdPresent = computed(() => !!lane.value?.td1_td)

const td = computed(() => lane.value?.td1_td || '')

const tdColor = computed(() => lane.value?.td1_color || '')

function handleSelectSpool () {
  spoolmanSelection.value = true
  typedCommit('spoolman/setDialogState', {
    show: true,
    spoolSelectionOnly: true,
    selectedSpoolId: spoolId.value
  })
}

watch(() => typedState.spoolman.dialog, (dialog: SpoolSelectionDialogState) => {
  if (!dialog.show && spoolmanSelection.value) {
    spoolmanSelection.value = false
    if (dialog.selectedSpoolId !== spoolId.value) {
      sendGcode(`SET_SPOOL_ID LANE=${props.name} SPOOL_ID=${dialog.selectedSpoolId ?? ''}`)
    }
  }
})

function onFilamentClick () {
  if (afcExistsSpoolman.value) {
    handleSelectSpool()
    return
  }
  showFilamentDialog.value = true
}
</script>

<style scoped>
.filamentSpool {
  max-width: 38px;
  cursor: pointer;
}

.text-truncate-element {
  left: 0;
  right: 0;
}

.position-absolute {
    position: absolute !important;
}

.position-relative {
    position: relative !important;
}
</style>

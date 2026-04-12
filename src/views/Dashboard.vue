<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <template v-for="(container, containerIndex) in containers">
      <app-observed-column
        v-if="inLayout || hasCards(container)"
        :key="`container${containerIndex}`"
        cols="12"
        md="6"
        :lg="columnSpan"
        :class="{ 'drag': inLayout }"
      >
        <template #default="{ narrow }">
          <app-draggable
            v-model="containers[containerIndex]"
            class="list-group"
            :options="{
              group: 'dashboard',
              disabled: !inLayout,
            }"
            @end="handleUpdateLayout"
          >
            <template v-for="c in container">
              <component
                :is="c.id"
                v-if="inLayout || (c.enabled && !filtered(c))"
                :key="c.id"
                :narrow="narrow"
                class="mb-2 mb-md-4"
              />
            </template>
          </app-draggable>
        </template>
      </app-observed-column>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import PrinterStatusCard from '@/components/widgets/status/PrinterStatusCard.vue'
import JobsCard from '@/components/widgets/jobs/JobsCard.vue'
import ToolheadCard from '@/components/widgets/toolhead/ToolheadCard.vue'
import TemperatureCard from '@/components/widgets/thermals/TemperatureCard.vue'
import CameraCard from '@/components/widgets/camera/CameraCard.vue'
import MacrosCard from '@/components/widgets/macros/MacrosCard.vue'
import ConsoleCard from '@/components/widgets/console/ConsoleCard.vue'
import OutputsCard from '@/components/widgets/outputs/OutputsCard.vue'
import PrinterLimitsCard from '@/components/widgets/limits/PrinterLimitsCard.vue'
import RetractCard from '@/components/widgets/retract/RetractCard.vue'
import type { LayoutConfig, LayoutContainer } from '@/store/layout/types'
import BedMeshCard from '@/components/widgets/bedmesh/BedMeshCard.vue'
import GcodePreviewCard from '@/components/widgets/gcode-preview/GcodePreviewCard.vue'
import JobQueueCard from '@/components/widgets/job-queue/JobQueueCard.vue'
import SpoolmanCard from '@/components/widgets/spoolman/SpoolmanCard.vue'
import MmuCard from '@/components/widgets/mmu/MmuCard.vue'
import SensorsCard from '@/components/widgets/sensors/SensorsCard.vue'
import RunoutSensorsCard from '@/components/widgets/runout-sensors/RunoutSensorsCard.vue'
import BeaconCard from '@/components/widgets/beacon/BeaconCard.vue'
import AfcCard from '@/components/widgets/afc/AfcCard.vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

// Register all dashboard widget cards so they can be resolved by string ID
// via <component :is="c.id"> in the dynamic layout system
defineOptions({
  components: {
    PrinterStatusCard,
    JobsCard,
    ToolheadCard,
    TemperatureCard,
    CameraCard,
    MacrosCard,
    ConsoleCard,
    OutputsCard,
    PrinterLimitsCard,
    RetractCard,
    BedMeshCard,
    GcodePreviewCard,
    JobQueueCard,
    SpoolmanCard,
    MmuCard,
    SensorsCard,
    RunoutSensorsCard,
    BeaconCard,
    AfcCard
  }
})

const { typedState, typedGetters, typedCommit, typedDispatch } = useStore()
const { klippyReady } = useStateMixin()

const containers = ref<Array<LayoutConfig[]>>([])

const inLayout = computed<boolean>(() => typedState.config.layoutMode)

const layout = computed<LayoutContainer | undefined>(() => {
  const layoutName: string = typedGetters['layout/getSpecificLayoutName']
  return typedGetters['layout/getLayout'](layoutName)
})

const printerSettings = computed<Klipper.SettingsState>(() => typedGetters['printer/getPrinterSettings'])

const hasCameras = computed<boolean>(() => typedGetters['webcams/getEnabledWebcams'].length > 0)

const hasHeatersOrTemperatureSensors = computed<boolean>(() =>
  typedGetters['printer/getHeaters'].length > 0 ||
  typedGetters['printer/getOutputs'](['temperature_fan']).length > 0 ||
  typedGetters['printer/getSensors'].length > 0
)

const hasSensors = computed<boolean>(() => typedGetters['sensors/getSensors'].length > 0)

const firmwareRetractionEnabled = computed<boolean>(() => 'firmware_retraction' in printerSettings.value)

const supportsJobQueue = computed<boolean>(() => typedGetters['server/componentSupport']('job_queue'))

const supportsBedMesh = computed<boolean>(() => typedGetters['mesh/getSupportsBedMesh'])

const supportsBeacon = computed<boolean>(() => typedGetters['printer/getSupportsBeacon'])

const supportsRunoutSensors = computed<boolean>(() => typedGetters['printer/getRunoutSensors'].length > 0)

const supportsSpoolman = computed<boolean>(() => typedGetters['server/componentSupport']('spoolman'))

const supportsMmu = computed<boolean>(() => typedState.printer.printer.mmu != null)

const supportsAfc = computed<boolean>(() => typedGetters['printer/getSupportsAfc'])

const hasMacros = computed<boolean>(() => typedGetters['macros/getVisibleMacros'].length > 0)

const hasOutputs = computed<boolean>(() =>
  typedGetters['printer/getAllFans'].length > 0 ||
  typedGetters['printer/getAllPins'].length > 0 ||
  typedGetters['printer/getAllLeds'].length > 0
)

const columnCount = computed(() => {
  if (inLayout.value) return 4
  return containers.value.reduce((count, container) => +hasCards(container) + count, 0)
})

const columnSpan = computed(() => 12 / columnCount.value)

watch(columnCount, (value: number) => {
  typedCommit('config/setContainerColumnCount', value)
})

function onLayoutChange () {
  const newContainers: Array<LayoutConfig[]> = []

  for (let index = 1; index <= 4; index++) {
    const container = layout.value?.[`container${index}`]

    if (container && container.length > 0) {
      newContainers.push(container)
    }
  }

  while (newContainers.length < 4) {
    newContainers.push([])
  }

  containers.value = newContainers.slice(0, 4)
}

watch(layout, onLayoutChange)

function handleUpdateLayout () {
  const name: string = typedGetters['layout/getSpecificLayoutName']

  typedDispatch('layout/onLayoutChange', {
    name,
    value: {
      container1: containers.value[0],
      container2: containers.value[1],
      container3: containers.value[2],
      container4: containers.value[3]
    }
  })
}

function hasCards (container: LayoutConfig[]) {
  return container.some(card => card.enabled && !filtered(card))
}

function filtered (item: LayoutConfig) {
  // Take care of special cases.
  if (inLayout.value) return false
  if (item.id === 'camera-card' && !hasCameras.value) return true
  if (item.id === 'macros-card' && !hasMacros.value) return true
  if (item.id === 'outputs-card' && !hasOutputs.value) return true
  if (item.id === 'printer-status-card' && !klippyReady.value) return true
  if (item.id === 'job-queue-card' && !supportsJobQueue.value) return true
  if (item.id === 'retract-card' && !firmwareRetractionEnabled.value) return true
  if (item.id === 'bed-mesh-card' && !supportsBedMesh.value) return true
  if (item.id === 'beacon-card' && !supportsBeacon.value) return true
  if (item.id === 'runout-sensors-card' && !supportsRunoutSensors.value) return true
  if (item.id === 'spoolman-card' && !supportsSpoolman.value) return true
  if (item.id === 'mmu-card' && !supportsMmu.value) return true
  if (item.id === 'sensors-card' && !hasSensors.value) return true
  if (item.id === 'temperature-card' && !hasHeatersOrTemperatureSensors.value) return true
  if (item.id === 'afc-card' && !supportsAfc.value) return true

  // Otherwise return the opposite of whatever the enabled state is.
  return !item.enabled
}

onMounted(() => {
  onLayoutChange()
})
</script>

<style lang="scss" scoped>
@import '@/scss/draggable.scss';
</style>

<template>
  <v-row
    v-if="klippyReady"
    :dense="$vuetify.breakpoint.smAndDown"
  >
    <v-col
      v-if="supportsBedMesh"
      cols="12"
      md="8"
    >
      <bed-mesh-card fullscreen />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <bed-mesh-controls
        v-if="supportsBedMesh"
        class="mb-2 mb-md-4"
      />

      <end-stops-card
        v-if="supportsEndStops"
        class="mb-2 mb-md-4"
      />

      <runout-sensors-card
        v-if="supportsRunoutSensors"
        fullscreen
        class="mb-2 mb-md-4"
      />

      <beacon-card
        v-if="supportsBeacon"
        fullscreen
        class="mb-2 mb-md-4"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BedMeshCard from '@/components/widgets/bedmesh/BedMeshCard.vue'
import BedMeshControls from '@/components/widgets/bedmesh/BedMeshControls.vue'
import EndStopsCard from '@/components/widgets/endstops/EndStopsCard.vue'
import RunoutSensorsCard from '@/components/widgets/runout-sensors/RunoutSensorsCard.vue'
import BeaconCard from '@/components/widgets/beacon/BeaconCard.vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

const { typedGetters } = useStore()
const { klippyReady } = useStateMixin()

const supportsBedMesh = computed<boolean>(() => typedGetters['mesh/getSupportsBedMesh'])

const supportsEndStops = computed(() =>
  typedGetters['printer/getSteppers'].length > 0 ||
  typedGetters['printer/getProbe'] != null
)

const supportsRunoutSensors = computed(() => typedGetters['printer/getRunoutSensors'].length > 0)

const supportsBeacon = computed<boolean>(() => typedGetters['printer/getSupportsBeacon'])
</script>

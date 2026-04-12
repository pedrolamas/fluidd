<template>
  <collapsable-card
    :title="$t('app.general.title.bedmesh')"
    :lazy="false"
    icon="$bedMesh"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.bed-mesh-card"
  >
    <template #menu>
      <app-btn
        v-if="!fullscreen"
        small
        class="me-1 my-1"
        :loading="hasWait(Waits.onMeshCalibrate)"
        :disabled="printerBusy || !allHomed"
        @click="calibrate()"
      >
        {{ $t('app.general.btn.calibrate') }}
      </app-btn>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            icon
            :disabled="!hasMeshLoaded"
            v-on="on"
            @click="downloadImage()"
          >
            <v-icon dense>
              $screenshot
            </v-icon>
          </app-btn>
        </template>
        <span>{{ $t('app.bedmesh.tooltip.download_image') }}</span>
      </v-tooltip>

      <app-btn
        v-if="!fullscreen"
        icon
        @click="$filters.routeTo({ name: 'tune' })"
      >
        <v-icon dense>
          $fullScreen
        </v-icon>
      </app-btn>
    </template>

    <v-card-text>
      <bed-mesh-chart
        v-if="hasMeshLoaded"
        ref="bedMeshChartRef"
        :options="options"
        :data="series"
        :graphics="graphics"
        :height="(isMobileViewport) ? 225 : 525"
      />

      <span v-else>{{ $t('app.bedmesh.msg.not_loaded') }}</span>
    </v-card-text>
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BedMeshChart from './BedMeshChart.vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import type { AppMeshes, MatrixType } from '@/store/mesh/types'

defineProps<{
  fullscreen?: boolean
}>()

const { hasWait, sendGcode, printerBusy } = useStateMixin()
const { allHomed } = useToolheadMixin()
const { isMobileViewport } = useBrowserMixin()
const { typedGetters, typedState } = useStore()
const { t } = useI18n()

const bedMeshChartRef = ref<InstanceType<typeof BedMeshChart>>()

const matrix = computed<MatrixType>(() => typedState.mesh.matrix)
const scale = computed<number>(() => typedState.mesh.scale)
const boxScale = computed<number>(() => typedState.mesh.boxScale)
const wireframe = computed<boolean>(() => typedState.mesh.wireframe)
const flatSurface = computed<boolean>(() => typedState.mesh.flatSurface)
const mesh = computed<AppMeshes>(() => typedGetters['mesh/getCurrentMeshData'])

const hasMeshLoaded = computed(() => {
  const m = mesh.value
  const mx = matrix.value

  return m && m[mx] && m[mx].coordinates && m[mx].coordinates.length > 0
})

const options = computed(() => {
  const map_scale = scale.value / 2
  const box_scale = boxScale.value / 2

  let zMin = -Math.abs(map_scale - mesh.value[matrix.value].min)
  let zMax = map_scale + mesh.value[matrix.value].max
  if (scale.value === 0) {
    zMin = mesh.value[matrix.value].min
    zMax = mesh.value[matrix.value].max
  }

  const zBoxMin = -Math.abs(mesh.value[matrix.value].mid - box_scale)
  const zBoxMax = mesh.value[matrix.value].mid + box_scale

  const legends = series.value.reduce((obj, s) => {
    return Object.assign(
      obj,
      {
        [s.name]: (
          !s.name.endsWith('_flat') ||
          (
            flatSurface.value &&
            s.name.startsWith(matrix.value)
          )
        )
      }
    )
  }, Object.assign({}))

  return {
    legend: {
      show: false,
      selected: legends
    },
    visualMap: {
      min: zMin,
      max: zMax,
      dimension: 2,
      seriesIndex: 0
    },
    zAxis3D: {
      min: zBoxMin,
      max: zBoxMax
    }
  }
})

const series = computed(() => {
  const mx = matrix.value
  const wf = wireframe.value
  return [
    {
      type: 'surface',
      name: mx,
      shading: 'color',
      wireframe: {
        show: wf
      },
      data: mesh.value[mx].coordinates,
      dataShape: mesh.value[mx].dimensions
    },
    createFlatSeries('probed_matrix_flat'),
    createFlatSeries('mesh_matrix_flat')
  ]
})

const graphics = computed(() => {
  const { range } = mesh.value[matrix.value]

  return [{
    type: 'text',
    right: 10,
    top: 0,
    z: 100,
    silent: true,
    style: {
      text: `${t('app.general.label.range')}: ${range.toFixed(4)}`
    }
  }]
})

function createFlatSeries (mx: string) {
  return {
    type: 'surface',
    name: mx,
    itemStyle: {
      color: [0.5, 0.5, 0.5, 0.25]
    },
    wireframe: {
      show: wireframe.value,
      lineStyle: {
        opacity: 0.25,
        width: 1,
        color: '#ffffff'
      }
    },
    data: mesh.value[mx].coordinates,
    dataShape: mesh.value[mx].dimensions
  }
}

function calibrate () {
  sendGcode('BED_MESH_CALIBRATE', Waits.onMeshCalibrate)
}

function downloadImage () {
  bedMeshChartRef.value?.downloadImage()
}
</script>

<template>
  <div
    class="chart"
    :style="{
      height: $filters.getPixelsString(height)
    }"
  >
    <e-chart
      ref="chartRef"
      :option="opts"
      :update-options="{ notMerge: false }"
      :init-options="{ renderer: 'canvas' }"
      autoresize
    />

    <!-- <pre>legends: {{ opts.legend }}</pre> -->

    <!-- <pre>series: {{ opts.series.length }}</pre> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { ECharts, EChartsOption, GraphicComponentOption } from 'echarts'
import { merge, cloneDeepWith } from 'lodash-es'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import type { BedSize } from '@/store/printer/types'
import downloadUrl from '@/util/download-url'
import { Filters } from '@/plugins/filters'

const props = defineProps<{
  data: any[]
  graphics?: GraphicComponentOption[]
  options?: Record<string, unknown>
  height?: string | number
}>()

const { isMobileViewport } = useBrowserMixin()
const { typedGetters, typedState } = useStore()

const chartRef = ref<ECharts>()

const flatSurface = computed<boolean>(() => typedState.mesh.flatSurface)

const bedSize = computed<BedSize>(() => typedGetters['printer/getBedSize'])

watch(flatSurface, (value) => {
  const type = value ? 'legendSelect' : 'legendUnSelect'
  chartRef.value?.dispatchAction({
    type,
    name: 'mesh_matrix_flat'
  })
  chartRef.value?.dispatchAction({
    type,
    name: 'probed_matrix_flat'
  })
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  chartRef.value?.dispose()
})

const opts = computed<EChartsOption>(() => {
  const darkMode: boolean = typedState.config.uiSettings.theme.isDark

  const fontColor = (darkMode) ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'
  const fontSize = (isMobileViewport.value) ? 14 : 16
  const labelBackground = (darkMode) ? 'rgba(10,10,10,0.90)' : 'rgba(255,255,255,0.90)'
  const opacity = 0.10
  const lineColor = (darkMode) ? '#ffffff' : '#000000'
  const visualMap = {
    itemWidth: (isMobileViewport.value) ? 15 : 25,
    itemHeight: (isMobileViewport.value) ? 140 : 280
  }

  const axisCommon = {
    nameTextStyle: {
      color: fontColor
    },
    axisPointer: {
      lineStyle: {
        color: lineColor,
        opacity: 0.65
      },
      label: {
        margin: 16,
        color: fontColor,
        fontSize
      }
    },
    axisTick: {
      lineStyle: {
        color: lineColor,
        opacity
      }
    },
    axisLine: {
      lineStyle: {
        color: lineColor,
        opacity,
        width: 2
      }
    },
    axisLabel: {
      textStyle: {
        color: fontColor,
        fontSize
      }
    },
    splitLine: {
      lineStyle: {
        color: lineColor,
        opacity
      }
    }
  }

  const graphic = cloneDeepWith(props.graphics, g => {
    switch (g.type) {
      case 'text':
        return {
          ...g,
          style: {
            ...g.style,
            fill: fontColor,
            fontSize
          }
        }
      default:
        return undefined
    }
  })

  const result: EChartsOption = {
    legend: {
      show: false
    },
    textStyle: {
      fontFamily: 'Roboto'
    },
    darkMode,
    tooltip: {
      backgroundColor: labelBackground,
      borderColor: labelBackground,
      textStyle: {
        color: fontColor,
        fontSize: 18
      },
      formatter: (params: any) => {
        let text = ''
        if (params.value && Array.isArray(params.value)) {
          text += `
            <div>
              <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
              <span style="font-size:16px;color:${fontColor};font-weight:400;margin-left:2px">
                ${Filters.prettyCase(params.seriesName)}
              </span>
              <div style="clear: both"></div>
              <span style="font-size:16px;color:${fontColor};font-weight:400;margin-left:2px">
                x: ${params.value[0].toFixed(4)}
              </span>
              <div style="clear: both"></div>
              <span style="font-size:16px;color:${fontColor};font-weight:400;margin-left:2px">
                y: ${params.value[1].toFixed(4)}
              </span>
              <div style="clear: both"></div>
              <span style="font-size:16px;color:${fontColor};font-weight:400;margin-left:2px">
                z: ${params.value[2].toFixed(4)}
              </span>
              <div style="clear: both"></div>
            </div>
            `
        }
        return text
      }
    },
    visualMap: {
      type: 'continuous',
      textStyle: {
        color: fontColor,
        fontSize
      },
      realtime: true,
      calculable: true,
      show: true,
      top: 0,
      right: 'auto',
      bottom: 'auto',
      left: 0,
      dimension: 2,
      precision: 4,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      ...visualMap
    },
    xAxis3D: {
      type: 'value',
      min: bedSize.value.minX,
      max: bedSize.value.maxX,
      ...axisCommon
    },
    yAxis3D: {
      type: 'value',
      min: bedSize.value.minY,
      max: bedSize.value.maxY,
      ...axisCommon
    },
    zAxis3D: {
      type: 'value',
      min: -0.5,
      max: 0.5,
      ...axisCommon
    },
    grid3D: {
      viewControl: {
        // distance: 100,
        rotateSensitivity: 1.8,
        zoomSensitivity: 2,
        rotateMouseButton: 'left',
        panMouseButton: 'right'
      }
    },
    graphic,
    series: [...props.data]
  }

  // Merge the default options with the given prop.
  merge(result, props.options)
  return result
})

async function downloadImage () {
  const url = chartRef.value!.getDataURL({
    type: 'png',
    backgroundColor: '#262629'
  })

  const filename = [
    'bedmesh',
    typedState.printer.printer.bed_mesh?.profile_name
  ].filter(x => x).join('-')

  downloadUrl(filename, url)
}

defineExpose({ downloadImage })
</script>

<style lang="scss" scoped>
  .chart {
    margin-top: 16px;
    width: 100%;
    // height: 625px;
  }
</style>

<template>
  <div
    class="chart"
    :style="{
      height: $filters.getPixelsString(isMobileViewport ? 180 : 260)
    }"
  >
    <e-chart
      ref="chart"
      style="overflow: initial;"
      :option="options"
      :update-options="{ notMerge: true }"
      :init-options="{ renderer: 'svg' }"
      autoresize
      @legendselectchanged="handleLegendSelectChanged"
      @legendselected="handleLegendSelectChanged"
      @legendunselected="handleLegendSelectChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { watch } from 'vue'
import type { ECharts, EChartsOption, LineSeriesOption } from 'echarts'
import getKlipperType from '@/util/get-klipper-type'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useVuetify } from '@/composables/useVuetify'
import { Filters } from '@/plugins/filters'
import type { ChartData, ChartSelectedLegends } from '@/store/charts/types'

defineProps<{
  narrow?: boolean
}>()

const { typedState, typedGetters, typedDispatch } = useStore()
const { isMobileViewport } = useBrowserMixin()
const vuetify = useVuetify()

const chart = ref<ECharts>()
const loading = ref(false)
const series = ref<LineSeriesOption[]>([])
const initialSelected = ref<Record<string, boolean>>({})

const chartData = computed<Readonly<ChartData>[]>(() => typedState.charts.chart)
const chartableSensors = computed<string[]>(() => typedGetters['printer/getChartableSensors'])
const chartSelectedLegends = computed<ChartSelectedLegends>(() => typedState.charts.selectedLegends)

watch(chartData, (data) => {
  if (chart.value && !loading.value) {
    chart.value.setOption({
      dataset: {
        source: data
      }
    })
  }
})

onMounted(() => {
  init()
  loading.value = false
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  if (chart.value) {
    chart.value.dispose()
  }
})

function handleLegendSelectChanged (event: { selected: Record<string, boolean> }) {
  typedDispatch('charts/saveSelectedLegends', event.selected)

  if (chart.value && !loading.value) {
    const show = showPowerAxis(event.selected)

    chart.value.setOption({
      yAxis: [
        {},
        {
          show,
          axisLabel: { show }
        }
      ]
    })
  }
}

function init () {
  const dataKeys = Object.keys(chartData.value[0])
  const keys = chartableSensors.value

  keys.forEach((key) => {
    series.value.push(createSeries(key))
    if (dataKeys.includes(`${key}#target`)) series.value.push(createSeries(key, '#target'))
    if (dataKeys.includes(`${key}#power`)) series.value.push(createSeries(key, '#power'))
    if (dataKeys.includes(`${key}#speed`)) series.value.push(createSeries(key, '#speed'))
  })
}

const options = computed<EChartsOption>(() => {
  const isDark: boolean = typedState.config.uiSettings.theme.isDark

  const fontColor = (isDark) ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'
  const fontSize = (isMobileViewport.value) ? 13 : 14

  const lineStyle = {
    color: (isDark) ? '#ffffff' : '#000000',
    opacity: 0.05
  }

  const pointerStyle = {
    color: (isDark) ? '#ffffff' : '#000000',
    opacity: 0.5
  }

  const tooltip: EChartsOption['tooltip'] = {
    backgroundColor: (isDark) ? 'rgba(15,15,15,0.75)' : 'rgba(255,255,255,0.75)',
    borderColor: (isDark) ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
    textStyle: {
      color: fontColor,
      fontSize
    }
  }

  const theme = vuetify.theme.currentTheme
  const color: EChartsOption['color'] = [
    theme.primary?.toString() ?? '',
    theme.secondary?.toString() ?? ''
  ]
  const margin = isMobileViewport.value ? 12 : 16

  return {
    grid: {
      top: margin * 1.5,
      left: margin,
      right: margin,
      bottom: margin,
      containLabel: true
    },
    textStyle: {
      fontFamily: 'Roboto'
    },
    color,
    legend: {
      show: false,
      selected: initialSelected.value
    },
    tooltip: {
      ...tooltip,
      trigger: 'axis',
      confine: false,
      axisPointer: {
        type: 'line',
        lineStyle: pointerStyle,
        label: {
          color: fontColor,
          fontSize,
          backgroundColor: tooltip.backgroundColor
        }
      },
      position: (pos, params, el, elRect, size) => {
        const obj: Record<string, any> = { top: -10 }
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 10
        return obj
      },
      formatter: (params) => {
        if (!Array.isArray(params)) {
          return ''
        }

        let text = ''
        params
          .forEach((param: any) => {
            if (
              param.seriesName &&
              !param.seriesName.endsWith('#target') &&
              !param.seriesName.endsWith('#power') &&
              !param.seriesName.endsWith('#speed') &&
              param.value[param.seriesName] != null
            ) {
              const name = param.seriesName.trim().split(/\s+/).pop() || ''
              text += `
                <div>
                  ${param.marker}
                  <span style="font-size:${fontSize}px;color:${fontColor};font-weight:400;margin-left:2px">
                    ${Filters.prettyCase(name)}:
                  </span>
                  <span style="float:right;margin-left:20px;font-size:${fontSize}px;color:${fontColor};font-weight:900">
                    ${param.value[param.seriesName].toFixed(2)}<small>°C</small>`

              if (param.value[`${param.seriesName}#target`] != null) {
                text += ` / ${param.value[`${param.seriesName}#target`].toFixed()}<small>°C</small>`
              }
              if (param.value[`${param.seriesName}#power`] != null) {
                text += ` / ${(param.value[`${param.seriesName}#power`] * 100).toFixed()}<small>%</small>`
              }
              if (param.value[`${param.seriesName}#speed`] != null) {
                text += ` / ${(param.value[`${param.seriesName}#speed`] * 100).toFixed()}<small>%</small>`
              }
              text += `</span>
                <div style="clear: both"></div>
              </div>
              <div style="clear: both"></div>`
            }
          })
        return text
      }
    },
    xAxis: {
      type: 'time',
      max: 'dataMax',
      min: (value: any) => {
        const temperature_store_size: number = typedGetters['charts/getChartRetention']
        return value.max - (temperature_store_size * 1000)
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle
      },
      axisLabel: {
        margin: 14,
        color: tooltip.textStyle?.color,
        fontSize,
        formatter: '{H}:{mm}',
        rotate: isMobileViewport.value ? 45 : 0
      },
      axisPointer: {
        label: {
          show: true,
          margin: 9,
          formatter: (params) => Filters.formatTimeWithSeconds(params.value)
        }
      }
    },
    yAxis: [
      {
        name: 'Temperature °C',
        nameTextStyle: {
          fontSize,
          color: fontColor,
          align: 'left'
        },
        nameGap: 8,
        show: true,
        type: 'value',
        position: 'left',
        splitLine: { show: true, lineStyle },
        minInterval: 20,
        maxInterval: 60,
        min: (extent) => {
          const min = Math.floor(extent.min / 10) * 10

          return min === extent.min && (min - 10) >= 0
            ? min - 10
            : min
        },
        max: (extent) => {
          const max = Math.ceil(extent.max / 10) * 10

          return max === extent.max
            ? max + 10
            : max
        },
        axisLabel: {
          margin: 8,
          color: fontColor,
          fontSize,
          formatter: '{value}'
        },
        boundaryGap: [0, '100%']
      },
      {
        name: 'Power %',
        nameTextStyle: {
          fontSize,
          color: fontColor,
          align: 'right'
        },
        nameGap: 8,
        show: showPowerAxis(initialSelected.value),
        type: 'value',
        position: 'right',
        splitLine: { show: false, lineStyle },
        min: 0,
        max: 1,
        axisLabel: {
          show: showPowerAxis(initialSelected.value),
          margin: 8,
          color: fontColor,
          fontSize,
          formatter: (value) => `${value * 100}`
        },
        boundaryGap: [0, '100%']
      }
    ],
    dataZoom: [{
      type: 'inside',
      zoomOnMouseWheel: 'shift'
    }],
    series: series.value
  }
})

function createSeries (baseKey: string, subKey?: '#target' | '#power' | '#speed'): LineSeriesOption {
  const key = `${baseKey}${subKey ?? ''}`

  const color = (vuetify as any).$colorset?.next(getKlipperType(baseKey), baseKey)

  const s: LineSeriesOption = {
    name: key,
    type: 'line',
    yAxisIndex: 0,
    showSymbol: false,
    animation: false,
    color,
    emphasis: {
      lineStyle: {
        width: 1.5
      }
    },
    lineStyle: {
      color,
      type: 'solid',
      width: 1.5,
      opacity: 1
    },
    areaStyle: {
      opacity: 0.05
    },
    encode: {
      x: 'date',
      y: key
    }
  }

  if (subKey === '#target') {
    s.yAxisIndex = 0
    s.emphasis!.lineStyle!.width = 1
    s.lineStyle!.width = 1
    s.lineStyle!.type = 'dashed'
    s.lineStyle!.opacity = 0.8
    s.areaStyle!.opacity = 0
  }

  if (subKey === '#power' || subKey === '#speed') {
    s.yAxisIndex = 1
    s.emphasis!.lineStyle!.width = 1
    s.lineStyle!.width = 1
    s.lineStyle!.type = 'dotted'
    s.lineStyle!.opacity = 1
    s.areaStyle!.opacity = 0
  }

  initialSelected.value[key] = chartSelectedLegends.value[key] ?? (subKey !== '#power' && subKey !== '#speed')

  return s
}

function showPowerAxis (selected: Record<string, boolean>) {
  return Object.keys(selected)
    .some(key =>
      (
        key.endsWith('#power') ||
        key.endsWith('#speed')
      ) &&
      selected[key] === true
    )
}

function updateChartSelectedLegends (chartSelectedLegends: ChartSelectedLegends) {
  if (chart.value) {
    const entries = Object.entries(chartSelectedLegends)
    let index = entries.length

    for (const [name, value] of entries) {
      const silent = --index !== 0

      chart.value.dispatchAction({
        type: value
          ? 'legendSelect'
          : 'legendUnSelect',
        name
      }, {
        silent
      })
    }
  }
}

defineExpose({ updateChartSelectedLegends })
</script>

<style lang='scss' scoped>
  .chart {
    margin-top: 16px;
    width: 100%;
  }
</style>

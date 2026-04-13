<template>
  <collapsable-card
    :title="config.title"
    :icon="`$${config.icon}`"
    draggable
    :layout-path="`diagnostics.${config.id}`"
  >
    <template #menu>
      <app-btn-collapse-group>
        <app-btn
          small
          @click="$emit('edit', config)"
        >
          <v-icon
            small
            left
          >
            $edit
          </v-icon>
          {{ $t('app.general.title.edit_chart') }}
        </app-btn>
      </app-btn-collapse-group>
    </template>

    <app-chart
      class="mt-2"
      :data="chartData"
      :dimensions="chartDimensions"
      :height="`${config.height}px`"
      :options="options"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DiagnosticsCardConfig } from '@/store/diagnostics/types'
import type { EChartsOption, LineSeriesOption } from 'echarts'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useVuetify } from '@/composables/useVuetify'
import { Filters } from '@/plugins/filters'

type LineSeriesOptionExtended = LineSeriesOption & {
  unit?: string
  displayLegend?: boolean
}

const props = defineProps<{
  config: DiagnosticsCardConfig
}>()

defineEmits<{
  (e: 'edit', config: DiagnosticsCardConfig): void
}>()

const { isMobileViewport } = useBrowserMixin()
const { typedState, typedGetters } = useStore()
const vuetify = useVuetify()

const chartData = computed(() => typedState.charts.diagnostics || [])

const chartDimensions = computed(() => [
  'date',
  ...props.config.axes.flatMap(axis => axis.metrics.map(metric => metric.collector))
])

const series = computed((): LineSeriesOptionExtended[] => {
  const result: LineSeriesOptionExtended[] = []

  for (const [yAxisIndex, yAxis] of Object.entries(props.config.axes)) {
    if (!yAxis.enabled) {
      continue
    }

    for (const metric of yAxis.metrics) {
      result.push({
        name: metric.name,
        unit: yAxis.unit,
        displayLegend: metric.style.displayLegend,
        type: 'line',
        yAxisIndex: +yAxisIndex,
        showSymbol: false,
        animation: false,
        color: metric.style.lineColor,
        emphasis: {
          lineStyle: {
            width: 1.5
          }
        },
        lineStyle: {
          color: metric.style.lineColor,
          type: metric.style.lineStyle,
          width: 1.5,
          opacity: 1
        },
        areaStyle: {
          opacity: metric.style.fillOpacity / 100,
          color: metric.style.fillColor ?? metric.style.lineColor
        },
        encode: {
          x: 'date',
          y: metric.collector
        }
      })
    }
  }

  return result
})

function sanitize (value: any): string {
  return value
    .toString()
    .replace(/[^a-z0-9]/gi, (char: string) => `&#${char.charCodeAt(0)};`)
}

const options = computed((): EChartsOption => {
  const isDark: boolean = typedState.config.uiSettings.theme.isDark

  const fontColor = (isDark) ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'
  const fontSize = (isMobileViewport.value) ? 13 : 14

  const lineStyle = {
    color: (isDark) ? '#ffffff' : '#000000',
    opacity: 0.05
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

  const currentSeries = series.value

  return {
    grid: {
      top: 32,
      left: 16,
      right: 16,
      bottom: 16,
      containLabel: true
    },
    color,
    textStyle: {
      fontFamily: 'Roboto'
    },
    legend: {
      show: false
    },
    tooltip: {
      ...tooltip,
      trigger: 'axis',
      confine: false,
      axisPointer: {
        type: 'line',
        lineStyle,
        label: {
          color: fontColor,
          fontSize,
          backgroundColor: tooltip.backgroundColor
        }
      },
      formatter: (params) => {
        if (!Array.isArray(params)) {
          return ''
        }

        let text = ''
        params
          .forEach(param => {
            if (
              param == null ||
              param.data == null ||
              param.seriesIndex == null
            ) {
              return
            }

            const metric = currentSeries[param.seriesIndex]

            if (
              !metric.displayLegend ||
              metric.encode?.y == null
            ) {
              return
            }

            let value: unknown = param.data[metric.encode.y as keyof typeof param.data]
            if (typeof value === 'number') value = Math.round(value * 1000) / 1000
            else if (!value) value = '-'

            text += `
              <div>
                ${param.marker}
                <span style="font-size:${fontSize}px;color:${fontColor};font-weight:400;margin-left:2px">
                  ${sanitize(param.seriesName)}:
                </span>
                <span style="float:right;margin-left:20px;font-size:${fontSize}px;color:${fontColor};font-weight:900">
                  ${sanitize(value)} ${sanitize(metric.unit)}
                </span>
                <div style="clear: both"></div>
              </div>
              <div style="clear: both"></div>`
          })
        return text
      }
    },
    xAxis: {
      type: 'time',
      max: 'dataMax',
      min: (value: any) => {
        const retention: number = typedGetters['charts/getChartRetention']
        return value.max - (retention * 1000)
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
        color: (tooltip.textStyle as any)!.color,
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
    yAxis: props.config.axes
      .map((axis, index) => ({
        name: (axis.enabled && axis.showLegend) ? axis.unit : undefined,
        nameTextStyle: {
          fontSize,
          color: fontColor,
          align: index === 0 ? 'left' : 'right'
        },
        nameGap: 8,
        show: true,
        type: 'value',
        position: index === 0 ? 'left' : 'right',
        splitLine: { show: true, lineStyle },
        min: [undefined, ''].includes(axis.min as any) ? undefined : axis.min,
        max: [undefined, ''].includes(axis.max as any) ? undefined : axis.max,
        axisLabel: axis.showLegend
          ? {
              color: fontColor,
              fontSize,
              formatter: '{value}'
            }
          : undefined
      })),
    dataZoom: [{
      type: 'inside',
      zoomOnMouseWheel: 'shift'
    }],
    series: currentSeries
  }
})
</script>

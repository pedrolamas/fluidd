<template>
  <v-col
    v-if="ready"
    cols="4"
    class="chart-wrapper"
  >
    <app-chart
      :data="chartData"
      :options="options"
      height="120px"
    />

    <div class="chart-label-wrapper">
      <div class="chart-label">
        <span>{{ $t('app.system_info.label.system_load') }}</span>
        <span v-if="chartData.length">{{ chartData[chartData.length - 1].load }} / {{ cores }}</span>
      </div>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { EChartsOption, LineSeriesOption } from 'echarts'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { typedState, typedGetters } = useStore()
const { t } = useI18n()

const ready = ref(false)

const chartData = computed(() => typedState.charts.klipper || [])

const cores = computed((): number =>
  typedState.server.system_info?.cpu_info?.cpu_count || 1
)

const series = computed((): LineSeriesOption => ({
  ...typedGetters['charts/getBaseSeries'],
  name: t('app.system_info.label.load').toString(),
  encode: {
    x: 'date',
    y: 'load'
  }
}))

const options = computed((): EChartsOption => {
  const opts: EChartsOption = {
    ...typedGetters['charts/getBaseChartOptions'](),
    series: series.value
  }

  if (
    opts.yAxis &&
    !Array.isArray(opts.yAxis)
  ) {
    opts.yAxis.max = (value) => (
      value.max <= cores.value
        ? cores.value
        : value.max
    )
  }

  return opts
})

watch(chartData, (data) => {
  if (data && data.length > 0) ready.value = true
}, { immediate: true })
</script>

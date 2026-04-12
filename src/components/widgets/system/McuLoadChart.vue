<template>
  <v-col
    v-if="ready"
    cols="4"
    class="chart-wrapper"
  >
    <app-chart
      :data="chartData || []"
      :options="options"
      height="120px"
    />

    <div class="chart-label-wrapper">
      <div class="chart-label">
        <span>{{ $t('app.system_info.label.mcu_load', { mcu: mcu.prettyName }) }}</span>
        <span v-if="chartData.length">{{ chartData[chartData.length - 1].load }}%</span>
      </div>

      <div class="chart-label">
        <span>{{ $t('app.system_info.label.mcu_awake', { mcu: mcu.prettyName }) }}</span>
        <span v-if="chartData.length">{{ chartData[chartData.length - 1].awake }}%</span>
      </div>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MCU } from '@/store/printer/types'
import type { EChartsOption, LineSeriesOption } from 'echarts'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  mcu: MCU
}>()

const { typedState, typedGetters } = useStore()
const { t } = useI18n()

const ready = ref(false)

const chartData = computed(() => typedState.charts[props.mcu.key] || [])

const series = computed((): LineSeriesOption[] => [
  {
    ...typedGetters['charts/getBaseSeries'],
    name: t('app.system_info.label.load').toString(),
    encode: {
      x: 'date',
      y: 'load'
    }
  },
  {
    ...typedGetters['charts/getBaseSeries'],
    name: t('app.system_info.label.awake_time').toString(),
    encode: {
      x: 'date',
      y: 'awake'
    }
  }
])

const options = computed((): EChartsOption => {
  const opts: EChartsOption = {
    ...typedGetters['charts/getBaseChartOptions']({
      load: '%',
      awake: '%',
      bw: 'b'
    }),
    series: series.value
  }

  if (
    opts.yAxis &&
    !Array.isArray(opts.yAxis)
  ) {
    opts.yAxis.max = (value) => {
      // Grab the max, and add some buffer.
      if (value.max <= 10) return 15
      if (value.max <= 20) return 25
      if (value.max <= 30) return 35
      if (value.max <= 40) return 45
      if (value.max <= 50) return 55
      if (value.max <= 50) return 55
      if (value.max <= 60) return 65
      if (value.max <= 70) return 75
      if (value.max <= 80) return 85
      return value.max
    }
  }

  return opts
})

watch(chartData, (data) => {
  if (data && data.length > 0) ready.value = true
}, { immediate: true })
</script>

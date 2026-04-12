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
        <span>{{ $t('app.system_info.label.klipper_load') }}</span>
        <span v-if="chartData.length">{{ chartData[chartData.length - 1].cputime_change }}%</span>
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

const series = computed((): LineSeriesOption => ({
  ...typedGetters['charts/getBaseSeries'],
  name: t('app.system_info.label.load').toString(),
  encode: {
    x: 'date',
    y: 'cputime_change'
  }
}))

const options = computed((): EChartsOption => ({
  ...typedGetters['charts/getBaseChartOptions']({
    cputime_change: '%'
  }),
  series: series.value
}))

watch(chartData, (data) => {
  if (data && data.length > 0) ready.value = true
}, { immediate: true })
</script>

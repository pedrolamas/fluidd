<template>
  <div>
    <div
      class="chart"
      :style="{ 'height': height }"
    >
      <e-chart
        v-if="ready"
        ref="chart"
        style="overflow: initial;"
        :option="opts"
        :update-options="{ notMerge: true }"
        :init-options="{ renderer: 'svg' }"
        autoresize
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ECharts } from 'echarts'
import { merge } from 'lodash-es'

const props = withDefaults(defineProps<{
  data: unknown[]
  dimensions?: unknown[]
  options?: Record<string, unknown>
  height?: string
}>(), {
  options: () => ({}),
  height: '100%'
})

const chart = ref<ECharts>()
const ready = ref(false)

watch(() => props.data, (data) => {
  if (chart.value && data && data.length) {
    chart.value.setOption({
      dataset: {
        dimensions: props.dimensions,
        source: data
      }
    })
  }
})

const opts = computed(() => merge(
  { grid: { top: 0, left: 0, right: 0, bottom: 0 } },
  props.options
))

onMounted(() => {
  if (props.data && !ready.value) ready.value = true
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  if (chart.value) {
    chart.value.dispose()
  }
})
</script>

<style lang='scss' scoped>
  .chart {
    width: 100%;
  }
</style>

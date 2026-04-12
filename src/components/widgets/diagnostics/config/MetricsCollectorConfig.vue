<template>
  <v-card outlined>
    <v-textarea
      ref="textArea"
      v-model="metric.collector"
      class="px-4"
      :label="t('app.setting.label.collector')"
      spellcheck="false"
      auto-grow
      hide-details="auto"
    >
      <template #append>
        <app-btn
          icon
          small
          color="secondary"
          :title="t('app.general.tooltip.browse_metrics')"
          @click="browserOpen = true"
        >
          <v-icon>
            $magnify
          </v-icon>
        </app-btn>

        <app-btn
          icon
          small
          color="primary"
          :title="t('app.general.tooltip.run_collector')"
          @click="runCollector"
        >
          <v-icon>
            $play
          </v-icon>
        </app-btn>
      </template>
    </v-textarea>

    <app-setting :title="t('app.setting.label.last_result')">
      <v-text-field
        ref="resultField"
        filled
        dense
        single-line
        hide-details="auto"
        disabled
        :suffix="unit"
        :value="result"
      />
    </app-setting>

    <app-dialog
      v-if="browserOpen"
      v-model="browserOpen"
      :title="t('app.general.title.metrics_explorer')"
      max-width="1200"
      no-actions
    >
      <v-card-text>
        <state-explorer
          @input="handleExplorerClick"
        />
      </v-card-text>
    </app-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import type { Metric } from '@/store/diagnostics/types'
import sandboxedEval from '@/plugins/sandboxedEval'
import StateExplorer from '@/components/widgets/diagnostics/StateExplorer.vue'
import type { VTextarea } from 'vuetify/lib'

const props = defineProps<{
  metric: Metric
  unit: string
}>()

const metric = reactive<Metric>({ ...props.metric })

watch(() => props.metric, (v) => Object.assign(metric, v), { deep: true })

const { typedState } = useStore()
const { t } = useI18n()

const textArea = ref<VTextarea>()

const result = ref('-')
const browserOpen = ref(false)

async function runCollector () {
  try {
    const data = await sandboxedEval(`
      const printer = ${JSON.stringify(typedState.printer.printer)}
      return eval(${JSON.stringify(metric.collector)})
    `)

    result.value = String(
      typeof data === 'number'
        ? Math.round(data * 1000) / 1000
        : data
    )
  } catch (e) {
    result.value = String(e || 'Unknown Error')
  }
}

function handleExplorerClick (path: string) {
  browserOpen.value = false
  const element = textArea.value?.$refs.input
  if (element) {
    const selectionStart = element.selectionStart
    const selectionEnd = element.selectionEnd

    metric.collector = (
      metric.collector.substring(0, selectionStart) +
      path +
      metric.collector.substring(selectionEnd)
    )
  }
}
</script>

<template>
  <app-dialog
    v-model="open"
    :title="(config.id !== '') ? $t('app.general.title.edit_chart') : $t('app.general.title.add_chart')"
    max-width="800"
  >
    <v-card-text>
      <v-stepper
        v-model="currentStep"
        non-linear
        flat
      >
        <v-stepper-header>
          <template v-for="(step, index) of steps">
            <v-stepper-step
              :key="`step-${index}`"
              :step="index + 1"
              editable
            >
              {{ step.name }}
            </v-stepper-step>

            <v-divider
              v-if="index < steps.length - 1"
              :key="index"
            />
          </template>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content
            v-for="(step, index) of steps"
            :key="`${index}-content`"
            class="pa-0"
            :step="index + 1"
          >
            <component
              :is="step.component"
              v-if="currentStep === index + 1"
              :config="config"
            />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card-text>

    <template #actions>
      <v-spacer v-if="isMobileViewport" />

      <app-btn
        v-if="config.id !== ''"
        color="error"
        text
        @click="handleDelete"
      >
        {{ $t('app.general.btn.remove') }}
      </app-btn>

      <v-spacer v-if="!isMobileViewport" />

      <app-btn
        color="warning"
        text
        @click="open = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
      <app-btn
        color="primary"
        @click="handleSave"
      >
        {{ (config.id !== '') ? $t('app.general.btn.save') : $t('app.general.btn.add') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DiagnosticsCardConfig } from '@/store/diagnostics/types'
import CardConfigStep from './config/CardConfigStep.vue'
import AxesConfigStep from './config/AxesConfigStep.vue'
import MetricsConfigStep from './config/MetricsConfigStep.vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  value?: boolean
  config: DiagnosticsCardConfig
}>()

const emit = defineEmits<{
  (e: 'save', config: DiagnosticsCardConfig): void
  (e: 'delete', id: string): void
  (e: 'input', v: boolean | undefined): void
}>()

const open = computed({
  get: () => props.value ?? false,
  set: (v) => emit('input', v)
})

const { isMobileViewport } = useBrowserMixin()
const { t } = useI18n()

const currentStep = ref(1)
const steps = [
  { name: t('app.setting.label.card'), component: CardConfigStep },
  { name: t('app.setting.label.axes'), component: AxesConfigStep },
  { name: t('app.setting.label.metrics'), component: MetricsConfigStep }
]

function handleSave () {
  emit('save', props.config)
  open.value = false
}

function handleDelete () {
  emit('delete', props.config.id)
  open.value = false
}
</script>

<style lang="scss" scoped>
.v-stepper {
  background: transparent;
}
</style>

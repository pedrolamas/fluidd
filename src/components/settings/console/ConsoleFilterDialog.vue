<template>
  <app-dialog
    v-model="open"
    :title="filter.id ? $t('app.general.label.edit_filter') : $t('app.general.label.add_filter')"
    max-width="500"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting
        :title="$t('app.setting.label.enable')"
        :r-cols="8"
      >
        <v-switch
          v-model="filter.enabled"
          class="mt-0"
          hide-details="auto"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.name')"
        :r-cols="8"
      >
        <v-text-field
          v-model="filter.name"
          filled
          dense
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required,
            customRules.uniqueName
          ]"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.type')"
        :r-cols="8"
      >
        <v-select
          v-model="filter.type"
          filled
          dense
          single-line
          hide-details="auto"
          :items="types"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="type.text"
        :r-cols="8"
      >
        <v-text-field
          v-model="filter.value"
          filled
          dense
          spellcheck="false"
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required,
            ...type.rules
          ]"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleFilter } from '@/store/console/types'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Rules } from '@/plugins/filters'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const props = defineProps<{
  filter: ConsoleFilter
}>()
const emit = defineEmits<{
  (e: 'save', filter: ConsoleFilter): void
}>()

const filter = computed(() => props.filter)

const { typedState } = useStore()
const { t } = useI18n()

const filters = computed((): ConsoleFilter[] => typedState.console.consoleFilters)

const customRules = computed(() => ({
  uniqueName: (v: string) => !filters.value.some((c: ConsoleFilter) => c.id !== props.filter.id && c.name.toLowerCase() === v.toLowerCase()) || t('app.general.simple_form.error.exists')
}))

const types = computed(() => [
  {
    text: t('app.setting.label.contains'),
    value: 'contains',
    rules: [] as ((v: string) => boolean | string)[]
  },
  {
    text: t('app.setting.label.starts_with'),
    value: 'starts-with',
    rules: [] as ((v: string) => boolean | string)[]
  },
  {
    text: t('app.setting.label.expression'),
    value: 'expression',
    rules: [
      Rules.regExpPatternValid
    ]
  }
])

const type = computed(() => types.value.find(f => f.value === props.filter?.type) || types.value[0])

function handleSave () {
  emit('save', props.filter)
  open.value = false
}
</script>

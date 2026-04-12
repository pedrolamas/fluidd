<template>
  <app-dialog
    v-model="open"
    :title="macro.name.toUpperCase()"
    :sub-title="macro.description"
    max-width="480"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="$t('app.general.label.alias')">
        <v-text-field
          v-model="macro.alias"
          dense
          filled
          hide-details
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.general.label.category')">
        <v-select
          v-model="macro.categoryId"
          :items="categories"
          hide-details
          dense
          filled
          item-value="id"
          item-text="name"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.general.label.color')">
        <app-btn
          outlined
          small
          color="primary"
          class="mr-1"
          @click="handleResetColor"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
        <app-color-picker
          v-model="color"
          :title="$t('app.general.btn.set_color')"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.general.label.disabled_while_printing')">
        <v-switch
          v-model="macro.disabledWhilePrinting"
          class="mt-0 pt-0"
          color="primary"
          hide-details
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.visible')"
      >
        <v-switch
          v-model="macro.visible"
          class="mt-0 pt-0"
          color="primary"
          hide-details
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Macro, MacroCategory } from '@/store/macros/types'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useVuetify } from '@/composables/useVuetify'

const props = defineProps<{
  value?: boolean
  macro: Macro
}>()
const emit = defineEmits<{
  (e: 'input', v: boolean | undefined): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v)
})

const macro = reactive({ ...props.macro })

watch(() => props.macro, (v) => Object.assign(macro, v), { deep: true })

const { typedGetters, typedDispatch } = useStore()
const { t } = useI18n()
const vuetify = useVuetify()

const categories = computed(() => {
  // Grabs all categories and filters by the currently defined one.
  const cats: MacroCategory[] = [...typedGetters['macros/getCategories']]
  cats.unshift({ name: t('app.general.label.uncategorized'), id: '0' })
  return cats
})

const color = computed({
  get: (): string | undefined => macro.color || vuetify.theme.currentTheme.secondary?.toString(),
  set: (value: string | undefined) => {
    macro.color = value
  }
})

function handleResetColor () {
  macro.color = undefined
}

function handleSave () {
  typedDispatch('macros/saveMacro', macro)
  open.value = false
}
</script>

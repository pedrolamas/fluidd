<template>
  <app-dialog
    v-model="open"
    :title="title"
    max-width="350"
    @save="handleSave"
  >
    <v-card-text>
      <v-text-field
        v-model="newName"
        autofocus
        outlined
        :label="label"
        :rules="[
          Rules.required,
          customRules.uniqueName
        ]"
        required
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MacroCategory } from '@/store/macros/types'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Rules } from '@/plugins/filters'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const props = defineProps<{
  title: string
  label: string
  name: string
}>()
const emit = defineEmits<{
  (e: 'save', name: string): void
}>()

const { typedGetters } = useStore()
const { t } = useI18n()

const newName = ref('')

const categories = computed((): MacroCategory[] => typedGetters['macros/getCategories'])

const customRules = computed(() => ({
  uniqueName: (v: string) => categories.value.findIndex(c => c.name.toLowerCase() === v.toLowerCase()) < 0 || t('app.general.simple_form.error.exists')
}))

onMounted(() => {
  newName.value = props.name
})

function handleSave () {
  emit('save', newName.value)
  open.value = false
}
</script>

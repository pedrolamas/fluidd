<template>
  <app-dialog
    v-model="open"
    :title="t('app.general.title.pending_configuration_changes')"
    :save-button-text="t('app.general.btn.save_config_and_restart')"
    max-width="600"
    @save="handleSubmit"
  >
    <v-card-text>
      <v-textarea
        readonly
        auto-grow
        rows="1"
        :value="saveConfigPendingItems"
        spellcheck="false"
        style="width: 100%; font-family: monospace; font-size: 1rem; font-weight: 100 !important;"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const { typedGetters } = useStore()
const { t } = useI18n()

const saveConfigPendingItems = computed(() => {
  const saveConfigPendingItems: Klipper.ConfigState = typedGetters['printer/getSaveConfigPendingItems']

  const { changed, deleted } = Object.entries(saveConfigPendingItems)
    .reduce<{ changed: string[], deleted: string[] }>((previous, [sectionName, sectionEntries]) => {
      if (sectionEntries == null) {
        previous.deleted.push(`# [${sectionName}]`)
      } else {
        const sectionEntryNameValues = Object.entries(sectionEntries)
          .map(([entryName, entryValue]) => `${entryName}: ${entryValue}`)

        previous.changed.push(`[${sectionName}]\n${sectionEntryNameValues.join('\n')}`)
      }

      return previous
    }, { changed: [], deleted: [] })

  const lines = [...changed]

  if (deleted.length > 0) {
    lines.push(`# ${t('app.general.msg.pending_configuration_sections_deleted')}\n${deleted.join('\n')}`)
  }

  return lines.join('\n\n')
})

function handleSubmit () {
  open.value = false
  emit('save')
}
</script>

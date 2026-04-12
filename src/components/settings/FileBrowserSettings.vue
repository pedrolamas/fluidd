<template>
  <div>
    <v-subheader id="browser">
      {{ $t('app.setting.title.file_browser') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting :title="$t('app.setting.label.text_sort_order')">
        <v-select
          v-model="textSortOrder"
          filled
          dense
          hide-details="auto"
          :items="availableTextSortOrders"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.drag_and_drop_functionality_for_files_and_folders')"
      >
        <v-switch
          v-model="filesAndFoldersDragAndDrop"
          hide-details
          @click.native.stop
        />
      </app-setting>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextSortOrder } from '@/store/config/types'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { typedState, typedDispatch } = useStore()
const { t } = useI18n()

const textSortOrder = computed({
  get: (): TextSortOrder => typedState.config.uiSettings.general.textSortOrder,
  set: (value: TextSortOrder) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.textSortOrder',
    value,
    server: true
  })
})

const availableTextSortOrders = computed(() => [
  {
    value: 'default',
    text: t('app.general.label.default')
  },
  {
    value: 'numeric-prefix',
    text: t('app.general.label.numeric_prefix_sort')
  },
  {
    value: 'version',
    text: t('app.general.label.version_sort')
  }
])

const filesAndFoldersDragAndDrop = computed({
  get: (): boolean => typedState.config.uiSettings.general.filesAndFoldersDragAndDrop,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.filesAndFoldersDragAndDrop',
    value,
    server: true
  })
})
</script>

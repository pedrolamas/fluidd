<template>
  <div>
    <v-subheader id="console">
      {{ t('app.setting.title.console') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting :title="tc('app.setting.label.filter', 2)">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleEditFilterDialog(null)"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ t('app.setting.btn.add_filter') }}
        </app-btn>
      </app-setting>

      <template v-for="filter in filters">
        <v-divider :key="`divider-${filter.name}`" />

        <app-setting
          :key="`filter-${filter.name}`"
          :r-cols="3"
        >
          <template #title>
            {{ filter.name }}
          </template>

          <app-btn
            icon
            @click.stop="handleEditFilterDialog(filter)"
          >
            <v-icon dense>
              $edit
            </v-icon>
          </app-btn>

          <app-btn
            icon
            @click.stop="handleRemoveFilter(filter)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </app-setting>
      </template>

      <console-filter-dialog
        v-if="dialogState.open"
        v-model="dialogState.open"
        :filter="dialogState.filter"
        @save="handleSaveFilter"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import type { ConsoleFilter } from '@/store/console/types'
import ConsoleFilterDialog from './ConsoleFilterDialog.vue'

const { typedState, typedDispatch } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()

const dialogState = reactive<{ open: boolean; filter: ConsoleFilter | null }>({
  open: false,
  filter: null
})

const filters = computed((): ConsoleFilter[] => typedState.console.consoleFilters)

function handleEditFilterDialog (filter: ConsoleFilter | null) {
  const filterCopy: ConsoleFilter = filter
    ? { ...filter }
    : {
        id: '',
        enabled: true,
        name: '',
        type: 'contains',
        value: ''
      }

  dialogState.open = true
  dialogState.filter = filterCopy
}

async function handleRemoveFilter (filter: ConsoleFilter) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_console_filter', { name: filter.name }),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    typedDispatch('console/onRemoveFilter', filter)
  }
}

function handleSaveFilter (filter: ConsoleFilter) {
  typedDispatch('console/onSaveFilter', filter)
}
</script>

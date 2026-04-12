<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <v-badge
            bordered
            color="warning"
            dot
            overlap
            :value="selectedFilterTypes.length > 0"
            :offset-y="15"
            :offset-x="15"
          >
            <app-btn
              :disabled="disabled"
              icon
              text
              v-bind="attrs"
              v-on="{... menu, ...tooltip}"
            >
              <v-icon>
                $filter
              </v-icon>
            </app-btn>
          </v-badge>
        </template>
        <span>{{ t('app.general.btn.filter') }}</span>
      </v-tooltip>
    </template>

    <v-list dense>
      <v-list-item-group
        v-model="selectedFilterTypes"
        multiple
      >
        <v-list-item
          v-for="filter in filters"
          :key="`filter-${filter.type}`"
          :value="filter.type"
        >
          <template #default="{ active }">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="active" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ filter.text }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="filter.desc !== undefined">
                {{ filter.desc }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import type { FileFilterType, RootProperties } from '@/store/files/types'

type FileFilter = {
  type: FileFilterType,
  text: string,
  desc?: string,
}

const props = defineProps<{
  root: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: FileFilterType[]): void
}>()

const { typedGetters, typedState } = useStore()
const { t, tc } = useI18n()

const rootProperties = computed((): RootProperties =>
  typedGetters['files/getRootProperties'](props.root)
)

const supportsHistoryComponent = computed((): boolean =>
  typedGetters['server/componentSupport']('history')
)

const filters = computed((): FileFilter[] =>
  rootProperties.value.filterTypes
    .filter(filterType => {
      switch (filterType) {
        case 'print_start_time':
          return supportsHistoryComponent.value

        default:
          return true
      }
    })
    .map((filterType): FileFilter => ({
      type: filterType,
      text: tc(`app.file_system.filters.label.${filterType}`)
    }))
)

const selectedFilterTypes = computed({
  get: (): FileFilterType[] => {
    const selectedFilters: FileFilterType[] = typedState.config.uiSettings.fileSystem.activeFilters[props.root] ?? []
    const filterSet = new Set(filters.value.map(filter => filter.type))

    return selectedFilters.filter(selectedFilter => filterSet.has(selectedFilter))
  },
  set: (value: FileFilterType[]) => {
    emit('change', value)
  }
})
</script>

<style lang="scss" scoped>
:deep(.v-list-item--active::before) {
  opacity: 0;
}
:deep(.v-list-item--active:hover::before) {
  opacity: 0.08;
}

</style>

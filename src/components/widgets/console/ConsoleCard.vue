<template>
  <collapsable-card
    :title="$t('app.general.title.console')"
    icon="$console"
    :help-tooltip="$t('app.console.tooltip.help')"
    card-classes="d-flex flex-column"
    content-classes="flex-grow-1 flow-shrink-0"
    menu-breakpoint="none"
    menu-icon="$cog"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.console-card"
    @collapsed="handleCollapseChange"
  >
    <template #menu>
      <app-btn
        v-if="scrollingPaused"
        icon
        @click="consoleElement?.scrollToLatest(true)"
      >
        <v-icon dense>
          {{ flipLayout ? '$up' : '$down' }}
        </v-icon>
      </app-btn>

      <app-btn
        v-if="!fullscreen"
        icon
        @click="$filters.routeTo({ name: 'console' })"
      >
        <v-icon dense>
          $fullScreen
        </v-icon>
      </app-btn>

      <app-btn
        icon
        @click="handleClear"
      >
        <v-icon dense>
          $delete
        </v-icon>
      </app-btn>

      <v-menu
        bottom
        left
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="false"
      >
        <template #activator="{ on, attrs }">
          <app-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon dense>
              $cog
            </v-icon>
          </app-btn>
        </template>

        <v-list dense>
          <v-list-item @click="hideTempWaits = !hideTempWaits">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="hideTempWaits" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.console.label.hide_temp_waits') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="autoScroll = !autoScroll">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="autoScroll" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.console.label.auto_scroll') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="setFlipLayout(!flipLayout)">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="flipLayout" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.console.label.flip_layout') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <template v-if="filters && filters.length">
            <v-divider />

            <v-list-item
              v-for="filter in filters"
              :key="filter.id"
              @click="handleToggleFilter(filter)"
            >
              <v-list-item-action class="my-0">
                <v-checkbox :input-value="filter.enabled" />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ filter.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </template>

    <console
      ref="consoleElement"
      :scrolling-paused.sync="scrollingPaused"
      :items="items"
      :fullscreen="fullscreen"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/composables/useStore'
import Console from './Console.vue'
import type { ConsoleEntry, ConsoleFilter } from '@/store/console/types'

defineProps<{
  fullscreen?: boolean
}>()

const { typedState, typedGetters, typedDispatch } = useStore()

const consoleElement = ref<InstanceType<typeof Console>>()
const scrollingPaused = ref(false)

const filters = computed((): ConsoleFilter[] => typedState.console.consoleFilters)

const hideTempWaits = computed({
  get: (): boolean => typedState.config.uiSettings.general.hideTempWaits,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.general.hideTempWaits',
      value,
      server: true
    })
  }
})

const flipLayout = computed((): boolean =>
  typedState.config.uiSettings.general.flipConsoleLayout
)

function setFlipLayout (value: boolean) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.flipConsoleLayout',
    value,
    server: true
  })

  consoleElement.value?.scrollToLatest(true)
}

const items = computed((): ConsoleEntry[] => typedGetters['console/getConsoleEntries'])

const inLayout = computed((): boolean => typedState.config.layoutMode)

const autoScroll = computed({
  get: (): boolean => typedState.console.autoScroll,
  set: (value: boolean) => {
    typedDispatch('console/onUpdateAutoScroll', value)
    if (value) {
      consoleElement.value?.scrollToLatest(true)
    }
  }
})

watch(inLayout, (inLayout: boolean) => {
  if (!inLayout) {
    consoleElement.value?.scrollToLatest()
  }
})

function handleCollapseChange (collapsed: boolean) {
  if (!collapsed) {
    consoleElement.value?.scrollToLatest()
  }
}

function handleClear () {
  typedDispatch('console/onClear')
}

function handleToggleFilter (filter: ConsoleFilter) {
  typedDispatch('console/onSaveFilter', {
    ...filter,
    enabled: !filter.enabled
  })
}
</script>

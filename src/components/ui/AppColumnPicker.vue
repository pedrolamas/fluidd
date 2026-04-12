<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    min-width="150"
    :close-on-content-click="false"
  >
    <template #activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <app-btn
            icon
            text
            v-bind="attrs"
            v-on="{ ...tooltip, ...menu }"
          >
            <v-icon>
              $tableColumn
            </v-icon>
          </app-btn>
        </template>
        <span>{{ $t('app.general.btn.select_columns') }}</span>
      </v-tooltip>
    </template>

    <v-list
      dense
      class="overflow-y-auto"
    >
      <app-draggable
        v-model="configurableHeaders"
        :options="{
          group: 'columnPicker',
        }"
      >
        <template v-for="header in configurableHeaders">
          <v-list-item
            :key="header.value"
            @click="handleToggleHeader(header)"
          >
            <v-list-item-action class="my-0">
              <app-drag-icon />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ header.text }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="header.visible !== false" />
            </v-list-item-action>
          </v-list-item>
        </template>
      </app-draggable>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppDataTableHeader } from '@/types'
import type { ConfiguredTableHeader } from '@/store/config/types'
import { useStore } from '@/composables/useStore'

const { typedDispatch } = useStore()

const props = defineProps<{
  keyName: string
  headers: AppDataTableHeader[]
}>()

const configurableHeaders = computed({
  get: () => props.headers,
  set: (value: AppDataTableHeader[]) => {
    const headers = value.map(({ value, visible }): ConfiguredTableHeader => ({ value, visible }))
    typedDispatch('config/updateHeaders', { name: props.keyName, headers })
  }
})

function handleToggleHeader (value: AppDataTableHeader) {
  const header: ConfiguredTableHeader = {
    value: value.value,
    visible: !(value.visible !== false)
  }
  typedDispatch('config/updateHeader', { name: props.keyName, header })
}
</script>

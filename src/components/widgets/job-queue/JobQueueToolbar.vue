<template>
  <v-toolbar dense>
    <v-spacer />

    <app-thumbnail-size v-model="thumbnailSize" />

    <app-column-picker
      v-if="headers"
      key-name="job_queue"
      :headers="headers"
    />

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          @click="$emit('remove-all')"
          v-on="on"
        >
          <v-icon>$delete</v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.remove_all') }}</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          @click="$emit('refresh')"
          v-on="on"
        >
          <v-icon>$refresh</v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.refresh') }}</span>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import type { AppDataTableHeader } from '@/types'

defineProps<{
  headers?: AppDataTableHeader[]
}>()

const { typedState, typedDispatch } = useStore()

const thumbnailSize = computed({
  get: () => typedState.config.uiSettings.thumbnailSizes.jobQueue ?? 32,
  set: (value: number) => typedDispatch('config/updateThumbnailSizes', { name: 'jobQueue', size: value })
})
</script>

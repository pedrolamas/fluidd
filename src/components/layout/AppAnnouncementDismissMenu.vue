<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    min-width="150"
  >
    <template #activator="{ on, attrs, value }">
      <app-btn
        v-bind="attrs"
        x-small
        v-on="on"
      >
        <v-icon
          x-small
          class="me-1"
        >
          $snooze
        </v-icon>
        {{ $t('app.general.btn.snooze') }}
        <v-icon
          x-small
          class="ms-1"
          :class="{ 'rotate-180': value }"
        >
          $chevronDown
        </v-icon>
      </app-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(preset) of presets"
        :key="preset.delay"
        @click="$emit('dismiss', preset.delay)"
      >
        <v-list-item-icon>
          <v-icon>
            $clock
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ preset.label }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Filters } from '@/plugins/filters'

defineEmits<{
  (e: 'dismiss', delay: number): void
}>()

const presets = computed(() => [
  {
    label: Filters.formatRelativeTime(1, 'hour', { numeric: 'always' }),
    delay: 3600
  },
  {
    label: Filters.formatRelativeTime(1, 'day', { numeric: 'always' }),
    delay: 3600 * 24
  },
  {
    label: Filters.formatRelativeTime(7, 'day', { numeric: 'always' }),
    delay: 3600 * 24 * 7
  }
])
</script>

<template>
  <app-btn
    v-if="isExpanded"
    :disabled="disabled"
    :loading="loading"
    color=""
    class="me-1"
    @click="$emit('click')"
  >
    <v-icon
      left
      color="warning"
    >
      $save
    </v-icon>
    <span>{{ $t('app.general.btn.save_config_and_restart') }}</span>
  </app-btn>

  <v-tooltip
    v-else
    bottom
  >
    <template #activator="{ on, attrs }">
      <app-btn
        v-bind="attrs"
        icon
        text
        color="warning"
        :disabled="disabled"
        :loading="loading"
        v-on="on"
        @click="$emit('click')"
      >
        <v-icon>$save</v-icon>
      </app-btn>
    </template>
    <span>{{ $t('app.general.btn.save_config_and_restart') }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVuetify } from '@/composables/useVuetify'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

const vuetify = useVuetify()
const isExpanded = computed(() => vuetify.breakpoint.mdAndUp)
</script>

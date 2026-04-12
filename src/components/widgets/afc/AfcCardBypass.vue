<template>
  <v-alert
    v-if="bypassState"
    type="warning"
    class="mt-3"
    dense
    text
  >
    {{ $t('app.afc.BypassActive') }}
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'

const { afc } = useAfcMixin()

const bypassState = computed(() => afc.value?.bypass_state === true)
</script>

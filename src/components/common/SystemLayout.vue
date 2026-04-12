<template>
  <v-list
    v-if="canEditLayout"
    dense
  >
    <v-subheader>{{ $t('app.general.label.layout') }}</v-subheader>

    <v-list-item @click.prevent="layoutMode = !layoutMode">
      <v-list-item-icon>
        <v-icon>$apps</v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          {{ $t('app.general.btn.adjust_layout') }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router/composables'
import { useStore } from '@/composables/useStore'

const { typedState, typedCommit } = useStore()
const route = useRoute()

const emit = defineEmits<{ (e: 'click'): void }>()

const canEditLayout = computed(() => route.meta?.dashboard ?? false)

const layoutMode = computed({
  get: () => typedState.config.layoutMode,
  set: (val: boolean) => {
    typedCommit('config/setLayoutMode', val)
    emit('click')
  }
})
</script>

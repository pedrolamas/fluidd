<template>
  <app-dialog
    v-model="open"
    :title="updating ? $t('app.version.status.updating') : $t('app.version.status.finished')"
    :loading="updating"
    :close-button-disabled="updating"
    max-width="650"
    persistent
  >
    <v-card-text>
      <console
        :items="responses"
        :fullscreen="isMobileViewport"
        :height="250"
        readonly
      />
    </v-card-text>

    <template #actions>
      <v-spacer />

      <app-btn
        color="primary"
        text
        :disabled="updating"
        @click="open = false"
      >
        {{ updating ? $t('app.version.status.updating') : $t('app.version.btn.finish') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from '@/composables/useStore'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import Console from '@/components/widgets/console/Console.vue'
import type { UpdateResponse } from '@/store/version/types'

const { typedGetters, typedState, typedCommit } = useStore()
const { isMobileViewport } = useBrowserMixin()

const invokedDialog = ref(false)

const updating = computed<boolean>(() => typedState.version.status?.busy ?? false)

const responses = computed<UpdateResponse[]>(() => typedGetters['version/getResponses'])

// When updating starts, lock the dialog open (side effect moved out of computed)
watch(updating, (val) => { if (val) invokedDialog.value = true })

const open = computed({
  get (): boolean {
    return invokedDialog.value || updating.value
  },
  set (value: boolean) {
    if (!value) {
      invokedDialog.value = false
      typedCommit('version/setClearUpdateResponse')
    }
  }
})
</script>

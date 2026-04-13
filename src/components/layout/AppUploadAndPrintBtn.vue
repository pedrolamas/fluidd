<template>
  <div>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          icon
          text
          :disabled="disabled"
          v-bind="attrs"
          v-on="on"
          @click="uploadFileInput?.click()"
        >
          <v-icon>
            $progressUpload
          </v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.label.upload_and_print') }}</span>
    </v-tooltip>

    <input
      ref="uploadFileInput"
      type="file"
      :accept="accepts"
      style="display: none"
      @change="fileChanged"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import type { RootProperties } from '@/store/files/types'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'upload', file: File): void
}>()

const { isIOS } = useBrowserMixin()
const { typedGetters } = useStore()

const uploadFileInput = ref<HTMLInputElement>()

const rootProperties = computed<RootProperties>(() => typedGetters['files/getRootProperties']('gcodes'))

const accepts = computed(() =>
  isIOS.value
    ? undefined
    : rootProperties.value.accepts.join(',')
)

function fileChanged (event: Event) {
  if (event.target instanceof HTMLInputElement) {
    if (event.target.files?.length === 1) {
      emit('upload', event.target.files[0])
    }

    event.target.value = ''
  }
}
</script>
<style lang="scss" scoped>
  .v-btn.v-btn--disabled.v-btn--has-bg.bg-transparent {
    background: none !important;
  }
</style>

<template>
  <v-snackbar
    v-model="open"
    timeout="-1"
    multi-line
    elevation="24"
    bottom
    right
    :vertical="$vuetify.breakpoint.smAndDown"
  >
    <template v-if="file">
      <div class="mb-2">
        {{ $t('app.gcode.label.parsing_file') }}: {{ file.filename }}
      </div>
      <v-progress-linear
        :value="percent"
        color="primary"
        class="mb-2"
      />
      <table>
        <tr>
          <td class="pr-2">
            {{ $t('app.gcode.label.parsed') }}:
          </td>
          <td>
            {{ percent }}%
            ({{ $filters.getReadableFileSizeString(progress) }} /
            {{ $filters.getReadableFileSizeString(file.size) }})
          </td>
        </tr>
      </table>
    </template>
    <template #action="{ attrs }">
      <app-btn
        v-bind="attrs"
        @click="$emit('cancel'); open = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppFile } from '@/store/files/types'

const props = defineProps<{
  progress: number
  file: AppFile
}>()

defineEmits<{
  (e: 'cancel'): void
}>()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const percent = computed(() => Math.floor((props.progress / props.file.size) * 100))
</script>

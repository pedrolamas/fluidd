<template>
  <app-dialog
    :value="open"
    :title="$tc('app.file_system.title.upload_file', uploads.length)"
    max-width="500"
    persistent
    no-actions
  >
    <v-card-text>
      <template v-for="(file, i) in uploads">
        <v-row
          :key="file.filepath"
          class="py-2"
        >
          <v-col>
            <div class="mb-2 filename">
              {{ file.filepath }}
            </div>
            <v-progress-linear
              v-if="file.percent === 100 && !file.complete"
              indeterminate
              color="primary"
              class="mb-2"
            />
            <v-progress-linear
              v-else
              :value="file.percent"
              color="primary"
              class="mb-2"
            />
            <div v-if="!file.complete && file.percent === 100">
              {{ $t('app.file_system.msg.processing') }}
            </div>
            <table v-if="file.percent > 0 && file.percent !== 100">
              <tr>
                <td class="pr-2">
                  {{ $t('app.file_system.label.uploaded') }}:
                </td>
                <td>{{ file.percent }}% ({{ $filters.getReadableFileSizeString(file.loaded) }} / {{ $filters.getReadableFileSizeString(file.size) }})</td>
              </tr>
              <tr>
                <td class="pr-2">
                  {{ $t('app.file_system.label.transfer_rate') }}:
                </td>
                <td>{{ $filters.getReadableDataRateString(file.speed) }}</td>
              </tr>
            </table>
          </v-col>
          <v-col cols="auto">
            <app-btn
              color="error"
              icon
              :disabled="file.complete || file.percent === 100 || file.cancelled"
              @click="handleCancelUpload(file)"
            >
              <v-icon>$close</v-icon>
            </app-btn>
          </v-col>
        </v-row>

        <v-divider
          v-if="i < uploads.length - 1"
          :key="`divider-${file.filepath}`"
        />
      </template>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileUpload } from '@/store/files/types'
import { useStore } from '@/composables/useStore'

const { typedState, typedDispatch } = useStore()

const uploads = computed<FileUpload[]>(() =>
  (typedState.files.uploads as FileUpload[])
    .filter(file => !file.cancelled && (file.percent !== 100 || !file.complete))
)
const open = computed(() => uploads.value.length > 0)

function handleCancelUpload (file: FileUpload) {
  if (!file.complete) {
    if (file.loaded === 0) {
      typedDispatch('files/updateFileUpload', { uid: file.uid, cancelled: true })
    }
    if (file.loaded > 0 && file.loaded < file.size) {
      file.abortController.abort()
    }
  }
}
</script>

<style lang="scss" scoped>
  .filename {
    word-break: break-all;
  }
</style>

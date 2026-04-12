<template>
  <collapsable-card
    v-if="roots.length > 0"
    :title="t('app.file_system.label.diskinfo')"
    icon="$harddisk"
  >
    <v-toolbar dense>
      <v-tabs
        v-model="tab"
        show-arrows
      >
        <v-tab
          v-for="(root, index) in roots"
          :key="index"
        >
          {{ root }}
        </v-tab>
      </v-tabs>

      <v-spacer />

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            icon
            :disabled="!diskUsage || loading"
            @click.prevent.stop="handleRefresh()"
            v-on="on"
          >
            <v-icon
              dense
              :class="{ 'spin-alt': loading }"
            >
              $refresh
            </v-icon>
          </app-btn>
        </template>
        <span>{{ t('app.general.btn.refresh') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-card-text>
      <v-layout justify-space-between>
        <div>
          {{ t('app.file_system.label.disk_usage') }}
        </div>
      </v-layout>

      <v-progress-linear
        :size="90"
        :height="10"
        :value="diskUsage?.usedPercent"
        :color="diskUsage?.lowOnSpace ? 'error': 'primary'"
        class="my-1"
      />

      <v-layout justify-space-between>
        <div>
          <span class="focus--text">
            {{
              diskUsage != null
                ? Filters.getReadableFileSizeString(diskUsage.used)
                : '?'
            }}
          </span>
          <span class="secondary--text">{{ t('app.general.label.used') }}</span>
        </div>
        <div>
          <span class="focus--text">
            {{
              diskUsage != null
                ? Filters.getReadableFileSizeString(diskUsage.free)
                : '?'
            }}
          </span>
          <span class="secondary--text">{{ t('app.general.label.free') }}</span>
        </div>
      </v-layout>
    </v-card-text>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useStateMixin } from '@/composables/useStateMixin'
import { Filters } from '@/plugins/filters'
import { Waits } from '@/globals'
import type { AppDiskUsage } from '@/store/files/types'
import { SocketActions } from '@/api/socketActions'

const { typedState, typedGetters } = useStore()
const { t } = useI18n()
const { hasWait } = useStateMixin()

const tab = ref<number | null>(null)

const roots = computed((): string[] => typedState.server.info.registered_directories)

const currentRoot = computed((): string | null =>
  tab.value != null ? roots.value[tab.value] ?? null : null
)

const loading = computed((): boolean => hasWait(`${Waits.onFileSystem}/${currentRoot.value}/`))

const diskUsage = computed((): AppDiskUsage | undefined => {
  if (currentRoot.value != null) {
    const usage: AppDiskUsage | undefined = typedGetters['files/getDiskUsage'](currentRoot.value)

    if (usage == null) {
      SocketActions.serverFilesGetDirectory(currentRoot.value)
    }

    return usage
  }
  return undefined
})

function handleRefresh () {
  if (currentRoot.value != null) {
    SocketActions.serverFilesGetDirectory(currentRoot.value)
  }
}
</script>

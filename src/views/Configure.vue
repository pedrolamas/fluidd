<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col
      cols="12"
      md="6"
    >
      <collapsable-card
        :title="$t('app.general.title.config_files')"
        icon="$codeJson"
        :help-tooltip="$t('app.general.tooltip.file_browser_help')"
        class="mb-2 mb-md-4"
      >
        <file-system
          :roots="['config']"
          name="configure"
          bulk-actions
          class="full-screen"
        />
      </collapsable-card>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <collapsable-card
        :title="$t('app.general.title.other_files')"
        icon="$files"
        :help-tooltip="$t('app.general.tooltip.file_browser_configuration_help')"
        class="mb-2 mb-md-4"
      >
        <file-system
          :roots="roots"
          name="configure"
          class="full-screen"
        />
      </collapsable-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FileSystem from '@/components/widgets/filesystem/FileSystem.vue'
import { useStore } from '@/composables/useStore'

const { typedState } = useStore()

const roots = computed(() => {
  const roots = ['logs', 'docs', 'config_examples']
  const excludeRoots = ['gcodes', 'config', 'timelapse', 'timelapse_frames']

  const registeredDirectories: string[] = typedState.server.info.registered_directories || []

  for (const root of registeredDirectories) {
    if (!excludeRoots.includes(root) && !roots.includes(root)) {
      roots.push(root)
    }
  }

  return roots
})
</script>

<style lang="scss" scoped>
  .full-screen {
    max-height: calc(100vh - 190px);
    max-height: calc(100svh - 190px);
  }
</style>

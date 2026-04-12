<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col
      cols="12"
      md="8"
    >
      <collapsable-card
        :title="$t('app.general.title.timelapse')"
        icon="$video"
      >
        <file-system
          :roots="'timelapse'"
          name="timelapse"
          bulk-actions
          class="full-screen"
        />
      </collapsable-card>
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <timelapse-status-card
        class="mb-2 mb-md-4"
        @openRenderDialog="openRenderDialog"
      />

      <timelapse-settings-card
        class="mb-2 mb-md-4"
        @openRenderDialog="openRenderDialog"
      />
    </v-col>

    <timelapse-render-settings-dialog
      v-if="renderDialogOpen"
      v-model="renderDialogOpen"
      :renderable="renderDialogRenderable"
    />
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileSystem from '@/components/widgets/filesystem/FileSystem.vue'
import TimelapseStatusCard from '@/components/widgets/timelapse/TimelapseStatusCard.vue'
import TimelapseSettingsCard from '@/components/widgets/timelapse/TimelapseSettingsCard.vue'
import TimelapseRenderSettingsDialog from '@/components/widgets/timelapse/TimelapseRenderSettingsDialog.vue'

const renderDialogOpen = ref(false)
const renderDialogRenderable = ref(false)

function openRenderDialog (renderable = false) {
  renderDialogRenderable.value = renderable
  renderDialogOpen.value = true
}
</script>

<style lang="scss" scoped>
  .full-screen {
    max-height: calc(100vh - 190px);
    max-height: calc(100svh - 190px);
  }
</style>

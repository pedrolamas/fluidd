<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col cols="12">
      <GcodePreviewCard fullscreen />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import GcodePreviewCard from '@/components/widgets/gcode-preview/GcodePreviewCard.vue'
</script>

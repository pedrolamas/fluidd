<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col cols="12">
      <console-card fullscreen />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import ConsoleCard from '@/components/widgets/console/ConsoleCard.vue'
</script>

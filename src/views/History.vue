<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col cols="12">
      <printer-stats-card class="mb-2 mb-md-4" />

      <printer-history-card class="mb-2 mb-md-4" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import PrinterStatsCard from '@/components/widgets/stats/PrinterStatsCard.vue'
import PrinterHistoryCard from '@/components/widgets/history/PrintHistoryCard.vue'
</script>

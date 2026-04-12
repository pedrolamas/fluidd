<template>
  <collapsable-card
    :title="$t('app.general.title.limits')"
    icon="$limits"
    draggable
    layout-path="dashboard.printer-limits-card"
  >
    <printer-limits />
  </collapsable-card>
</template>

<script setup lang="ts">
import PrinterLimits from '@/components/widgets/limits/PrinterLimits.vue'
</script>

<template>
  <collapsable-card
    :title="$t('app.general.title.macros')"
    icon="$fileCode"
    draggable
    layout-path="dashboard.macros-card"
  >
    <macros />
  </collapsable-card>
</template>

<script setup lang="ts">
import Macros from '@/components/widgets/macros/Macros.vue'
</script>

<template>
  <collapsable-card
    :title="$t('app.general.title.fans_outputs')"
    icon="$motion"
    draggable
    layout-path="dashboard.outputs-card"
    menu-breakpoint="lg"
  >
    <outputs />
  </collapsable-card>
</template>

<script setup lang="ts">
import Outputs from '@/components/widgets/outputs/Outputs.vue'
</script>

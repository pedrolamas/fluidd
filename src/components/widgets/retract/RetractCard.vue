<template>
  <collapsable-card
    :title="$t('app.general.title.retract')"
    icon="$retract"
    draggable
    layout-path="dashboard.retract-card"
  >
    <retract />
  </collapsable-card>
</template>

<script setup lang="ts">
import Retract from '@/components/widgets/retract/Retract.vue'
</script>

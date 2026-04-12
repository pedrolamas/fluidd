<template>
  <collapsable-card
    :title="$t('app.sensors.title.sensors')"
    icon="$sensors"
    draggable
    layout-path="dashboard.sensors-card"
  >
    <sensors />
  </collapsable-card>
</template>

<script setup lang="ts">
import Sensors from './Sensors.vue'
</script>

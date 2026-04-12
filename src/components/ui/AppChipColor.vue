<template>
  <v-chip
    :style="{
      background: color
    }"
    small
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </v-chip>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  color: string
}>()
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  @include theme(v-chip) using ($material) {
    border-color: map-deep-get($material, 'text', 'primary');
  }

  .v-chip {
    border-style: solid;
    padding: 0;
    width: 24px;
  }
</style>

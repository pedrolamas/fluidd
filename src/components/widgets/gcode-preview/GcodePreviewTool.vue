<template>
  <div
    class="gcode-preview-tool"
    :class="{
      active: active
    }"
  >
    <span
      class="extruder-color mr-1"
      :style="{
        background: color
      }"
    />
    {{ tool }}
  </div>
</template>

<script setup lang="ts">
import type { Tool } from '@/store/gcodePreview/types'

defineProps<{
  tool: Tool
  color: string
  active?: boolean
}>()
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  @include theme(gcode-preview-tool) using ($material) {
    .extruder-color {
      border-color: map-deep-get($material, 'text', 'primary');
    }
  }

  .gcode-preview-tool {
    display: inline-flex;
    border: 1px solid transparent;
    border-radius: 6px;
    align-items: center;
    padding: 0 4px;

    &.active {
      border-color: map-deep-get($material-dark, 'text', 'primary');

      & .extruder-color {
        border-color: map-deep-get($material-dark, 'text', 'primary');
      }
    }

    & .extruder-color {
      width: 15px;
      height: 15px;
      border-width: 1px;
      border-style: solid;
      border-radius: 50%;
    }
  }
</style>

<template>
  <v-overlay
    class="dragOverlay"
    :opacity="0.85"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <v-container>
      <v-row
        class="fill-height"
        align-content="center"
        justify="center"
        no-gutters
      >
        <v-col
          class="text-h6 font-weight-light text-center"
          cols="12"
          sm="6"
        >
          <v-icon
            x-large
            class="mr-1"
          >
            {{ icon }}
          </v-icon>
          <span v-safe-html="message" />
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  message: string
  icon: string
}>()
</script>

<style lang="scss" scoped>
  .dragOverlay.v-overlay--active {
    border: dashed 3px #616161;
    pointer-events: none !important;
  }

  .dragOverlay :deep(.v-overlay__content) {
    width: 100%;
  }
</style>

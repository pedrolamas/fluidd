<template v-if="$slots.default">
  <!-- not collapsed -->
  <div
    v-if="!collapsed"
    class="d-inline-block"
  >
    <slot />
  </div>

  <!-- collapsed to hamburger -->
  <v-menu
    v-else
    transition="slide-y-transition"
    left
    offset-y
    :disabled="disabled"
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <app-btn
        icon
        :disabled="disabled"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon dense>
          {{ menuIcon }}
        </v-icon>
      </app-btn>
    </template>
    <v-sheet
      elevation="0"
      class="pa-2"
    >
      <slot />
    </v-sheet>
  </v-menu>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  collapsed?: boolean
  menuIcon?: string
  disabled?: boolean
}>(), {
  menuIcon: '$menu'
})
</script>

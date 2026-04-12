<template>
  <v-tooltip
    :disabled="!tooltip"
    top
  >
    <template #activator="{ on, attrs }">
      <app-btn
        :disabled="disabled"
        min-width="40"
        :color="color"
        class="px-2"
        v-bind="{...$attrs, ...attrs}"
        v-on="{...$listeners, ...on}"
      >
        <v-icon
          v-if="icon"
          :small="smallIcon"
          :class="{ 'mr-1': $slots.default }"
        >
          {{ icon }}
        </v-icon>
        <slot />
      </app-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  disabled?: boolean
  color?: string
  tooltip?: string
  smallIcon?: boolean
}>(), {
  color: 'btncolor'
})
</script>

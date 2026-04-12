<template>
  <v-tooltip
    :bottom="bottom"
    :top="top"
    :left="left"
    :right="right"
  >
    <template #activator="{ on, attrs }">
      <v-icon
        :color="type"
        class="ml-2"
        v-bind="{...$attrs, attrs}"
        v-on="{...$listeners, ...on}"
      >
        {{ (type === 'error' || type === 'warning') ? '$warning' : '$help' }}
      </v-icon>
    </template>
    <slot>
      <span v-safe-html="tooltip" />
    </slot>
  </v-tooltip>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tooltip?: string
  type?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}>(), {
  type: 'primary'
})
</script>

<template>
  <v-btn
    v-bind="$attrs"
    :color="colorToApply"
    :fab="fab"
    :icon="icon"
    :outlined="outlined"
    :text="text"
    :plain="plain"
    :class="{
      'grey--text text--darken-3': primaryColorIsLight
    }"
    v-on="$listeners"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Filters } from '@/plugins/filters'
import { useVuetify } from '@/composables/useVuetify'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  color?: string
  fab?: boolean
  icon?: boolean
  outlined?: boolean
  text?: boolean
  plain?: boolean
}>()

const vuetify = useVuetify()

const colorToApply = computed(() => {
  if (props.color != null) return props.color
  return (props.fab || props.icon || props.plain) ? undefined : 'btncolor'
})

const primaryColorIsLight = computed(() => {
  if (props.fab || props.icon || props.outlined || props.text || props.color !== 'primary') return false
  const color = vuetify.theme.currentTheme.primary?.toString() ?? ''
  return !Filters.isColorDark(color)
})
</script>

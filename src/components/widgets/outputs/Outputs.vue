<template>
  <v-card-text>
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <template v-for="(item, i) in all.col1">
          <OutputItem
            :key="item.key"
            :item="item"
          />

          <v-divider
            v-if="i < all.col1.length - 1 || $vuetify.breakpoint.mdAndDown"
            :key="`divider-0${i}`"
            class="my-2"
          />
        </template>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="12"
        lg="6"
      >
        <template v-for="(item, i) in all.col2">
          <OutputItem
            :key="item.key"
            :item="item"
          />

          <v-divider
            v-if="i < all.col2.length - 1"
            :key="`divider-1${i}`"
            class="my-2"
          />
        </template>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OutputItem from '@/components/widgets/outputs/OutputItem.vue'
import { useStore } from '@/composables/useStore'
import type { Fan, Led, OutputPin } from '@/store/printer/types'

const { typedGetters } = useStore()

const all = computed(() => {
  const fans: Fan[] = typedGetters['printer/getAllFans']
  const pins: OutputPin[] = typedGetters['printer/getAllPins']
  const leds: Led[] = typedGetters['printer/getAllLeds']

  const items: Array<Fan | Led | OutputPin> = [
    ...fans,
    ...pins
      .sort((a, b) => (+a.pwm - +b.pwm) || a.name.localeCompare(b.name)),
    ...leds
  ]

  const [col1, col2] = items.length > 1
    ? [items.splice(0, Math.ceil(items.length / 2)), items]
    : [items, []]

  return {
    col1,
    col2
  }
})
</script>

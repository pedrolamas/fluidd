<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col cols="12">
      <h1>All configured icons</h1>

      <v-tooltip
        v-for="icon in icons"
        :key="icon"
        class="d-inline-block"
        top
      >
        <template #activator="{ attrs, on }">
          <v-icon
            v-bind="attrs"
            class="ma-2"
            v-on="on"
          >
            ${{ icon }}
          </v-icon>
        </template>
        {{ icon }}
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icons } from '@/globals'

const icons = computed(() => Object.keys(Icons))
</script>

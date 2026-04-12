<template>
  <v-toolbar dense>
    <v-spacer />

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          @click="$emit('multiply')"
          v-on="on"
        >
          <v-icon>$duplicate</v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.multiply') }}</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          icon
          text
          @click="$emit('remove')"
          v-on="on"
        >
          <v-icon>$delete</v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.general.btn.remove') }}</span>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'multiply'): void
  (e: 'remove'): void
}>()
</script>

<template>
  <div class="logo-wrapper">
    <inline-svg
      :src="logoSrc"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import type { ThemeConfig } from '@/store/config/types'

const { typedState } = useStore()

const theme = computed<ThemeConfig>(() => typedState.config.uiSettings.theme)
const logoSrc = computed(() => `${import.meta.env.BASE_URL}${theme.value.logo.src}`)
</script>

<style lang="scss" scoped>
  .logo-wrapper {
    display: flex;
  }
</style>

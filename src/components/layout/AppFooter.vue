<template>
  <v-footer
    app
    absolute
    inset
    color="transparent"
    class="footer justify-end"
  >
    <span class="secondary--text">
      &copy; {{ new Date().getFullYear() }}
      fluidd: v{{ version }}-{{ hash }}
    </span>
  </v-footer>
</template>

<script setup lang="ts">
const version = import.meta.env.VERSION
const hash = import.meta.env.HASH
</script>

<style lang="scss" scoped>
  .footer {
    span {
      flex: 0 0 auto;
      font-weight: 100;
    }
  }
</style>

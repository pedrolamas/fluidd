<template>
  <textarea
    v-model="content"
    class="v-input v-textarea px-2"
    :class="{
      [vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
    }"
    :readonly="readonly"
    spellcheck="false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVuetify } from '@/composables/useVuetify'

const props = defineProps<{
  value?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
  (e: 'ready'): void
}>()

const vuetify = useVuetify()

const content = computed({
  get: () => props.value,
  set: (value) => emit('input', value ?? '')
})

onMounted(() => {
  emit('ready')
})
</script>

<style lang="scss" scoped>
  :deep() {
    font-family: monospace;
    font-size: 1rem;
    font-weight: 100 !important;
    min-width: 100%;
    height: calc(100% - 48px) !important;
    resize: none;
  }
</style>

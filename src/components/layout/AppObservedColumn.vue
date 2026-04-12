<template>
  <v-col
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot :narrow="narrow" />
  </v-col>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

defineOptions({ inheritAttrs: false })

const observer = ref<ResizeObserver | null>(null)
const narrow = ref(false)
const instance = getCurrentInstance()

function updateNarrow (width: number) {
  narrow.value = width < 560
}

onMounted(() => {
  const el = instance?.proxy?.$el as HTMLElement
  if (!el) return

  if (typeof ResizeObserver !== 'undefined') {
    observer.value = new ResizeObserver(entries => {
      const lastEntry = entries[entries.length - 1]
      updateNarrow(lastEntry.contentRect.width)
    })
    observer.value.observe(el)
  }

  updateNarrow(el.clientWidth)
})

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
})
</script>

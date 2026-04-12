<template>
  <div>
    <slot
      :pending="pending"
      :result="result"
      :error="error"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  promise?: Promise<unknown> | null
}>()

const pending = ref(false)
const error = ref<unknown>(null)
const result = ref<unknown>(null)

function setPromiseResults (promise: Promise<unknown> | null, res: unknown, err: unknown) {
  if (!promise || props.promise === promise) {
    error.value = err
    result.value = res
    pending.value = false
  }
}

async function evaluatePromise () {
  const promise = props.promise
  if (!promise) {
    setPromiseResults(null, null, null)
    return
  }
  pending.value = true
  try {
    const res = await promise
    setPromiseResults(promise, res, null)
  } catch (err) {
    setPromiseResults(promise, null, err)
  }
}

watch(() => props.promise, () => evaluatePromise())
onMounted(() => evaluatePromise())
</script>

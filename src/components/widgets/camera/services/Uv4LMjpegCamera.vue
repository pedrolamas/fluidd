<template>
  <img
    v-show="status === 'connected'"
    ref="streamingElement"
    :src="cameraImageSource"
    :style="cameraStyle"
    :crossorigin="crossorigin"
    @load="updateStatus('connected')"
    @error="updateStatus('error')"
  >
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'
import { consola } from 'consola'

const props = defineProps<{
  camera: Moonraker.Webcam.Entry
  crossorigin?: 'anonymous' | 'use-credentials' | ''
}>()

const emit = defineEmits<{
  (e: string, ...args: any[]): void
}>()

const {
  cameraStyle,
  status,
  updateStatus,
  updateRawCameraUrl,
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLImageElement>()

const cameraImageSource = ref('')

function startPlayback () {
  try {
    updateStatus('connecting')

    const url = buildAbsoluteUrl(props.camera.stream_url || '')

    url.searchParams.set('cacheBust', Date.now().toString())

    cameraImageSource.value = url.toString()

    updateRawCameraUrl(cameraImageSource.value)
  } catch (e) {
    consola.error(`[Uv4LMjpegCamera] failed to start playback "${props.camera.name}"`, e)
  }
}

function stopPlayback () {
  updateStatus('disconnected')
  cameraImageSource.value = ''
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

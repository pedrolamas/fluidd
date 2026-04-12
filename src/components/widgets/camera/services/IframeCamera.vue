<template>
  <iframe
    ref="streamingElement"
    :src="cameraIFrameSource"
    style="border: none; width: 100%"
    :style="{
      'aspect-ratio': (camera.aspect_ratio || '16:9').replace(':', '/'),
      ...cameraStyle
    }"
    @load="updateStatus('connected')"
    @error="updateStatus('error')"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'

const props = defineProps<{
  camera: Moonraker.Webcam.Entry
  crossorigin?: 'anonymous' | 'use-credentials' | ''
}>()

const emit = defineEmits<{
  (e: string, ...args: any[]): void
}>()

const {
  cameraStyle,
  updateStatus,
  updateRawCameraUrl,
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLIFrameElement>()

const cameraIFrameSource = ref('')

function startPlayback () {
  updateStatus('connecting')

  const url = buildAbsoluteUrl(props.camera.stream_url || '').toString()

  cameraIFrameSource.value = url

  updateRawCameraUrl(url)
}

function stopPlayback () {
  updateStatus('disconnected')
  cameraIFrameSource.value = ''
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

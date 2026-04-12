<template>
  <video
    ref="streamingElement"
    autoplay
    disablePictureInPicture
    playsinline
    muted
    :style="cameraStyle"
    :crossorigin="crossorigin"
    :src="cameraVideoSource"
    @play="updateStatus('connected')"
    @error="updateStatus('error')"
  />
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
  updateStatus,
  updateRawCameraUrl,
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLVideoElement>()

const cameraVideoSource = ref('')

function startPlayback () {
  try {
    updateStatus('connecting')

    const url = buildAbsoluteUrl(props.camera.stream_url || '').toString()

    cameraVideoSource.value = url

    updateRawCameraUrl(url)
  } catch (e) {
    consola.error(`[IpstreamCamera] failed to start playback "${props.camera.name}"`, e)
  }
}

function stopPlayback () {
  updateStatus('disconnected')
  cameraVideoSource.value = ''
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

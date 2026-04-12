<template>
  <img
    v-show="status === 'connected'"
    ref="streamingElement"
    :src="cameraImageSource"
    :style="cameraStyle"
    :crossorigin="crossorigin"
    @load="handleImageLoad"
    @error="updateStatus('error')"
  >
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
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
  updateFramesPerSecond,
  updateRawCameraUrl,
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLImageElement>()

const cameraImageSource = ref('')
const cameraImageSourceUrl = ref<URL | null>(null)
const requestStartTime = ref(0)
const startTime = ref(0)
const time = ref(0)
const requestTime = ref(0)
const timeSmoothing = 0.6
const requestTimeSmoothing = 0.1

function handleImageLoad () {
  updateStatus('connected')
  emit('frame', streamingElement.value)

  const fpsTarget = (!document.hasFocus() && props.camera.target_fps_idle) || props.camera.target_fps || 10
  const endTime = performance.now()
  const currentTime = endTime - startTime.value

  time.value = (time.value * timeSmoothing) + (currentTime * (1.0 - timeSmoothing))

  startTime.value = endTime

  const targetTime = 1000 / fpsTarget

  const currentRequestTime = performance.now() - requestStartTime.value

  requestTime.value = (requestTime.value * requestTimeSmoothing) + (currentRequestTime * (1.0 - requestTimeSmoothing))

  const timeout = Math.max(0, targetTime - requestTime.value)

  nextTick(() => {
    setTimeout(handleRefresh, timeout)
  })
}

function handleRefresh () {
  if (!document.hidden) {
    if (time.value !== 0) {
      updateFramesPerSecond(Math.round(1000 / time.value))
    }
    nextTick(() => updateCameraImageSource())
  } else {
    stopPlayback()
  }
}

function updateCameraImageSource () {
  const url = cameraImageSourceUrl.value

  if (url) {
    url.searchParams.set('cacheBust', Date.now().toString())

    requestStartTime.value = performance.now()

    cameraImageSource.value = url.toString()
  }
}

function startPlayback () {
  try {
    updateStatus('connecting')

    cameraImageSourceUrl.value = buildAbsoluteUrl(props.camera.snapshot_url || '')

    time.value = 0
    startTime.value = performance.now()

    updateCameraImageSource()

    const rawUrl = buildAbsoluteUrl(props.camera.stream_url || '')

    rawUrl.searchParams.set('cacheBust', Date.now().toString())

    updateRawCameraUrl(rawUrl.toString())
  } catch (e) {
    consola.error(`[MjpegstreamerAdaptiveCamera] failed to start playback "${props.camera.name}"`, e)
  }
}

function stopPlayback () {
  updateStatus('disconnected')
  cameraImageSourceUrl.value = null
  cameraImageSource.value = ''
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

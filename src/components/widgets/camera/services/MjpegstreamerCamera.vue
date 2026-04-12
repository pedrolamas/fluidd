<template>
  <img
    v-show="status === 'connected'"
    ref="streamingElement"
    :style="cameraStyle"
    :crossorigin="crossorigin"
    @load="handleImageLoad"
    @error="handleImageError"
  >
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'
import { consola } from 'consola'

import type { MjpegWorkerResponseMessage, MjpegWorkerRequestMessage } from '@/workers/mjpegStream.worker'

import MjpegWorker from '@/workers/mjpegStream.worker?ts?worker'

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
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLImageElement>()

const startTime = ref(0)
const time = ref(0)
const timeSmoothing = 0.6

const worker = ref<Worker | null>(null)
const imageObjectUrl = ref<string | null>(null)

function handleImageLoad () {
  updateStatus('connected')

  revokeImageObjectURL()
}

function handleImageError () {
  updateStatus('error')

  revokeImageObjectURL()
}

function revokeImageObjectURL () {
  const url = imageObjectUrl.value

  if (url != null) {
    URL.revokeObjectURL(url)

    imageObjectUrl.value = null
  }
}

function startPlayback () {
  try {
    updateStatus('connecting')

    const url = buildAbsoluteUrl(props.camera.stream_url || '')

    url.searchParams.set('cacheBust', Date.now().toString())

    const w = worker.value = new MjpegWorker()

    w.onmessage = (event: MessageEvent<MjpegWorkerResponseMessage>) => {
      const message = event.data

      switch (message.action) {
        case 'frame': {
          const endTime = performance.now()
          const currentTime = endTime - startTime.value

          time.value = (time.value * timeSmoothing) + (currentTime * (1.0 - timeSmoothing))

          startTime.value = endTime

          if (time.value !== 0) {
            updateFramesPerSecond(Math.round(1000 / time.value))
          }

          revokeImageObjectURL()

          const blob = new Blob([message.data.buffer], { type: 'image/jpeg' })

          streamingElement.value!.src = imageObjectUrl.value = URL.createObjectURL(blob)

          break
        }

        case 'done':
          stopPlayback()

          break

        case 'error':
          updateStatus('error')

          stopPlayback()

          break
      }
    }

    const message: MjpegWorkerRequestMessage = {
      action: 'start',
      url: url.toString()
    }

    time.value = 0
    startTime.value = performance.now()

    w.postMessage(message)
  } catch (e) {
    consola.error(`[MjpegstreamerCamera] failed to start playback "${props.camera.name}"`, e)

    updateStatus('error')
  }
}

function stopPlayback () {
  worker.value?.terminate()
  worker.value = null
  revokeImageObjectURL()
  updateStatus('disconnected')
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

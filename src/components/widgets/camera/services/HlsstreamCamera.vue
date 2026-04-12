<template>
  <video
    ref="streamingElement"
    autoplay
    disablePictureInPicture
    playsinline
    muted
    :style="cameraStyle"
    :crossorigin="crossorigin"
    @play="updateStatus('connected')"
    @error="updateStatus('error')"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'
import Hls from 'hls.js'
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
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLVideoElement>()

const hls = ref<Hls | null>(null)

function startPlayback () {
  try {
    updateStatus('connecting')

    const url = buildAbsoluteUrl(props.camera.stream_url || '').toString()

    if (Hls.isSupported()) {
      hls.value?.destroy()

      hls.value = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxLiveSyncPlaybackRate: 2,
        liveSyncDuration: 0.5,
        liveMaxLatencyDuration: 2,
        backBufferLength: 5
      })
      hls.value.loadSource(url)
      hls.value.attachMedia(streamingElement.value!)
      hls.value.on(Hls.Events.MEDIA_ATTACHED, () => {
        streamingElement.value!.play()
      })
      hls.value.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          updateStatus('error')
        }
      })
    } else if (streamingElement.value!.canPlayType('application/vnd.apple.mpegurl')) {
      streamingElement.value!.src = url
    }
  } catch (e) {
    consola.error(`[HlsstreamCamera] failed to start playback "${props.camera.name}"`, e)

    updateStatus('error')
  }
}

function stopPlayback () {
  updateStatus('disconnected')
  hls.value?.destroy()
  hls.value = null
  streamingElement.value!.src = ''
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

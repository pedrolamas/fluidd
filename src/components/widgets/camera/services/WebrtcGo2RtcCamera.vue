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
import { consola } from 'consola'
import sleep from '@/util/sleep'

type RTCConfigurationWithSdpSemantics = RTCConfiguration & {
  sdpSemantics: 'unified-plan'
}

type Go2RtcReceivedMessageType = 'webrtc/candidate' | 'webrtc/offer' | 'webrtc/answer' | 'error'

type Go2RtcMessage = {
  type: Go2RtcReceivedMessageType,
  value?: string
}

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

const pc = ref<RTCPeerConnection | null>(null)
const ws = ref<WebSocket | null>(null)
const playbackAbortController = ref<AbortController | null>(null)
const sleepAbortController = ref<AbortController | null>(null)

// adapted from https://github.com/AlexxIT/go2rtc/blob/d7cdc8b3b07f6fbff7daae2736377de98444b962/www/video-rtc.js

function loadStream () {
  try {
    pc.value?.close()
    ws.value?.close()

    const abortControllerSignal = playbackAbortController.value?.signal

    if (!abortControllerSignal || abortControllerSignal.aborted) {
      return
    }

    updateStatus('connecting')

    const url = buildAbsoluteUrl(props.camera.stream_url || '')

    const socketUrl = new URL('api/ws' + url.search, url)

    socketUrl.protocol = socketUrl.protocol === 'https:'
      ? 'wss:'
      : 'ws:'

    ws.value = new WebSocket(socketUrl)
    ws.value.binaryType = 'arraybuffer'
    ws.value.onopen = onWebSocketOpen
    ws.value.onmessage = onWebSocketMessage
    ws.value.onclose = onWebSocketClose

    updateRawCameraUrl(url.toString())
  } catch (e) {
    consola.error(`[WebrtcGo2RtcCamera] failed to start playback "${props.camera.name}"`, e)
  }
}

async function onWebSocketOpen () {
  consola.debug('[WebrtcGo2RtcCamera] socket opened')

  const config: RTCConfigurationWithSdpSemantics = {
    bundlePolicy: 'max-bundle',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ],
    sdpSemantics: 'unified-plan'
  }

  pc.value = new RTCPeerConnection(config)

  pc.value.onicecandidate = ev => {
    if (!ev.candidate) return

    const msg: Go2RtcMessage = {
      type: 'webrtc/candidate',
      value: ev.candidate.toJSON().candidate
    }

    ws.value?.send(JSON.stringify(msg))
  }

  pc.value.onconnectionstatechange = () => {
    switch (pc.value?.connectionState) {
      case 'connected': {
        const tracks = pc.value.getTransceivers()
          .filter(tr => tr.direction === 'recvonly')
          .map(tr => tr.receiver.track)

        streamingElement.value!.srcObject = new MediaStream(tracks)

        break
      }
      case 'failed':
      case 'disconnected':
        loadStream()
    }
  }

  pc.value.addTransceiver('video', { direction: 'recvonly' })

  const offer = await pc.value.createOffer()

  await pc.value.setLocalDescription(offer)

  const msg: Go2RtcMessage = {
    type: 'webrtc/offer',
    value: offer.sdp
  }

  ws.value?.send(JSON.stringify(msg))
}

async function onWebSocketMessage (ev: MessageEvent) {
  const msg = JSON.parse(ev.data) as Go2RtcMessage

  switch (msg.type) {
    case 'webrtc/candidate':
      try {
        await pc.value?.addIceCandidate({ candidate: msg.value, sdpMid: '0' })
      } catch (error) {
        consola.warn('[WebrtcGo2RtcCamera] RTCPeerConnection.addIceCandidate() error', error)
      }
      break

    case 'webrtc/answer':
      try {
        pc.value?.setRemoteDescription({ type: 'answer', sdp: msg.value })
      } catch (error) {
        consola.warn('[WebrtcGo2RtcCamera] RTCPeerConnection.setRemoteDescription() error', error)
      }
      break

    case 'error':
      consola.error(`[WebrtcGo2RtcCamera] ${msg.value}`)
      updateStatus('error')
      pc.value?.close()
  }
}

async function onWebSocketClose (ev: CloseEvent) {
  if (!ev.wasClean) {
    updateStatus('error')

    consola.error('[WebrtcGo2RtcCamera] socket close was not clean', ev)

    const playbackAbortSignal = playbackAbortController.value?.signal

    if (!playbackAbortSignal || playbackAbortSignal.aborted) {
      return
    }

    sleepAbortController.value?.abort()

    const newSleepAbortController = sleepAbortController.value = new AbortController()

    try {
      const signals = [
        playbackAbortSignal,
        newSleepAbortController.signal,
      ]

      await sleep(2000, AbortSignal.any(signals))

      loadStream()
    } catch {}
  }
}

function startPlayback () {
  playbackAbortController.value = new AbortController()

  loadStream()
}

function stopPlayback () {
  playbackAbortController.value?.abort()
  playbackAbortController.value = null
  updateStatus('disconnected')
  if (pc.value) {
    pc.value.getSenders().forEach(sender => {
      sender.track?.stop()
    })
    pc.value.close()
    pc.value = null
  }
  ws.value?.close()
  ws.value = null
  streamingElement.value!.src = ''
  streamingElement.value!.srcObject = null
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

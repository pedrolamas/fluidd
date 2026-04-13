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

const iceServers = [
  {
    urls: [
      'stun:stun.l.google.com:19302'
    ]
  }
]

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
const remoteId = ref<string | null>(null)
const playbackAbortController = ref<AbortController | null>(null)
const sleepAbortController = ref<AbortController | null>(null)
const sendIceServers = ref(true)

// adapted from https://github.com/ayufan/camera-streamer/blob/2d3a4884378f384346680a55196bf9244b99b6b6/html/webrtc.html

async function loadStream () {
  pc.value?.close()

  const abortControllerSignal = playbackAbortController.value?.signal

  if (!abortControllerSignal || abortControllerSignal.aborted) {
    return
  }

  updateStatus('connecting')

  const url = buildAbsoluteUrl(props.camera.stream_url || '')

  updateRawCameraUrl(url.toString())

  try {
    const rtcSessionDescriptionInit = await sendInitialRequest(url, abortControllerSignal)

    remoteId.value = ('id' in rtcSessionDescriptionInit && typeof rtcSessionDescriptionInit.id === 'string')
      ? rtcSessionDescriptionInit.id
      : null

    const config: RTCConfigurationWithSdpSemantics = {
      sdpSemantics: 'unified-plan'
    }

    if ('iceServers' in rtcSessionDescriptionInit && Array.isArray(rtcSessionDescriptionInit.iceServers)) {
      config.iceServers = rtcSessionDescriptionInit.iceServers
    }

    const newPc = pc.value = new RTCPeerConnection(config)

    newPc.ondatachannel = (event: RTCDataChannelEvent) => {
      const dc = event.channel

      if (dc.label === 'keepalive') {
        dc.onmessage = () => {
          dc.send('pong')
        }
      }
    }

    newPc.addTransceiver('video', {
      direction: 'recvonly'
    })

    newPc.ontrack = (event: RTCTrackEvent) => {
      if (event.track.kind === 'video' && streamingElement.value) {
        streamingElement.value.srcObject = event.streams[0]
      }
    }

    if (config.iceServers) {
      newPc.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          try {
            await sendRemoteCandidatesRequest(url, [event.candidate], abortControllerSignal)
          } catch (e) {
            consola.error('[WebrtcCamerastreamerCamera] onicecandidate', e)
          }
        }
      }
    }

    await newPc.setRemoteDescription(rtcSessionDescriptionInit)

    const rtcLocalSessionDescriptionInit = await newPc.createAnswer()

    await newPc.setLocalDescription(rtcLocalSessionDescriptionInit)

    if (newPc.localDescription) {
      await sendOfferRequest(url, newPc.localDescription, abortControllerSignal)
    }
  } catch (e) {
    consola.error(`[WebrtcCamerastreamerCamera] failed to start playback "${props.camera.name}"`, e)

    onError()
  }
}

async function onError () {
  updateStatus('error')
  pc.value?.close()
  pc.value = null

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

async function startPlayback () {
  playbackAbortController.value = new AbortController()

  await loadStream()
}

async function sendInitialRequest (url: string | URL | Request, abortControllerSignal: AbortSignal): Promise<RTCSessionDescriptionInit> {
  try {
    const response = await fetch(url, {
      body: JSON.stringify({
        type: 'request',
        ...sendIceServers.value
          ? { iceServers }
          : undefined,
        keepAlive: true
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      signal: abortControllerSignal
    })

    await ensureResponseOk(response, 'application/json')

    const data = await response.json() as RTCSessionDescriptionInit

    return data
  } catch (e) {
    const aborted = (
      abortControllerSignal.aborted ||
      (
        e instanceof Error &&
        e.name === 'AbortError'
      )
    )

    if (!aborted) {
      // Switch whether to send iceServers next time
      sendIceServers.value = !sendIceServers.value
    }

    throw e
  }
}

async function sendRemoteCandidatesRequest (url: string | URL | Request, candidates: RTCIceCandidateInit[], abortControllerSignal: AbortSignal): Promise<void> {
  const response = await fetch(url, {
    body: JSON.stringify({
      type: 'remote_candidate',
      id: remoteId.value,
      candidates
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    signal: abortControllerSignal
  })

  await ensureResponseOk(response)
}

async function sendOfferRequest (url: string | URL | Request, offer: RTCSessionDescriptionInit, abortControllerSignal: AbortSignal): Promise<void> {
  const response = await fetch(url, {
    body: JSON.stringify({
      type: offer.type,
      id: remoteId.value,
      sdp: offer.sdp
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    signal: abortControllerSignal
  })

  await ensureResponseOk(response)
}

async function ensureResponseOk (response: Response, expectedContentType?: string): Promise<void> {
  const contentType = response.headers.get('Content-Type')

  const responseOk = (
    response.ok &&
    (
      !expectedContentType ||
      contentType?.includes(expectedContentType)
    )
  )

  if (!responseOk) {
    const body = await response.text()

    throw new Error(`Invalid response! Status: ${response.status}, Content-Type: ${contentType}, Body: ${body}`)
  }
}

function stopPlayback () {
  updateStatus('disconnected')
  playbackAbortController.value?.abort()
  playbackAbortController.value = null

  pc.value?.close()
  pc.value = null
  if (streamingElement.value) {
    streamingElement.value.src = ''
    streamingElement.value.srcObject = null
  }
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

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
import { ref, computed } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'
import { consola } from 'consola'

type RTCConfigurationWithSdpSemantics = RTCConfiguration & {
  sdpSemantics: 'unified-plan'
}

type RTCIceServerWithCredentialType = RTCIceServer & {
  credentialType?: 'password'
}

type MediamtxOffer = {
  iceUfrag: string,
  icePwd: string,
  medias: string[]
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
  buildAbsoluteUrl,
  menuItemClick,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

defineExpose({ menuItemClick })

const streamingElement = ref<HTMLVideoElement>()

// webrtc player methods
// adapted from https://github.com/bluenviron/mediamtx/blob/main/internal/servers/webrtc/read_index.html

const whepUrl = ref('')
const sessionUrl = ref('')
const pc = ref<RTCPeerConnection | null>(null)
const restartTimeout = ref<number | null>(null)
const offerData = ref<MediamtxOffer | null>(null)
const queuedCandidates = ref<RTCIceCandidate[]>([])

function unquoteCredential (v: string): string {
  return JSON.parse(`"${v}"`) as string
}

function linkToIceServers (links: string | null): RTCIceServerWithCredentialType[] {
  return (links !== null)
    ? links.split(', ').map((link) => {
      const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i)
      const ret: RTCIceServerWithCredentialType = {
        urls: [m![1]]
      }

      if (m![3] !== undefined) {
        ret.username = unquoteCredential(m![3])
        ret.credential = unquoteCredential(m![4])
        ret.credentialType = 'password'
      }

      return ret
    })
    : []
}

function parseOffer (offer: string): MediamtxOffer {
  const ret: MediamtxOffer = {
    iceUfrag: '',
    icePwd: '',
    medias: []
  }

  for (const line of offer.split('\r\n')) {
    if (line.startsWith('m=')) {
      ret.medias.push(line.slice('m='.length))
    } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
      ret.iceUfrag = line.slice('a=ice-ufrag:'.length)
    } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
      ret.icePwd = line.slice('a=ice-pwd:'.length)
    }
  }

  return ret
}

function generateSdpFragment (od: MediamtxOffer, candidates: RTCIceCandidate[]) {
  const candidatesByMedia: Record<number, RTCIceCandidate[]> = {}

  for (const candidate of candidates) {
    const mid = candidate.sdpMLineIndex!
    if (candidatesByMedia[mid] === undefined) {
      candidatesByMedia[mid] = []
    }
    candidatesByMedia[mid].push(candidate)
  }

  let frag = 'a=ice-ufrag:' + od.iceUfrag + '\r\n' + 'a=ice-pwd:' + od.icePwd + '\r\n'

  let mid = 0

  for (const media of od.medias) {
    if (candidatesByMedia[mid] !== undefined) {
      frag += 'm=' + media + '\r\n' + 'a=mid:' + mid + '\r\n'

      for (const candidate of candidatesByMedia[mid]) {
        frag += 'a=' + candidate.candidate + '\r\n'
      }
    }
    mid++
  }

  return frag
}

async function loadStream () {
  try {
    updateStatus('connecting')

    const res = await fetch(whepUrl.value, {
      method: 'OPTIONS'
    })

    const config: RTCConfigurationWithSdpSemantics = {
      iceServers: linkToIceServers(res.headers.get('Link')),
      // https://webrtc.org/getting-started/unified-plan-transition-guide
      sdpSemantics: 'unified-plan'
    }

    pc.value = new RTCPeerConnection(config)

    pc.value.addTransceiver('video', { direction: 'recvonly' })

    pc.value.onicecandidate = evt => {
      if (restartTimeout.value !== null) {
        return
      }

      if (evt.candidate !== null) {
        if (sessionUrl.value === '') {
          queuedCandidates.value.push(evt.candidate)
        } else {
          sendLocalCandidates([evt.candidate])
        }
      }
    }

    pc.value.oniceconnectionstatechange = () => {
      if (restartTimeout.value !== null) {
        return
      }

      if (pc.value?.iceConnectionState === 'disconnected') {
        consola.warn('[WebrtcMediamtxCamera] peer connection disconnected')

        onError()
      }
    }

    pc.value.ontrack = (evt) => {
      streamingElement.value!.srcObject = evt.streams[0]
    }

    const offer = await pc.value.createOffer()

    offerData.value = parseOffer(offer.sdp ?? '')

    pc.value.setLocalDescription(offer)

    sendOffer(offer)
  } catch (err: unknown) {
    consola.error(`[WebrtcMediamtxCamera] error on loadStream "${props.camera.name}"`, err)

    onError()
  }
}

function onError () {
  updateStatus('error')

  if (restartTimeout.value !== null) {
    return
  }

  if (pc.value !== null) {
    pc.value.close()
    pc.value = null
  }

  restartTimeout.value = window.setTimeout(() => {
    restartTimeout.value = null
    loadStream()
  }, 2000)

  if (sessionUrl.value) {
    fetch(sessionUrl.value, {
      method: 'DELETE'
    })

    sessionUrl.value = ''
  }

  queuedCandidates.value = []
}

async function sendLocalCandidates (candidates: RTCIceCandidate[]) {
  try {
    const res = await fetch(sessionUrl.value, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': '*'
      },
      body: generateSdpFragment(offerData.value!, candidates)
    })

    switch (res.status) {
      case 204:
        break

      case 404:
        throw new Error('stream not found')

      default:
        throw new Error(`bad status code ${res.status}`)
    }
  } catch (err: unknown) {
    consola.error('[WebrtcMediamtxCamera] error on sendLocalCandidates', err)

    onError()
  }
}

function onRemoteAnswer (sdp: string) {
  if (restartTimeout.value !== null) {
    return
  }

  pc.value?.setRemoteDescription(new RTCSessionDescription({
    type: 'answer',
    sdp
  }))

  if (queuedCandidates.value.length !== 0) {
    sendLocalCandidates(queuedCandidates.value)
    queuedCandidates.value = []
  }
}

async function sendOffer (offer: RTCSessionDescriptionInit) {
  try {
    const res = await fetch(whepUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp
    })

    switch (res.status) {
      case 201:
        break

      case 404:
        throw new Error('stream not found')

      default:
        throw new Error(`bad status code ${res.status}`)
    }

    sessionUrl.value = new URL(res.headers.get('location') ?? '', baseUrl.value).toString()

    const sdp = await res.text()

    onRemoteAnswer(sdp)
  } catch (err: unknown) {
    consola.error('[WebrtcMediamtxCamera] error on sendOffer', err)

    onError()
  }
}

const baseUrl = computed(() => {
  const url = buildAbsoluteUrl(props.camera.stream_url || '')

  if (!url.pathname.endsWith('/')) {
    url.pathname += '/'
  }

  return url
})

function startPlayback () {
  whepUrl.value = new URL('whep', baseUrl.value).toString()

  loadStream()
}

function stopPlayback () {
  updateStatus('disconnected')
  sessionUrl.value = ''
  queuedCandidates.value = []

  if (restartTimeout.value) {
    clearTimeout(restartTimeout.value)
    restartTimeout.value = null
  }
  if (pc.value) {
    pc.value.close()
    pc.value = null
  }
  streamingElement.value!.src = ''
  streamingElement.value!.srcObject = null
}

setPlaybackHandlers(startPlayback, stopPlayback)
</script>

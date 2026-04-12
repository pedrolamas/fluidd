<template>
  <video
    ref="streamingElement"
    autoplay
    disablePictureInPicture
    playsinline
    muted
    :style="cameraStyle"
    @play="updateStatus('connected')"
    @error="updateStatus('error')"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCameraMixin } from '@/composables/useCameraMixin'
import { consola } from 'consola'
import { useI18n } from '@/composables/useI18n'
import type { CameraNameMenuItem } from '@/types'

const props = defineProps<{
  camera: Moonraker.Webcam.Entry
  crossorigin?: 'anonymous' | 'use-credentials' | ''
}>()

const emit = defineEmits<{
  (e: string, ...args: any[]): void
}>()

const {
  cameraStyle,
  cameraNameMenuItems,
  updateStatus,
  updateCameraName,
  updateCameraNameMenuItems,
  setPlaybackHandlers,
} = useCameraMixin(props, emit)

const { tc } = useI18n()

const streamingElement = ref<HTMLVideoElement>()

async function startPlayback () {
  updateStatus('connecting')

  try {
    const stream = await getUserMedia()

    streamingElement.value!.srcObject = stream

    updateCameraName(await getDeviceLabel() ?? '')
  } catch (e) {
    consola.error(`[DeviceCamera] failed to start playback "${getSelectedDeviceCamera()}"`, e)

    updateStatus('error')
  }
}

function stopPlayback () {
  updateStatus('disconnected')

  try {
    const stream = streamingElement.value!.srcObject as MediaStream | null

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop()
        stream.removeTrack(track)
      }
    }
  } catch (e) {
    consola.error('[DeviceCamera] failed to stop and remove all tracks', e)
  }

  streamingElement.value!.srcObject = null
}

setPlaybackHandlers(startPlayback, stopPlayback)

async function getUserMedia () {
  const selectedDeviceCamera = getSelectedDeviceCamera()

  try {
    const key: keyof MediaTrackConstraints = ['environment', 'user'].includes(selectedDeviceCamera)
      ? 'facingMode'
      : 'deviceId'

    return await navigator.mediaDevices.getUserMedia({
      video: {
        [key]: selectedDeviceCamera
      }
    })
  } catch (e) {
    consola.error(`[DeviceCamera] failed to select device "${selectedDeviceCamera}"`, e)

    setSelectedDeviceCamera(null)

    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment'
      }
    })
  }
}

async function enumerateDevices () {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()

    return devices
      .filter(device => device.kind === 'videoinput')
  } catch (e) {
    consola.error('[DeviceCamera] failed to enumerate devices', e)

    return []
  }
}

async function getDeviceLabel () {
  if (cameraNameMenuItems.value.length === 0) {
    const devices = await enumerateDevices()

    const items = [
      {
        icon: '$camera',
        text: tc('app.general.label.environment_facing'),
        value: 'environment'
      },
      {
        icon: '$camera',
        text: tc('app.general.label.user_facing'),
        value: 'user'
      },
      ...devices
        .map(device => ({
          icon: '$camera',
          text: device.label,
          value: device.deviceId
        }))
    ]

    updateCameraNameMenuItems(items)
  }

  const selectedDeviceCamera = getSelectedDeviceCamera()

  return cameraNameMenuItems.value
    .find(item => item.value === selectedDeviceCamera)?.text
}

function getSelectedDeviceCamera () {
  return localStorage.getItem('deviceCamera.selectedCamera') ?? 'environment'
}

function setSelectedDeviceCamera (value?: string | null) {
  if (value) {
    localStorage.setItem('deviceCamera.selectedCamera', value)
  } else {
    localStorage.removeItem('deviceCamera.selectedCamera')
  }
}

function menuItemClick (item: CameraNameMenuItem) {
  if (getSelectedDeviceCamera() !== item.value) {
    setSelectedDeviceCamera(item.value)

    stopPlayback()

    updateCameraName(item.text)

    startPlayback()
  }
}

defineExpose({ menuItemClick })
</script>

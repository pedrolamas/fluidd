import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { consola } from 'consola'
import type { CameraConnectionStatus, CameraNameMenuItem } from '@/types'
import { useStore } from './useStore'

export function useCameraMixin (
  props: { camera: Moonraker.Webcam.Entry; crossorigin?: 'anonymous' | 'use-credentials' | '' },
  emit: (event: string, ...args: any[]) => void
) {
  const { typedState } = useStore()

  const streamingElement = ref<HTMLImageElement | HTMLIFrameElement | HTMLVideoElement>()
  const cameraTransformStyle = ref('')
  const animating = ref(false)
  const status = ref<CameraConnectionStatus>('disconnected')
  const cameraName = ref('')
  const cameraNameMenuItems = ref<CameraNameMenuItem[]>([])
  const framesPerSecond = ref(-1)
  const rawCameraUrl = ref('')

  const apiUrl = computed(() => typedState.config.apiUrl)

  const cameraStyle = computed(() => ({
    transform: cameraTransformStyle.value || undefined
  }))

  const autoRaiseFrameEvent = computed(() => true)

  function createTransform (): string {
    const element = streamingElement.value!
    const { rotation, flip_horizontal, flip_vertical } = props.camera
    const transformsArray: string[] = []

    const { clientWidth, clientHeight } = element

    const scale = (
      rotation === 0 ||
      rotation === 180 ||
      clientHeight === 0 ||
      clientWidth === 0
    )
      ? 1
      : clientHeight < clientWidth
        ? clientHeight / clientWidth
        : clientWidth / clientHeight

    if (scale !== 1 || flip_horizontal) {
      transformsArray.push(`scaleX(${flip_horizontal ? -scale : scale})`)
    }
    if (scale !== 1 || flip_vertical) {
      transformsArray.push(`scaleY(${flip_vertical ? -scale : scale})`)
    }
    if (rotation !== 0) {
      transformsArray.push(`rotate(${rotation}deg`)
    }

    return transformsArray.join(' ')
  }

  function updateCameraTransformStyle () {
    requestAnimationFrame(() => {
      if (!animating.value) return

      if (streamingElement.value) {
        cameraTransformStyle.value = createTransform()

        if (autoRaiseFrameEvent.value) {
          emit('frame', streamingElement.value)
        }
      }

      updateCameraTransformStyle()
    })
  }

  function checkPlayback () {
    if (!document.hidden) {
      startPlayback()
    } else {
      stopPlayback()
    }
  }

  function buildAbsoluteUrl (url: string) {
    const { origin } = new URL(document.URL)
    return new URL(url, origin)
  }

  function updateStatus (newStatus: CameraConnectionStatus) {
    status.value = newStatus
    emit('update:status', newStatus)
  }

  function updateCameraName (name: string) {
    cameraName.value = name
    emit('update:camera-name', name)
  }

  function updateCameraNameMenuItems (items: CameraNameMenuItem[]) {
    cameraNameMenuItems.value = items
    emit('update:camera-name-menu-items', items)
  }

  function updateFramesPerSecond (fps: number) {
    framesPerSecond.value = fps
    emit('update:frames-per-second', fps)
  }

  function updateRawCameraUrl (url: string) {
    rawCameraUrl.value = url
    emit('update:raw-camera-url', url)
  }

  // To be overridden by camera service components
  function startPlayback () {
    // noop
  }

  function stopPlayback () {
    // noop
  }

  function menuItemClick (item: CameraNameMenuItem) {
    consola.debug('Menu item click', item)
  }

  watch(() => props.camera, () => {
    stopPlayback()
    checkPlayback()
  })

  // created equivalent
  animating.value = true
  updateCameraTransformStyle()

  onMounted(() => {
    document.addEventListener('visibilitychange', checkPlayback, false)
    checkPlayback()
  })

  onBeforeUnmount(() => {
    animating.value = false
    document.removeEventListener('visibilitychange', checkPlayback)
    stopPlayback()
  })

  return {
    streamingElement,
    cameraTransformStyle,
    animating,
    status,
    cameraName,
    cameraNameMenuItems,
    framesPerSecond,
    rawCameraUrl,
    apiUrl,
    cameraStyle,
    autoRaiseFrameEvent,
    createTransform,
    updateCameraTransformStyle,
    checkPlayback,
    buildAbsoluteUrl,
    updateStatus,
    updateCameraName,
    updateCameraNameMenuItems,
    updateFramesPerSecond,
    updateRawCameraUrl,
    startPlayback,
    stopPlayback,
    menuItemClick,
  }
}

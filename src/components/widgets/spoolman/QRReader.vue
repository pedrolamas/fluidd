<template>
  <app-dialog
    v-model="open"
    no-actions
    :width="isMobileViewport ? '100%' : '60vw'"
    :title="$t('app.spoolman.title.scan_spool')"
  >
    <v-card-text>
      <v-alert :type="statusMessage.split('.')[0]">
        {{ $t(`app.spoolman.msg.${statusMessage}`) }}
      </v-alert>
      <canvas
        ref="canvas"
        :hidden="true"
      />
      <CameraItem
        v-if="cameraEntry"
        :camera="cameraEntry"
        crossorigin="anonymous"
        @frame="handlePrinterCameraFrame"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/composables/useStore'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useI18n } from '@/composables/useI18n'
import QrScanner from 'qr-scanner'
import CameraItem from '@/components/widgets/camera/CameraItem.vue'
import type { Spool } from '@/store/spoolman/types'

const spoomanDataPatterns = [
  /web\+spoolman:s-(\d+)/,
  /\/spool\/show\/(\d+)\/?/
]

const props = defineProps<{
  value?: string | null
}>()

const emit = defineEmits<{
  (e: 'input', value: string | null): void
  (e: 'detected', id: number): void
}>()

const { typedGetters } = useStore()
const { isMobileViewport } = useBrowserMixin()
const { t } = useI18n()

const statusMessage = ref('info.howto')
const lastScanTimestamp = ref(Date.now())
const processing = ref(false)
const context = ref<CanvasRenderingContext2D | null>(null)
const canvas = ref<HTMLCanvasElement>()

const source = computed({
  get: () => props.value ?? null,
  set: (v) => emit('input', v)
})

// Typed as Webcam.Entry for CameraItem — the v-if="open && camera" in template guards device service
const cameraEntry = computed<Moonraker.Webcam.Entry | undefined>(() =>
  typeof camera.value === 'object' && camera.value !== null && 'uid' in camera.value
    ? camera.value as Moonraker.Webcam.Entry
    : undefined
)

const camera = computed((): Moonraker.Webcam.Entry | { name: string, service: 'device' } | undefined => {
  if (source.value === 'device') {
    return {
      name: t('app.spoolman.label.device_camera'),
      service: 'device'
    }
  }

  if (source.value !== null) {
    return typedGetters['webcams/getWebcamById'](source.value)
  }
  return undefined
})

const open = computed({
  get: () => source.value !== null,
  set: (state: boolean) => {
    if (!state) {
      source.value = null
    }
  }
})

onMounted(async () => {
  processing.value = true
  context.value = canvas.value!.getContext('2d', { willReadFrequently: true })
  if (context.value === null) {
    statusMessage.value = 'error.no_image_data'
  }
  processing.value = false
})

async function handlePrinterCameraFrame (image: unknown) {
  if (!(image instanceof HTMLVideoElement) && !(image instanceof HTMLImageElement)) return
  // if broken canvas or still processing
  if (processing.value) {
    return
  }

  // limit to 10 scan attempts per second
  if (Date.now() - lastScanTimestamp.value < 100) {
    return
  }

  processing.value = true
  lastScanTimestamp.value = Date.now()

  if (image instanceof HTMLVideoElement) {
    canvas.value!.width = image.videoWidth
    canvas.value!.height = image.videoHeight
  } else {
    canvas.value!.width = image.naturalWidth
    canvas.value!.height = image.naturalHeight
  }

  if (!canvas.value!.width || !canvas.value!.height) {
    // no image drawn yet
    processing.value = false
    return
  }

  try {
    if (context.value) {
      context.value.drawImage(image, 0, 0, canvas.value!.width, canvas.value!.height)
      const result = await QrScanner.scanImage(canvas.value!, { returnDetailedScanResult: true })
      if (result.data) { handleCodeFound(result.data) }
    }
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'SecurityError') {
        statusMessage.value = 'error.cors'
      } else {
        statusMessage.value = 'error.no_image_data'
      }
    }

    // no QR code found
  }
  processing.value = false
}

const availableSpools = computed((): Spool[] => typedGetters['spoolman/getAvailableSpools'])

function handleCodeFound (code: string) {
  for (const pattern of spoomanDataPatterns) {
    const match = pattern.exec(code)

    if (match) {
      // code matches one of known patterns
      const spoolId = match[1]
      if (spoolId && !Number.isNaN(+spoolId)) {
        // valid spool ID
        const id = parseInt(spoolId)

        if (availableSpools.value.some(spool => spool.id === id)) {
          // spool exists in spoolman
          emit('detected', id)
        } else {
          // spool doesn't exist
          statusMessage.value = 'error.spool_not_existant'
        }
      } else {
        statusMessage.value = 'warning.invalid_spool_id'
      }

      return
    }
  }

  statusMessage.value = 'warning.code_not_recognized'
}
</script>

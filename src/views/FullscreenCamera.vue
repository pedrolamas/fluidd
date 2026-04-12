<template>
  <v-card
    v-if="camera"
    class="overflow-hidden"
  >
    <CameraItem
      :camera="camera"
      fullscreen
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router/composables'
import { useStore } from '@/composables/useStore'
import CameraItem from '@/components/widgets/camera/CameraItem.vue'

const route = useRoute()
const { typedGetters } = useStore()

const camera = ref<Moonraker.Webcam.Entry | null>(null)

const cameraId = route.params.cameraId
camera.value = typedGetters['webcams/getWebcamById'](cameraId) ?? null
</script>

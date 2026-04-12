<template>
  <collapsable-card
    :title="tc('app.general.title.camera', 2)"
    icon="$camera"
    :lazy="false"
    draggable
    layout-path="dashboard.camera-card"
    @collapsed="collapsed = $event"
  >
    <template #menu>
      <camera-menu
        @select="handleCameraSelect"
      />
    </template>

    <v-row
      v-if="cameras.length > 1"
      justify="space-around"
      class="ma-2"
    >
      <template v-for="camera in cameras">
        <v-col
          v-if="!collapsed"
          :key="camera.uid"
          cols="12"
          :sm="cols"
        >
          <camera-item
            :camera="camera"
          />
        </v-col>
      </template>
    </v-row>

    <camera-item
      v-if="!collapsed && cameras.length === 1"
      :camera="cameras[0]"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import CameraItem from '@/components/widgets/camera/CameraItem.vue'
import CameraMenu from './CameraMenu.vue'

const { typedGetters, typedDispatch } = useStore()
const { tc } = useI18n()

const collapsed = ref(false)

const cameras = computed((): Moonraker.Webcam.Entry[] => typedGetters['webcams/getVisibleWebcams'])

const cols = computed(() => {
  if (cameras.value.length === 1) return 12
  if (cameras.value.length <= 2) return 6
  return 4
})

function handleCameraSelect (id: string) {
  typedDispatch('webcams/updateActiveWebcam', id)
}
</script>

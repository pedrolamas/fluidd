<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    min-width="150"
  >
    <template #activator="{ on, attrs, value }">
      <app-btn
        v-bind="attrs"
        small
        class="me-1 my-1"
        v-on="on"
      >
        <v-icon
          small
          class="me-1"
        >
          $camera
        </v-icon>
        {{ activeCamera }}
        <v-icon
          small
          class="ms-1"
          :class="{ 'rotate-180': value }"
        >
          $chevronDown
        </v-icon>
      </app-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="camera of availableCameras"
        :key="camera.uid"
        @click="$emit('select', camera.uid)"
      >
        <v-list-item-icon>
          <v-icon>
            $camera
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ camera.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { typedState, typedGetters } = useStore()
const { t } = useI18n()

defineEmits<{
  (e: 'select', uid: string): void
}>()

const activeCamera = computed(() => {
  const activeWebcam: string = typedState.webcams.activeWebcam
  const camera: Moonraker.Webcam.Entry | undefined = typedGetters['webcams/getWebcamById'](activeWebcam)

  return !camera
    ? t('app.general.btn.all')
    : camera.name
})

const enabledWebcams = computed((): Moonraker.Webcam.Entry[] => typedGetters['webcams/getEnabledWebcams'])

const availableCameras = computed((): Pick<Moonraker.Webcam.Entry, 'uid' | 'name'>[] => [
  {
    uid: 'all',
    name: t('app.general.btn.all')
  },
  ...enabledWebcams.value
])
</script>

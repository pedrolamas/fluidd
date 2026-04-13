<template>
  <collapsable-card
    :title="$t('app.timelapse.title.timelapse_status')"
    icon="$info"
  >
    <v-card-text>
      <v-row>
        <div
          v-if="frameCount"
          style="position: relative"
        >
          <img
            :src="previewUrl"
            class="mx-auto thumbnail"
            :style="{filter: isRendering ? `saturate(${renderProgress}%)` : 'none'}"
          >
          <v-progress-circular
            v-if="isRendering"
            class="render-progress"
            color="primary"
            size="64"
            :value="renderProgress"
          />
        </div>
        <camera-item
          v-else-if="camera"
          :camera="camera"
        />
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-layout justify-center>
            <app-named-slider
              v-model="selectedFrame"
              :label="$tc('app.timelapse.label.frame')"
              :min="1"
              :max="frameCount"
              :suffix="`/ ${frameCount}`"
              :reset-value="frameCount"
              :disabled="!frameCount || isRendering"
            />
          </v-layout>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <v-spacer />

      <app-btn
        color="primary"
        text
        :disabled="!frameCount || savingFrames"
        @click="saveFrames()"
      >
        {{ $t('app.timelapse.btn.save_frames') }}
      </app-btn>
      <app-btn
        color="primary"
        :disabled="!frameCount || isRendering"
        @click="$emit('openRenderDialog', true)"
      >
        {{ $t('app.timelapse.btn.render') }}
      </app-btn>
    </v-card-actions>
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useStore } from '@/composables/useStore'
import type { TimelapseLastFrame } from '@/store/timelapse/types'
import { SocketActions } from '@/api/socketActions'
import CameraItem from '@/components/widgets/camera/CameraItem.vue'
import { defaultWritableSettings } from '@/store/timelapse/state'
import { Waits } from '@/globals'

defineEmits<{
  (e: 'openRenderDialog', value: boolean): void
}>()

const { hasWait } = useStateMixin()
const { createFileUrl } = useFilesMixin()
const { typedState, typedGetters } = useStore()

const selectedFrameNumber = ref(0)

function saveFrames () {
  SocketActions.machineTimelapseSaveFrames()
}

const savingFrames = computed(() => hasWait(Waits.onTimelapseSaveFrame))

const selectedFrame = computed({
  get: () => selectedFrameNumber.value || frameCount.value || 0,
  set: (value: number) => {
    selectedFrameNumber.value = value === frameCount.value ? 0 : value
  }
})

const previewUrl = computed(() => {
  const file = lastFrame.value?.file

  if (file) {
    const fullFile = selectedFrame.value
      ? `frame${selectedFrame.value.toString().padStart(6, '0')}.${file.split('.').pop()}`
      : file

    return createFileUrl(fullFile, 'timelapse_frames')
  }
  return ''
})

const isRendering = computed(() => renderStatus.value && renderStatus.value.status !== 'success')

const frameCount = computed(() => lastFrame.value?.uniqueCount)

const camera = computed((): Moonraker.Webcam.Entry | undefined =>
  typedGetters['webcams/getWebcamById'](settings.value.camera)
)

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const lastFrame = computed((): TimelapseLastFrame | null =>
  typedGetters['timelapse/getLastFrame']
)

const renderStatus = computed((): Moonraker.Timelapse.RenderResponse | null =>
  typedState.timelapse.renderStatus
)

const renderProgress = computed(() => {
  const rs = renderStatus.value

  if (rs?.status === 'running') {
    return rs.progress
  }

  return 0
})
</script>

<style lang="scss" scoped>
.thumbnail {
  width: 100%;
  pointer-events: none;
}

.render-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

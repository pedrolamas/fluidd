<template>
  <div>
    <v-subheader id="camera">
      {{ $tc('app.setting.title.camera', 2) }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          @click="handleAddDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ $t('app.setting.btn.add_camera') }}
        </app-btn>
      </app-setting>

      <template v-for="camera in cameras">
        <v-divider :key="`divider-${camera.uid}`" />

        <app-setting
          :key="`camera-${camera.uid}`"
          :r-cols="2"
          :sub-title="camera.source === 'config' ? $t('app.general.tooltip.managed_by_moonraker') : undefined"
        >
          <template #title>
            {{ camera.name }} <v-icon
              v-if="!camera.enabled"
              right
              small
              color="warning"
            >
              $warning
            </v-icon>
          </template>

          <app-btn
            icon
            @click.stop="handleEditDialog(camera)"
          >
            <v-icon dense>
              $edit
            </v-icon>
          </app-btn>

          <app-btn
            :disabled="camera.source === 'config'"
            icon
            @click.stop="handleRemoveCamera(camera)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </app-setting>
      </template>

      <v-divider />

      <app-setting :title="$t('app.setting.label.camera_fullscreen_action.title')">
        <v-select
          v-model="defaultFullscreenAction"
          filled
          dense
          hide-details
          :items="[
            {
              text: $t('app.setting.label.camera_fullscreen_action.embed'),
              value: 'embed',
            },{
              text: $t('app.setting.label.camera_fullscreen_action.rawstream'),
              value: 'rawstream',
            }
          ]"
        />
      </app-setting>

      <camera-config-dialog
        v-if="dialogState.active"
        v-model="dialogState.active"
        :camera="dialogState.camera"
        @save="handleSaveCamera"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CameraConfigDialog from './CameraConfigDialog.vue'
import { Globals } from '@/globals'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'

const { typedState, typedGetters, typedDispatch } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()

const dialogState = ref<any>({
  active: false,
  camera: null
})

const cameras = computed((): Moonraker.Webcam.Entry[] => typedGetters['webcams/getWebcams'])

const defaultFullscreenAction = computed({
  get: (): string => typedState.config.uiSettings.general.cameraFullscreenAction,
  set: (value: string) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.general.cameraFullscreenAction',
    value,
    server: true
  })
})

function handleEditDialog (camera: Moonraker.Webcam.Entry) {
  dialogState.value = {
    active: true,
    camera: { ...camera }
  }
}

function handleAddDialog () {
  const camera: Omit<Moonraker.Webcam.Entry, 'uid' | 'source'> = {
    enabled: true,
    flip_horizontal: false,
    flip_vertical: false,
    name: '',
    rotation: 0,
    service: 'mjpegstreamer-adaptive',
    target_fps: 15,
    target_fps_idle: 5,
    stream_url: Globals.DEFAULTS.CAMERA_URL_STREAM,
    snapshot_url: Globals.DEFAULTS.CAMERA_URL_SNAPSHOT
  }

  dialogState.value = {
    active: true,
    camera
  }
}

function handleSaveCamera (camera: Moonraker.Webcam.Entry) {
  typedDispatch('webcams/updateWebcam', camera)
}

async function handleRemoveCamera (camera: Moonraker.Webcam.Entry) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_camera', { name: camera.name }),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    typedDispatch('webcams/removeWebcam', camera.uid)
  }
}
</script>

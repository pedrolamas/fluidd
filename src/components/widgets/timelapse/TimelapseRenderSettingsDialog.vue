<template>
  <app-dialog
    v-model="open"
    :title="$t('app.timelapse.title.render_settings')"
    max-width="640"
    :no-actions="!renderable"
  >
    <v-card-text class="pa-0">
      <app-setting
        :title="$t('app.timelapse.setting.variable_fps')"
        :sub-title="subtitleIfBlocked(variableFpsBlocked)"
      >
        <v-switch
          v-model="variableFps"
          hide-details
          :disabled="variableFpsBlocked"
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting
        v-if="!variableFps"
        :title="$t('app.timelapse.setting.output_framerate')"
        :sub-title="subtitleIfBlocked(outputFramerateBlocked)"
      >
        <app-text-field
          :value="outputFramerate"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="outputFramerateBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          suffix="fps"
          submit-on-change
          @submit="setOutputFramerate"
        />
      </app-setting>

      <template v-else>
        <app-setting
          :title="$t('app.timelapse.setting.targetlength')"
          :sub-title="subtitleIfBlocked(targetLengthBlocked)"
        >
          <app-text-field
            :value="targetLength"
            :rules="[
              Rules.required,
              Rules.numberValid,
              Rules.numberGreaterThanOrEqual(0)
            ]"
            :disabled="targetLengthBlocked"
            hide-details="auto"
            filled
            dense
            single-line
            suffix="s"
            submit-on-change
            @submit="setTargetLength"
          />
        </app-setting>

        <v-divider />

        <app-setting
          :title="$t('app.timelapse.setting.variable_fps_min')"
          :sub-title="subtitleIfBlocked(minFpsBlocked)"
        >
          <app-text-field
            :value="minFps"
            :rules="[
              Rules.required,
              Rules.numberValid,
              Rules.numberGreaterThanOrEqual(0)
            ]"
            :disabled="minFpsBlocked"
            hide-details="auto"
            filled
            dense
            single-line
            suffix="fps"
            submit-on-change
            @submit="setMinFps"
          />
        </app-setting>

        <v-divider />

        <app-setting
          :title="$t('app.timelapse.setting.variable_fps_max')"
          :sub-title="subtitleIfBlocked(maxFpsBlocked)"
        >
          <app-text-field
            :value="maxFps"
            :rules="[
              Rules.required,
              Rules.numberValid,
              Rules.numberGreaterThanOrEqual(0)
            ]"
            :disabled="maxFpsBlocked"
            hide-details="auto"
            filled
            dense
            single-line
            suffix="fps"
            submit-on-change
            @submit="setMaxFps"
          />
        </app-setting>
      </template>

      <v-divider />

      <app-setting
        :title="$t('app.timelapse.setting.saveframes')"
        :sub-title="subtitleIfBlocked(saveFramesBlocked)"
      >
        <v-switch
          v-model="saveFrames"
          hide-details
          :disabled="saveFramesBlocked"
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.timelapse.setting.duplicatelastframe')"
        :sub-title="subtitleIfBlocked(duplicateFramesBlocked)"
      >
        <app-text-field
          :value="duplicateFrames"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0)
          ]"
          :disabled="duplicateFramesBlocked"
          hide-details="auto"
          filled
          dense
          single-line
          :suffix="$tc('app.timelapse.label.frame', duplicateFrames)"
          submit-on-change
          @submit="setDuplicateFrames"
        />
      </app-setting>

      <v-divider />

      <app-named-slider
        :value="crf"
        class="px-4 pt-3"
        style="overflow: hidden"
        :label="$tc('app.timelapse.setting.crf')"
        :min="0"
        :max="51"
        :reset-value="defaultCRF"
        :disabled="crfBlocked"
        @change="setCRF"
      />

      <v-divider />

      <app-setting
        :title="$t('app.timelapse.setting.previewimage')"
        :sub-title="subtitleIfBlocked(previewImageBlocked)"
      >
        <v-switch
          v-model="previewImage"
          hide-details
          :disabled="previewImageBlocked"
          @click.native.stop
        />
      </app-setting>
    </v-card-text>

    <template #actions>
      <v-spacer />

      <v-tooltip left>
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            color="primary"
            v-on="on"
            @click="renderTimelapse"
          >
            <v-icon>$play</v-icon>
            {{ $t('app.timelapse.btn.render') }}
          </app-btn>
        </template>
        <span>{{ $t('app.timelapse.label.length', { length: lengthEstimate }) }}</span>
      </v-tooltip>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Rules } from '@/plugins/filters'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { defaultWritableSettings } from '@/store/timelapse/state'
import type { TimelapseLastFrame } from '@/store/timelapse/types'

defineProps<{
  renderable: boolean
}>()

const { typedState, typedGetters } = useStore()
const { tc } = useI18n()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const settings = computed((): Moonraker.Timelapse.WriteableSettings =>
  typedState.timelapse.settings ?? defaultWritableSettings
)

const lastFrame = computed((): TimelapseLastFrame | null =>
  typedGetters['timelapse/getLastFrame']
)

const frameCount = computed((): number => lastFrame.value?.count ?? 0)

const duplicateLastFrameCount = computed((): number => settings.value.duplicatelastframe ?? 0)

const lengthEstimate = computed((): string => {
  const totalFrames = frameCount.value + duplicateLastFrameCount.value

  let framerate
  if (settings.value.variable_fps) {
    framerate = Math.min(
      settings.value.variable_fps_max,
      Math.max(
        settings.value.variable_fps_min,
        totalFrames / settings.value.targetlength)
    )
  } else {
    framerate = settings.value.output_framerate
  }

  const seconds = (totalFrames || 0) / framerate
  const minutes = Math.floor(seconds / 60)

  return `${minutes ? (minutes + 'm') : ''} ${Math.floor(seconds % 60)}s`.trim()
})

const outputFramerateBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('output_framerate')
)

const outputFramerate = computed((): number => settings.value.output_framerate)

function setOutputFramerate (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ output_framerate: Number(value) })
}

const variableFpsBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('variable_fps')
)

const variableFps = computed({
  get: (): boolean => settings.value.variable_fps,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ variable_fps: value })
  }
})

const targetLengthBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('targetlength')
)

const targetLength = computed((): number => settings.value.targetlength)

function setTargetLength (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ targetlength: Number(value) })
}

const minFpsBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('variable_fps_min')
)

const minFps = computed((): number => settings.value.variable_fps_min)

function setMinFps (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ variable_fps_min: Number(value) })
}

const maxFpsBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('variable_fps_max')
)

const maxFps = computed((): number => settings.value.variable_fps_max)

function setMaxFps (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ variable_fps_max: Number(value) })
}

const duplicateFramesBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('duplicatelastframe')
)

const duplicateFrames = computed((): number => settings.value.duplicatelastframe)

function setDuplicateFrames (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ duplicatelastframe: Number(value) })
}

const saveFramesBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('saveframes')
)

const saveFrames = computed({
  get: (): boolean => settings.value.saveframes,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ saveframes: value })
  }
})

const previewImageBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('previewimage')
)

const previewImage = computed({
  get: (): boolean => settings.value.previewimage,
  set: (value: boolean) => {
    SocketActions.machineTimelapsePostSettings({ previewimage: value })
  }
})

const crfBlocked = computed((): boolean =>
  typedGetters['timelapse/isBlockedSetting']('constant_rate_factor')
)

const crf = computed((): number => settings.value.constant_rate_factor)

function setCRF (value: unknown) {
  SocketActions.machineTimelapsePostSettings({ constant_rate_factor: Number(value) })
}

const defaultCRF = defaultWritableSettings.constant_rate_factor

function renderTimelapse () {
  SocketActions.machineTimelapseRender()
  open.value = false
}

function subtitleIfBlocked (blocked: boolean): string {
  return blocked ? tc('app.general.tooltip.managed_by_moonraker') : ''
}
</script>

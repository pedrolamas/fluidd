<template>
  <div>
    <v-subheader id="gcodePreview">
      {{ $t('app.setting.title.gcode_preview') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting :title="$t('app.setting.label.show_animations')">
        <v-switch
          v-model="showAnimations"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.draw_origin')">
        <v-switch
          v-model="drawOrigin"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.draw_background')">
        <v-switch
          v-model="drawBackground"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.default_min_layer_height')">
        <app-text-field
          :value="minLayerHeight"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0.1)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          submit-on-change
          @submit="setMinLayerHeight"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.extrusion_line_width')">
        <app-text-field
          :value="extrusionLineWidth"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThan(0)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          submit-on-change
          @submit="setExtrusionLineWidth"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.move_line_width')">
        <app-text-field
          :value="moveLineWidth"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThan(0)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          submit-on-change
          @submit="setMoveLineWidth"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.retraction_icon_size')">
        <app-text-field
          :value="retractionIconSize"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThan(0)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          submit-on-change
          @submit="setRetractionIconSize"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.flip_horizontal')">
        <v-switch
          v-model="flipHorizontal"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.flip_vertical')">
        <v-switch
          v-model="flipVertical"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.auto_load_on_print_start')">
        <v-switch
          v-model="autoLoadOnPrintStart"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <template v-if="autoLoadOnPrintStart">
        <v-divider />

        <app-setting :title="$t('app.setting.label.auto_load_mobile_on_print_start')">
          <v-switch
            v-model="autoLoadMobileOnPrintStart"
            hide-details
            @click.native.stop
          />
        </app-setting>
      </template>

      <v-divider />

      <app-setting :title="$t('app.setting.label.auto_follow_on_file_load')">
        <v-switch
          v-model="autoFollowOnFileLoad"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.hide_single_part_bounding_box')">
        <v-switch
          v-model="hideSinglePartBoundingBox"
          hide-details
          @click.native.stop
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.reset')">
        <app-btn
          outlined
          small
          color="primary"
          @click="handleReset"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
      </app-setting>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defaultState } from '@/store/config/state'
import { useStore } from '@/composables/useStore'
import { Rules } from '@/plugins/filters'

const { typedState, typedDispatch } = useStore()

const extrusionLineWidth = computed((): number => typedState.config.uiSettings.gcodePreview.extrusionLineWidth)

function setExtrusionLineWidth (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.extrusionLineWidth',
    value: +value,
    server: true
  })
}

const moveLineWidth = computed((): number => typedState.config.uiSettings.gcodePreview.moveLineWidth)

function setMoveLineWidth (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.moveLineWidth',
    value: +value,
    server: true
  })
}

const retractionIconSize = computed((): number => typedState.config.uiSettings.gcodePreview.retractionIconSize)

function setRetractionIconSize (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.retractionIconSize',
    value: +value,
    server: true
  })
}

const flipHorizontal = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.flip.horizontal,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.flip.horizontal',
    value,
    server: true
  })
})

const flipVertical = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.flip.vertical,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.flip.vertical',
    value,
    server: true
  })
})

const drawOrigin = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.drawOrigin,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.drawOrigin',
    value,
    server: true
  })
})

const drawBackground = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.drawBackground,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.drawBackground',
    value,
    server: true
  })
})

const showAnimations = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.showAnimations,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.showAnimations',
    value,
    server: true
  })
})

const minLayerHeight = computed((): number => typedState.config.uiSettings.gcodePreview.minLayerHeight)

function setMinLayerHeight (value: number) {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.minLayerHeight',
    value: +value,
    server: true
  })
}

const autoLoadMobileOnPrintStart = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.autoLoadMobileOnPrintStart,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.autoLoadMobileOnPrintStart',
    value,
    server: true
  })
})

const autoLoadOnPrintStart = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.autoLoadOnPrintStart,
  set: (value: boolean) => {
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.gcodePreview.autoLoadOnPrintStart',
      value,
      server: true
    })

    if (!value) {
      autoLoadMobileOnPrintStart.value = false
    }
  }
})

const autoFollowOnFileLoad = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.autoFollowOnFileLoad,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.autoFollowOnFileLoad',
    value,
    server: true
  })
})

const hideSinglePartBoundingBox = computed({
  get: (): boolean => typedState.config.uiSettings.gcodePreview.hideSinglePartBoundingBox,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview.hideSinglePartBoundingBox',
    value,
    server: true
  })
})

function handleReset () {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.gcodePreview',
    value: defaultState().uiSettings.gcodePreview,
    server: true
  })
}
</script>

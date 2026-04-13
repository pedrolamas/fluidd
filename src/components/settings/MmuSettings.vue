<template>
  <div>
    <v-subheader id="mmu">
      {{ $t('app.mmu.title.headline') }}
    </v-subheader>

    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        v-if="hasEncoder"
        :title="$t('app.mmu.setting.show_clog_detection')"
      >
        <v-switch
          v-model="showClogDetection"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_ttg_map')">
        <v-switch
          v-model="showTtgMap"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_details')">
        <v-switch
          v-model="showDetails"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.large_filament_status')">
        <v-switch
          v-model="largeFilamentStatus"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_unavailable_spool_color')">
        <v-switch
          v-model="showUnavailableSpoolColor"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_logos')">
        <v-switch
          v-model="showLogos"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_name')">
        <v-switch
          v-model="showName"
          hide-details
          class="mt-0 mb-4"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.mmu.setting.show_climate')">
        <v-switch
          v-model="showClimate"
          hide-details
          class="mt-0 mb-4"
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
import { useStore } from '@/composables/useStore'
import { useMmuMixin } from '@/composables/useMmuMixin'
import { defaultState } from '@/store/config/state'

const { typedState, typedDispatch } = useStore()
const { hasEncoder } = useMmuMixin()

const showClogDetection = computed({
  get: () => typedState.config.uiSettings.mmu.showClogDetection,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showClogDetection',
    value,
    server: true
  })
})

const showTtgMap = computed({
  get: () => typedState.config.uiSettings.mmu.showTtgMap,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showTtgMap',
    value,
    server: true
  })
})

const showDetails = computed({
  get: () => typedState.config.uiSettings.mmu.showDetails,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showDetails',
    value,
    server: true
  })
})

const largeFilamentStatus = computed({
  get: () => typedState.config.uiSettings.mmu.largeFilamentStatus,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.largeFilamentStatus',
    value,
    server: true
  })
})

const showUnavailableSpoolColor = computed({
  get: () => typedState.config.uiSettings.mmu.showUnavailableSpoolColor,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showUnavailableSpoolColor',
    value,
    server: true
  })
})

const showLogos = computed({
  get: () => typedState.config.uiSettings.mmu.showLogos,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showLogos',
    value,
    server: true
  })
})

const showName = computed({
  get: () => typedState.config.uiSettings.mmu.showName,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showName',
    value,
    server: true
  })
})

const showClimate = computed({
  get: () => typedState.config.uiSettings.mmu.showClimate,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu.showClimate',
    value,
    server: true
  })
})

function handleReset () {
  typedDispatch('config/saveByPath', {
    path: 'uiSettings.mmu',
    value: defaultState().uiSettings.mmu,
    server: true
  })
}
</script>

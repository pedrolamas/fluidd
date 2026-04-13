<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <app-btn
        icon
        v-bind="attrs"
        v-on="on"
      >
        <v-icon dense>
          $cog
        </v-icon>
      </app-btn>
    </template>

    <v-list dense>
      <v-list-item
        v-if="hasEncoder || hasSyncFeedback"
        @click="showClogDetection = !showClogDetection"
      >
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showClogDetection" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_clog_detection') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showTtgMap = !showTtgMap">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showTtgMap" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_ttg_map') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showDetails = !showDetails">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showDetails" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_details') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="largeFilamentStatus = !largeFilamentStatus">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="largeFilamentStatus" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.large_filament_status') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showUnavailableSpoolColor = !showUnavailableSpoolColor">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showUnavailableSpoolColor" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_unavailable_spool_color') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showName = !showName">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showName" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_name') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showLogos = !showLogos">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showLogos" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_logos') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showClimate = !showClimate">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showClimate" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.mmu.setting.show_climate') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'

const { sensors, hasEncoder } = useMmuMixin()
const { typedState, typedDispatch } = useStore()

function makeSetting (path: string) {
  const parts = path.split('.')
  return computed({
    get: () => {
      let obj: any = typedState.config.uiSettings
      for (const part of parts.slice(1)) obj = obj?.[part]
      return obj
    },
    set: (value: boolean) => {
      typedDispatch('config/saveByPath', { path: `uiSettings.${parts.slice(1).join('.')}`, value, server: true })
    },
  })
}

const showClogDetection = makeSetting('uiSettings.mmu.showClogDetection')
const showTtgMap = makeSetting('uiSettings.mmu.showTtgMap')
const showDetails = makeSetting('uiSettings.mmu.showDetails')
const largeFilamentStatus = makeSetting('uiSettings.mmu.largeFilamentStatus')
const showUnavailableSpoolColor = makeSetting('uiSettings.mmu.showUnavailableSpoolColor')
const showName = makeSetting('uiSettings.mmu.showName')
const showLogos = makeSetting('uiSettings.mmu.showLogos')
const showClimate = makeSetting('uiSettings.mmu.showClimate')

const hasFilamentProportionalSensor = computed(() => 'filament_proportional' in sensors.value)
const hasFilamentCompressionSensor = computed(() => 'filament_compression' in sensors.value)
const hasFilamentTensionSensor = computed(() => 'filament_tension' in sensors.value)

const hasSyncFeedback = computed(() =>
  hasFilamentCompressionSensor.value || hasFilamentTensionSensor.value || hasFilamentProportionalSensor.value
)
</script>

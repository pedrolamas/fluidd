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
      <v-list-item @click="showFilamentName = !showFilamentName">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showFilamentName" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.afc.ShowFilamentName') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showLaneInfinite = !showLaneInfinite">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showLaneInfinite" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.afc.ShowLaneInfinite') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showUnitIcons = !showUnitIcons">
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showUnitIcons" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.afc.ShowUnitIcons') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        v-if="td1Present"
        @click="showTd1Color = !showTd1Color"
      >
        <v-list-item-action class="my-0">
          <v-checkbox :input-value="showTd1Color" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.afc.ShowTd1Color') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <afc-card-settings-extruder
        v-for="extruder in afcExtruders"
        :key="extruder"
        :name="extruder"
      />

      <afc-card-settings-unit
        v-for="unit in afcUnits"
        :key="unit"
        :name="unit"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'
import AfcCardSettingsExtruder from '@/components/widgets/afc/AfcCardSettingsExtruder.vue'
import AfcCardSettingsUnit from '@/components/widgets/afc/AfcCardSettingsUnit.vue'

const { afc, afcExtruders, afcUnits, afcShowFilamentName, afcShowLaneInfinite, afcShowUnitIcons, afcShowTd1Color } = useAfcMixin()
const { typedDispatch } = useStore()

const td1Present = computed(() => afc.value?.td1_present === true)

const showFilamentName = computed({
  get: () => afcShowFilamentName.value,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.afc.showFilamentName',
    value,
    server: true
  })
})

const showLaneInfinite = computed({
  get: () => afcShowLaneInfinite.value,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.afc.showLaneInfinite',
    value,
    server: true
  })
})

const showUnitIcons = computed({
  get: () => afcShowUnitIcons.value,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.afc.showUnitIcons',
    value,
    server: true
  })
})

const showTd1Color = computed({
  get: () => afcShowTd1Color.value,
  set: (value: boolean) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.afc.showTd1Color',
    value,
    server: true
  })
})
</script>

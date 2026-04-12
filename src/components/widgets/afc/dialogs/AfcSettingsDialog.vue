<template>
  <app-dialog
    v-model="open"
    width="700"
    :title="$t('app.afc.AfcSettings')"
    scrollable
    no-actions
  >
    <template #menu>
      <v-btn
        text
        tile
        href="https://www.armoredturtle.xyz/docs/afc-klipper-add-on/toolhead/calculation.html"
        target="_blank"
        class="me-1"
      >
        <v-icon left>
          $afcHelp
        </v-icon>
        {{ $t('app.afc.SettingsDialog.Help') }}
      </v-btn>
    </template>

    <v-card-text class="d-flex flex-column gap-3">
      <afc-settings-dialog-hub
        v-for="hub in afcHubs"
        :key="hub"
        :name="hub"
      />
      <afc-settings-dialog-extruder
        v-for="extruder in afcExtruders"
        :key="extruder"
        :name="extruder"
      />
      <afc-settings-dialog-lane
        v-for="lane in afcLanes"
        :key="lane"
        :name="lane"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import AfcSettingsDialogHub from './AfcSettingsDialogHub.vue'
import AfcSettingsDialogExtruder from './AfcSettingsDialogExtruder.vue'
import AfcSettingsDialogLane from './AfcSettingsDialogLane.vue'

const props = defineProps<{
  value?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const { afcHubs, afcExtruders, afcLanes } = useAfcMixin()

const open = computed({
  get: () => props.value ?? false,
  set: (value: boolean) => emit('input', value)
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.height500 {
  max-height: 500px;
}
</style>

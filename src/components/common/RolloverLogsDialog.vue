<template>
  <app-dialog
    v-model="open"
    :title="$t('app.general.title.rollover_logs')"
    :save-button-text="$t('app.general.btn.accept')"
    max-width="400"
    @save="sendAccept"
  >
    <v-card-text>
      <v-radio-group
        v-model="application"
        hide-details
        mandatory
        class="mt-0"
      >
        <v-radio
          :label="$t('app.general.label.all')"
          :disabled="printerPrinting || printerPaused"
          value=""
        />
        <v-radio
          :disabled="printerPrinting || printerPaused"
          value="klipper"
        >
          <template #label>
            <div>Klipper <span class="secondary--text">(klippy.log)</span></div>
          </template>
        </v-radio>
        <v-radio value="moonraker">
          <template #label>
            <div>Moonraker <span class="secondary--text">(moonraker.log)</span></div>
          </template>
        </v-radio>
      </v-radio-group>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { useStateMixin } from '@/composables/useStateMixin'

const { printerPrinting, printerPaused } = useStateMixin()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const application = ref('')

onMounted(() => {
  if (printerPrinting.value || printerPaused.value) {
    application.value = 'moonraker'
  }
})

function sendAccept () {
  SocketActions.serverLogsRollover(application.value || undefined)
  open.value = false
}
</script>

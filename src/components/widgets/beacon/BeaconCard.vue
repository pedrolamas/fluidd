<template>
  <collapsable-card
    :title="$t('app.general.title.beacon')"
    icon="$beacon"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.beacon-card"
  >
    <template #menu>
      <app-btn
        v-if="!fullscreen"
        icon
        @click="$filters.routeTo({ name: 'tune' })"
      >
        <v-icon dense>
          $fullScreen
        </v-icon>
      </app-btn>
    </template>

    <template v-if="beaconModels.length > 0">
      <v-simple-table>
        <thead>
          <tr>
            <th>{{ $t('app.general.label.name') }}</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in beaconModels"
            :key="item.name"
          >
            <td class="">
              {{ item.name }}
            </td>
            <td>
              <v-chip
                v-if="item.active"
                small
                block
              >
                {{ $t('app.beacon.label.active') }}
              </v-chip>
            </td>
            <td
              class="text-right"
              nowrap
            >
              <v-tooltip
                v-if="!item.active"
                bottom
              >
                <template #activator="{ on, attrs }">
                  <app-btn
                    v-bind="attrs"
                    icon
                    @click="loadModel(item.name)"
                    v-on="on"
                  >
                    <v-icon dense>
                      $open
                    </v-icon>
                  </app-btn>
                </template>
                <span>{{ $t('app.beacon.tooltip.load') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <app-btn
                    v-bind="attrs"
                    icon
                    @click="removeModel(item.name)"
                    v-on="on"
                  >
                    <v-icon dense>
                      $close
                    </v-icon>
                  </app-btn>
                </template>
                <span>{{ $t('app.beacon.tooltip.delete') }}</span>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </template>

    <v-divider />

    <v-card-text>
      <div
        v-if="beaconModels.length === 0"
        class="mb-4"
      >
        No existing beacon models found
      </div>
      <v-row>
        <v-col cols="6">
          <app-btn
            block
            small
            color="primary"
            @click="handleOpenSaveDialog"
          >
            {{ $t('app.general.btn.save_as') }}
          </app-btn>
        </v-col>
        <v-col cols="6">
          <app-btn
            small
            block
            class="mb-2"
            :loading="hasWait(Waits.onBeaconCalibrate)"
            :disabled="printerBusy || !xyHomed"
            @click="calibrate"
          >
            {{ $t('app.general.btn.calibrate') }}
          </app-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <save-model-dialog
      v-if="saveDialogState.open"
      v-model="saveDialogState.open"
      :existing-name="saveDialogState.existingName"
      @save="handleModelSave"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SaveModelDialog from './SaveModelDialog.vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import type { BeaconModel } from '@/store/printer/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

defineProps<{
  fullscreen?: boolean
}>()

const { hasWait, sendGcode, printerBusy, printerPrinting } = useStateMixin()
const { xyHomed } = useToolheadMixin()
const { typedGetters, typedState } = useStore()
const confirm = useConfirm()
const { tc } = useI18n()

const saveDialogState = ref({
  open: false,
  existingName: 'default'
})

const beaconModels = computed<BeaconModel[]>(() => typedGetters['printer/getBeaconModels'])

async function loadModel (name: string) {
  const result = (
    !printerPrinting.value ||
    await confirm(
      tc('app.general.simple_form.msg.confirm_change_beacon_model'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    sendGcode(`BEACON_MODEL_SELECT NAME=${encodeGcodeParamValue(name)}`)
  }
}

function removeModel (name: string) {
  sendGcode(`BEACON_MODEL_REMOVE NAME=${encodeGcodeParamValue(name)}`)
}

function calibrate () {
  sendGcode('BEACON_CALIBRATE', Waits.onBeaconCalibrate)
}

function handleOpenSaveDialog () {
  const existingName: string = typedState.printer.printer.beacon?.model ?? ''

  saveDialogState.value = {
    open: true,
    existingName
  }
}

function handleModelSave (config: { name: string; removeDefault: boolean }) {
  const modelName: string | null | undefined = typedState.printer.printer.beacon?.model

  if (config.name !== modelName) {
    sendGcode(`BEACON_MODEL_SAVE NAME=${encodeGcodeParamValue(config.name)}`)
  }
  if (config.removeDefault && modelName) {
    sendGcode(`BEACON_MODEL_REMOVE NAME=${encodeGcodeParamValue(modelName)}`)
  }
}
</script>

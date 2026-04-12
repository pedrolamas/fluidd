<template>
  <app-dialog
    v-model="manualProbeDialogOpen"
    :title="$t('app.tool.title.manual_probe')"
    :cancel-button-text="$t('app.general.btn.abort')"
    :save-button-text="$t('app.general.btn.accept')"
    :save-button-loading="hasWait(Waits.onManualProbe)"
    max-width="450"
    @cancel="sendAbort"
    @save="sendAccept"
  >
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field
            label="Z Min"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="zPositionLower"
          />
        </v-col>
        <v-col>
          <v-text-field
            label="Z"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="zPosition"
          />
        </v-col>
        <v-col>
          <v-text-field
            label="Z Max"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="zPositionUpper"
          />
        </v-col>
      </v-row>

      <v-row class="bysect-row">
        <v-col
          cols="3"
          offset="1"
        >
          <app-btn-group class="d-flex">
            <app-btn
              :disabled="!klippyReady || printerPrinting"
              color="primary"
              @click="sendTestZ('--')"
            >
              --
            </app-btn>
            <app-btn
              :disabled="!klippyReady || printerPrinting"
              color="primary"
              @click="sendTestZ('-')"
            >
              -
            </app-btn>
          </app-btn-group>
        </v-col>
        <v-col
          cols="3"
          offset="4"
        >
          <app-btn-group class="d-flex">
            <app-btn
              :disabled="!klippyReady || printerPrinting"
              color="primary"
              @click="sendTestZ('+')"
            >
              +
            </app-btn>
            <app-btn
              :disabled="!klippyReady || printerPrinting"
              color="primary"
              @click="sendTestZ('++')"
            >
              ++
            </app-btn>
          </app-btn-group>
        </v-col>
      </v-row>

      <v-row
        v-for="offset in offsets"
        :key="offset"
        class="offset-row"
      >
        <v-col
          cols="3"
          offset="1"
        >
          <app-btn
            :disabled="!klippyReady || printerPrinting"
            color="primary"
            @click="sendTestZ(`-${offset}`)"
          >
            <v-icon>
              $minus
            </v-icon>
          </app-btn>
        </v-col>
        <v-col cols="4">
          <div
            class="v-btn v-size--default btncolor"
          >
            {{ offset }}
          </div>
        </v-col>
        <v-col cols="3">
          <app-btn
            :disabled="!klippyReady || printerPrinting"
            color="primary"
            @click="sendTestZ(`+${offset}`)"
          >
            <v-icon>
              $plus
            </v-icon>
          </app-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'

const { hasWait, sendGcode, klippyReady, printerPrinting } = useStateMixin()
const { isManualProbeActive, manualProbeDialogOpen } = useToolheadMixin()
const { typedState } = useStore()

const offsets = computed<number[]>(() =>
  [
    1,
    0.1,
    ...typedState.config.uiSettings.general.zAdjustDistances
  ].sort((a, b) => b - a)
)

const manualProbe = computed<Klipper.ManualProbeState | undefined>(
  () => typedState.printer.printer.manual_probe
)

const zPositionLower = computed(() => manualProbe.value?.z_position_lower?.toFixed(3) ?? '')
const zPosition = computed(() => manualProbe.value?.z_position?.toFixed(3) ?? '')
const zPositionUpper = computed(() => manualProbe.value?.z_position_upper?.toFixed(3) ?? '')

const showManualProbeDialogAutomatically = computed<boolean>(
  () => typedState.config.uiSettings.general.showManualProbeDialogAutomatically
)

watch(isManualProbeActive, (value) => {
  if (
    !value ||
    (
      showManualProbeDialogAutomatically.value &&
      klippyReady.value &&
      !printerPrinting.value
    )
  ) {
    manualProbeDialogOpen.value = value
  }
})

function sendTestZ (zValue: string) {
  sendGcode(`TESTZ Z=${zValue}`)
}

function sendAbort () {
  sendGcode('ABORT', Waits.onManualProbe)
  manualProbeDialogOpen.value = false
}

function sendAccept () {
  sendGcode('ACCEPT', Waits.onManualProbe)
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  .bysect-row > .col {
    padding: 4px 1px;

    & .v-btn {
      min-width: 40px;
      flex-grow: 1;
    }
  }

  .offset-row > .col {
    padding: 4px 1px;

    & > * {
      border-radius: 0;
      width: 100%;
    }

    &:first-child > * {
      border-radius: $border-radius-root 0 0 $border-radius-root;
    }
    &:last-child > * {
      border-radius: 0 $border-radius-root $border-radius-root 0;
    }
  }
</style>

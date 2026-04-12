<template>
  <app-dialog
    v-model="bedScrewsAdjustDialogOpen"
    :title="$t('app.tool.title.bed_screws_adjust')"
    max-width="450"
    @save="sendAccept"
  >
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field
            :label="$t('app.general.label.screw_name')"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="currentScrewName"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            :label="$t('app.general.label.screw_index')"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="$t('app.general.label.partial_of_total', {partial: currentScrewIndex + 1, total: totalScrews})"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            :label="$t('app.general.label.accepted_screws')"
            outlined
            persistent-placeholder
            hide-details
            dense
            disabled
            :value="$t('app.general.label.partial_of_total', {partial: acceptedScrews, total: totalScrews})"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-subtitle-1 text-center">
          <span v-safe-html="$t('app.general.msg.bed_screws_adjust')" />
        </v-col>
      </v-row>

      <v-progress-linear
        :value="acceptedScrews / totalScrews * 100"
        class="mt-2"
      />
    </v-card-text>

    <template #actions>
      <v-spacer />

      <app-btn
        color="warning"
        text
        type="button"
        @click="sendAbort"
      >
        {{ $t('app.general.btn.abort') }}
      </app-btn>

      <app-btn
        :loading="hasWait(Waits.onBedScrewsAdjust)"
        color="primary"
        text
        type="button"
        @click="sendAdjusted"
      >
        {{ $t('app.general.btn.adjusted') }}
      </app-btn>

      <app-btn
        :loading="hasWait(Waits.onBedScrewsAdjust)"
        color="primary"
        type="submit"
      >
        {{ $t('app.general.btn.accept') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import type { BedScrews } from '@/store/printer/types'

const { hasWait, sendGcode, klippyReady, printerPrinting } = useStateMixin()
const { isBedScrewsAdjustActive, bedScrewsAdjustDialogOpen } = useToolheadMixin()
const { typedGetters, typedState } = useStore()

const bedScrews = computed<BedScrews>(() => typedGetters['printer/getBedScrews'])

const currentScrewIndex = computed(() => bedScrews.value.current_screw ?? 0)

const currentScrewName = computed(() => bedScrews.value.screws[currentScrewIndex.value]?.prettyName ?? '')

const acceptedScrews = computed(() => bedScrews.value.accepted_screws ?? 0)

const totalScrews = computed(() => bedScrews.value.screws.length)

const showBedScrewsAdjustDialogAutomatically = computed<boolean>(
  () => typedState.config.uiSettings.general.showBedScrewsAdjustDialogAutomatically
)

watch(isBedScrewsAdjustActive, (value) => {
  if (
    !value ||
    (
      showBedScrewsAdjustDialogAutomatically.value &&
      klippyReady.value &&
      !printerPrinting.value
    )
  ) {
    bedScrewsAdjustDialogOpen.value = value
  }
})

function sendAbort () {
  sendGcode('ABORT', Waits.onBedScrewsAdjust)
  bedScrewsAdjustDialogOpen.value = false
}

function sendAdjusted () {
  sendGcode('ADJUSTED', Waits.onBedScrewsAdjust)
}

function sendAccept () {
  sendGcode('ACCEPT', Waits.onBedScrewsAdjust)
}
</script>

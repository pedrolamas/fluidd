<template>
  <app-dialog
    v-model="screwsTiltAdjustDialogOpen"
    :title="$t('app.tool.title.screws_tilt_adjust')"
    max-width="500"
    @save="retry"
  >
    <v-card-text class="pa-0">
      <v-simple-table>
        <thead>
          <tr>
            <th>{{ $t('app.general.label.name') }}</th>
            <th class="text-right">
              Z
            </th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="screw in screwsTiltAdjust.screws"
            :key="screw.name"
          >
            <td>
              {{ screw.prettyName }}<br>
              <small class="secondary--text">{{ `X = ${screw.x}, Y = ${screw.y}` }}</small>
            </td>
            <td class="focus--text text-right">
              <small
                v-if="screw.relativeZ"
                class="secondary--text"
              >({{ `${screw.relativeZ < 0 ? '' : '+'}${screw.relativeZ.toFixed(4)}` }})</small>
              {{ screw.z.toFixed(4) }}
            </td>
            <td class="text-right">
              <v-chip
                v-if="screw.is_base"
                small
                label
              >
                {{ $t('app.bedmesh.label.base') }}
              </v-chip>
              <v-chip
                v-else
                :color="screw.adjustMinutes < 6 ? 'success' : 'error'"
                small
                label
              >
                <v-icon
                  left
                  small
                >
                  {{ screw.adjustMinutes === 0 ? '$success' : screw.sign === 'CW' ? '$zRotateClockwise' : '$zRotateCounterclockwise' }}
                </v-icon>
                {{ screw.adjust }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>

    <template #actions>
      <v-spacer />

      <app-btn
        color="primary"
        type="submit"
      >
        {{ $t('app.general.btn.retry') }}
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
import type { ScrewsTiltAdjust } from '@/store/printer/types'

const { sendGcode, klippyReady, printerPrinting } = useStateMixin()
const { hasScrewsTiltAdjustResults, screwsTiltAdjustDialogOpen } = useToolheadMixin()
const { typedGetters, typedState, typedCommit } = useStore()

const screwsTiltAdjust = computed<ScrewsTiltAdjust>(() => typedGetters['printer/getScrewsTiltAdjust'])

const showScrewsTiltAdjustDialogAutomatically = computed<boolean>(
  () => typedState.config.uiSettings.general.showScrewsTiltAdjustDialogAutomatically
)

watch(hasScrewsTiltAdjustResults, (value) => {
  screwsTiltAdjustDialogOpen.value = (
    value &&
    showScrewsTiltAdjustDialogAutomatically.value &&
    klippyReady.value &&
    !printerPrinting.value
  )
})

watch(screwsTiltAdjustDialogOpen, (value) => {
  if (!value) {
    typedCommit('printer/setClearScrewsTiltAdjust')
  }
})

function retry () {
  sendGcode('SCREWS_TILT_CALCULATE', Waits.onBedScrewsCalculate)
  screwsTiltAdjustDialogOpen.value = false
}
</script>

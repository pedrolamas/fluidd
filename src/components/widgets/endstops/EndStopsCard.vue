<template>
  <collapsable-card
    :title="$t('app.general.title.endstops')"
    :sub-title="$t('app.endstop.msg.subtitle')"
    icon="$expandHorizontal"
  >
    <template #collapse-button>
      <app-btn
        :loading="hasWait($waits.onQueryEndstops) || hasWait($waits.onQueryProbe)"
        icon
        @click="queryEndstops"
      >
        <v-icon dense>
          $refresh
        </v-icon>
      </app-btn>
    </template>
    <v-simple-table v-if="hasEndstops">
      <tbody>
        <tr
          v-for="item in endstopsAndProbes"
          :key="item.name"
        >
          <td>
            {{ item.prettyName }}
          </td>
          <td>
            <v-chip
              :color="item.state ? 'warning' : 'secondary'"
              small
              label
            >
              <v-icon
                small
                left
              >
                {{ item.state ? '$markedCircle' : '$blankCircle' }}
              </v-icon>
              <template v-if="item.state">
                {{ $t('app.endstop.states.label.triggered') }}
              </template>
              <template v-else>
                {{ $t('app.endstop.states.label.open') }}
              </template>
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { SocketActions } from '@/api/socketActions'
import { Waits } from '@/globals'
import type { Endstop, Probe } from '@/store/printer/types'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

const { typedGetters, typedCommit } = useStore()
const { sendGcode, hasWait } = useStateMixin()

const endstops = computed<Endstop[]>(() => typedGetters['printer/getEndstops'])
const hasSteppers = computed(() => typedGetters['printer/getSteppers'].length > 0)
const probe = computed<Probe | undefined>(() => typedGetters['printer/getProbe'])
const hasEndstops = computed(() => endstops.value.length > 0)

const endstopsAndProbes = computed(() => {
  const items = [...endstops.value]
  if (probe.value != null) {
    items.push({
      name: probe.value.name,
      prettyName: probe.value.prettyName,
      state: probe.value.last_query
    })
  }
  return items
})

function queryEndstops () {
  if (hasSteppers.value) SocketActions.printerQueryEndstops()
  if (probe.value !== undefined) sendGcode('QUERY_PROBE', Waits.onQueryProbe)
}

onUnmounted(() => typedCommit('printer/setClearEndStops'))
</script>

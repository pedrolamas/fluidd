<template>
  <app-dialog
    v-model="open"
    :title="$t('app.afc.InfiniteSpoolHeadline')"
    width="400"
    no-actions
  >
    <v-card-text>
      <v-row>
        <v-col class="pb-0">
          <p>{{ $t('app.afc.InfiniteSpoolDescription', { name: $filters.prettyCase(name) }) }}</p>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-0 text-center">
          <v-btn
            v-for="lane in laneList"
            :key="lane"
            :disabled="runoutLane === lane"
            color="primary"
            class="ma-2"
            @click="setRunout(lane)"
          >
            {{ lane }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  value?: boolean
  name: string
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const { sendGcode } = useStateMixin()
const { afcLanes, getAfcLaneObject } = useAfcMixin()

const open = computed({
  get: () => props.value ?? false,
  set: (value: boolean) => emit('input', value)
})

const currentLane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const runoutLane = computed(() => currentLane.value?.runout_lane ?? 'NONE')

const laneList = computed(() => {
  const list: string[] = []

  for (const laneName of afcLanes.value) {
    if (laneName === props.name) continue

    const l = getAfcLaneObject(laneName)

    if (l?.prep === true && l.load === true) {
      list.push(l.name)
    }
  }

  return ['NONE', ...list.sort((a, b) => a.localeCompare(b))]
})

function setRunout (newLane: string) {
  sendGcode(`SET_RUNOUT LANE=${encodeGcodeParamValue(props.name)} RUNOUT=${encodeGcodeParamValue(newLane)}`)
  open.value = false
}
</script>

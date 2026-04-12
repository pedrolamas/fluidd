<template>
  <app-dialog
    v-model="open"
    :title="$t('app.afc.LaneMapping')"
    width="400"
    no-actions
  >
    <v-card-text>
      <v-row>
        <v-col class="pb-0">
          <p>{{ $t('app.afc.LaneMappingToCommand', { name: $filters.prettyCase(name) }) }}</p>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-0 text-center">
          <v-btn
            v-for="tool in mapList"
            :key="tool"
            :disabled="tool.toLowerCase() === mappedTool.toLowerCase()"
            color="primary"
            class="ma-2"
            @click="mapTool(tool)"
          >
            {{ tool.toUpperCase() }}
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

const lane = computed(() => getAfcLaneObject(props.name))

const mappedTool = computed(() => lane.value?.map ?? '--')

const mapList = computed(() => {
  const list: string[] = []

  for (const laneName of afcLanes.value) {
    const l = getAfcLaneObject(laneName)
    if (l?.map != null) {
      list.push(l.map)
    }
  }

  return list.sort((a, b) => a.localeCompare(b))
})

function mapTool (newTool: string) {
  sendGcode(`SET_MAP LANE=${encodeGcodeParamValue(props.name)} MAP=${encodeGcodeParamValue(newTool)}`)
  open.value = false
}
</script>

<template>
  <svg
    ref="ttgMap"
    :viewBox="'0 0 ' + width + ' ' + height"
    preserveAspectRatio="xMidYMid meet"
    class="cursor-pointer"
    @click="$emit('click')"
  >
    <defs>
      <marker
        id="squareStart"
        markerWidth="7"
        markerHeight="7"
        refX="7"
        refY="3.5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <rect
          x="0"
          y="0"
          width="7"
          height="7"
          stroke-width="2"
          class="stroke-background-color fill-regular-color"
        />
      </marker>
      <marker
        id="squareStartSelected"
        markerWidth="7"
        markerHeight="7"
        refX="7"
        refY="3.5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <rect
          x="0"
          y="0"
          width="7"
          height="7"
          stroke-width="2"
          class="stroke-selected-color fill-selected-color"
        />
      </marker>
      <marker
        id="arrowEnd"
        markerWidth="7"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon
          points="0 0, 7 3.5, 0 7"
          stroke-width="1"
          class="stroke-background-color fill-regular-color"
        />
      </marker>
      <marker
        id="arrowEndSelected"
        markerWidth="7"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon
          points="0 0, 7 3.5, 0 7"
          stroke-width="1"
          class="stroke-selected-color fill-selected-color"
        />
      </marker>
    </defs>

    <g
      v-for="(g, t) in map"
      :key="'tool' + t"
    >
      <text
        :x="toolX"
        :y="t * verticalSpacing + startY + 8"
        text-anchor="end"
        :fill="t === selectedTool ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'"
        font-size="10px"
        :font-weight="t === selectedTool ? 'bold' : 'normal'"
      >
        T{{ t }}
      </text>
      <text
        :x="gateX"
        :y="t * verticalSpacing + startY + 8"
        text-anchor="start"
        :fill="t === selectedGate ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'"
        font-size="10px"
        :font-weight="t === selectedGate ? 'bold' : 'normal'"
      >
        #{{ t }}
      </text>
      <g v-if="t !== selectedTool">
        <path
          :d="generateMappingPathD(t)"
          stroke-width="4"
          class="stroke-background-color"
          fill="none"
        />
        <path
          :d="generateMappingPathD(t)"
          stroke-width="2"
          class="stroke-regular-color"
          fill="none"
          marker-start="url(#squareStart)"
          marker-end="url(#arrowEnd)"
        />
      </g>
    </g>
    <g v-if="selectedTool >= 0">
      <path
        :d="generateMappingPathD(selectedTool)"
        stroke-width="6"
        class="stroke-background-color"
        fill="none"
      />
      <path
        :d="generateMappingPathD(selectedTool)"
        stroke-width="4"
        class="stroke-selected-color"
        fill="none"
        marker-start="url(#squareStartSelected)"
        marker-end="url(#arrowEndSelected)"
      />
    </g>
    <g v-if="showEsGroups">
      <g
        v-for="(group, index) in getEndlessSpoolGroups()"
        :key="'group_' + index"
      >
        <g v-if="group !== currentGroup">
          <path
            :d="generateEndlessSpoolPathD(group, index)"
            stroke-width="2"
            stroke-linecap="round"
            class="stroke-regular-color"
            fill="none"
          />
          <text
            :x="groupX + index * groupSpacing"
            :y="startY + map.length * verticalSpacing + 2"
            class="fill-regular-color"
            fill="red"
            font-size="8px"
          >
            {{ String.fromCharCode(group + 65) }}
          </text>
        </g>
        <g v-else>
          <path
            :d="generateEndlessSpoolPathD(group, index)"
            stroke-width="2"
            stroke-linecap="round"
            class="stroke-selected-color"
            fill="none"
          />
          <text
            :x="groupX + index * groupSpacing"
            :y="startY + map.length * verticalSpacing + 2"
            class="fill-selected-color"
            fill="red"
            font-size="8px"
            font-weight="bold"
          >
            {{ String.fromCharCode(group + 65) }}
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineEmits<{
  (e: 'click'): void
}>()

const props = withDefaults(defineProps<{
  map: number[]
  groups: number[]
  startX?: number
  startY?: number
  verticalSpacing?: number
  groupSpacing?: number
  mapSpace?: number
  leader?: number
  showEsGroups?: boolean
  selectedTool?: number
  selectedGate?: number
}>(), {
  startX: 10,
  startY: 8,
  verticalSpacing: 12,
  groupSpacing: 12,
  mapSpace: 80,
  leader: 10,
  showEsGroups: true,
  selectedTool: -1,
  selectedGate: -1,
})

const toolX = computed(() => props.startX + 14)
const gateX = computed(() => props.startX + 2 * props.leader + props.mapSpace + 40)
const groupX = computed(() => props.startX + 2 * props.leader + props.mapSpace + 65)

const width = computed(() => groupX.value + getEndlessSpoolGroups().length * props.groupSpacing)
const height = computed(() => props.startY + props.map.length * props.verticalSpacing + 6)

const currentGroup = computed(() =>
  props.selectedGate >= 0 ? props.groups[props.selectedGate] : -1
)

function generateMappingPathD (tool: number): string {
  const xOffset = 28
  const x1 = props.startX + xOffset
  const y1 = props.startY + tool * props.verticalSpacing + 4
  const tX = x1 + props.leader
  const gX = tX + props.mapSpace
  const gate = props.map[tool]
  const tSpace = 2
  const gSpace = 2
  return (
    `M ${x1} ${y1} L ${tX} ${y1} ` +
    `L ${tX + gate * tSpace} ${y1} ` +
    `L ${gX - (props.map.length - gate) * gSpace} ${props.startY + gate * props.verticalSpacing + 4} ` +
    `L ${gX + props.leader} ${props.startY + gate * props.verticalSpacing + 4}`
  )
}

function generateEndlessSpoolPathD (group: number, index: number): string {
  const tick = 5
  const x1 = gateX.value + 24 + index * props.groupSpacing
  const y1 = props.startY + 4
  let dStr = ''
  let y0: number | null = null
  const gatesInGroup = findAllGatesInGroup(group)
  if (gatesInGroup.length > 1) {
    gatesInGroup.forEach((gate) => {
      const y = y1 + gate * props.verticalSpacing
      dStr += `M ${x1 + tick} ${y} L ${x1} ${y} `
      if (y0 !== null) dStr += `M ${x1 + tick} ${y0} L ${x1 + tick} ${y} `
      y0 = y
    })
  }
  return dStr
}

function getEndlessSpoolGroups (): number[] {
  const countMap: { [key: number]: number } = {}
  props.groups.forEach((num) => {
    countMap[num] = (countMap[num] ?? 0) + 1
  })
  return Object.keys(countMap).filter((key) => countMap[+key] > 1).map(Number).sort((a, b) => a - b)
}

function findAllGatesInGroup (group: number): number[] {
  const gatesInGroup: number[] = []
  props.groups.forEach((g, index) => {
    if (g === group) gatesInGroup.push(index)
  })
  return gatesInGroup
}
</script>

<style scoped>
/* Bug in <path> requires separation of styles - fill attribute doesn't override! */
.stroke-regular-color {
    stroke: var(--v-secondary-lighten2, #808080);
}
.stroke-selected-color {
    stroke: var(--v-primary-lighten1, #2ca9bc);
}
.stroke-background-color {
    stroke: var(--background-color);
}
.fill-regular-color {
    fill: var(--v-secondary-lighten2, #808080);
}
.fill-selected-color {
    fill: var(--v-primary-lighten1, #2ca9bc);
}
.fill-background-color {
    fill: var(--background-color);
}
</style>

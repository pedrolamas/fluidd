<template>
  <app-dialog
    v-model="open"
    width="800"
    title-shadow
    :fullscreen="isMobileViewport"
    :title="$t('app.mmu.title.edit_ttg_map')"
    :save-button-text="file ? $t('app.general.btn.print') : $t('app.mmu.label.save')"
    @save="commit"
    @cancel="close"
  >
    <!-- UPPER SECTION -->
    <v-card-subtitle>
      <v-container
        fluid
        pa-2
      >
        <!-- HEADER -->
        <v-row>
          <v-col
            cols="8"
            class="d-flex justify-start align-center no-padding"
          >
            <span v-if="allTools">{{ $t('app.mmu.msg.map_tools') }}</span>
            <span v-else>{{ $t('app.mmu.msg.map_slicer_tools') }}</span>
          </v-col>
          <v-col
            cols="4"
            class="d-flex flex-column align-end no-padding"
          >
            <v-container>
              <v-row class="justify-end pa-0">
                <v-col class="d-flex align-center justify-end no-padding pr-6">
                  <div class="mr-4">
                    {{ $t('app.mmu.label.all_tools') }}
                  </div>
                  <v-switch
                    v-model="allTools"
                    :disabled="allToolsDisabled"
                    hide-details
                    class="short-switch"
                  />
                </v-col>
              </v-row>
              <v-row
                v-if="!allToolsDisabled && macroVarsAutomapStrategy !== 'none'"
                class="justify-end pa-0"
              >
                <v-col class="d-flex align-center justify-end no-padding pr-6">
                  <div class="mr-4">
                    {{ $t('app.mmu.label.skip_automap') }}
                  </div>
                  <v-switch
                    v-model="skipAutomap"
                    :disabled="allToolsDisabled"
                    hide-details
                    class="short-switch"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>

        <!-- DISPLAY TOOLS -->
        <v-row>
          <v-col :cols="isMobileViewport ? 12 : 9">
            <v-row>
              <template v-for="(g, toolIndex) in localTtgMap">
                <v-col
                  v-if="toolMetaData[toolIndex].inUse || allTools"
                  :key="toolIndex"
                  cols="1"
                  class="no-padding min-width-card"
                >
                  <v-card
                    :class="toolCardClass(toolIndex)"
                    @click="selectTool(toolIndex)"
                  >
                    <v-card-title class="justify-center">
                      {{ toolText(toolIndex) }}
                    </v-card-title>
                    <v-card-text>
                      <v-container
                        fluid
                        pa-2
                      >
                        <v-row>
                          <v-col
                            cols="5"
                            class="no-padding"
                          >
                            <mmu-spool
                              :gate-index="g"
                              :show-percent="false"
                              width="100%"
                            />
                          </v-col>
                          <v-col
                            cols="7"
                            class="d-flex flex-column no-padding pr-1 pt-2"
                          >
                            <div class="small-font text-center">
                              Gate
                            </div>
                            <div class="text-center">
                              #{{ g }}
                            </div>
                            <v-spacer />
                            <v-divider />
                            <div class="text-start no-break">
                              <strong>&infin;&nbsp;</strong>
                              <span class="tiny-font">{{ esSpoolsText(g) }}</span>
                            </div>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-col>
              </template>
            </v-row>
          </v-col>

          <!-- TTG MAP -->
          <v-col
            :cols="isMobileViewport ? 6 : 3"
            class="d-flex flex-column align-center justify-center pa-0 min-width-map"
          >
            <mmu-ttg-map
              :map="localTtgMap"
              :groups="localEndlessSpoolGroups"
              :selected-tool="selectedTool"
              :selected-gate="selectedGate"
            />
            <v-btn
              small
              color="secondary"
              class="small-font"
              :loading="hasWait($waits.onMmuTtgMap)"
              @click="resetTtgMap()"
            >
              {{ $t('app.mmu.label.reset') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-subtitle>

    <v-divider />

    <!-- LOWER SECTION -->
    <v-card-text class="px-4 pb-4">
      <div class="fixed-area">
        <transition name="fade">
          <div
            v-if="selectedTool === -1"
            class="overlay-text"
          >
            {{ $t('app.mmu.msg.select_tool') }}
          </div>
        </transition>

        <transition name="fade">
          <v-container v-if="selectedTool !== -1">
            <v-row>
              <!-- SLICER TOOL -->
              <v-col
                cols="4"
                class="d-flex align-center justify-center"
              >
                <v-list-item v-if="selectedTool !== -1">
                  <v-list-item-content
                    v-if="
                      toolMetaData[selectedTool] && referencedTools.includes(selectedTool)
                    "
                  >
                    <div class="text-overline">
                      {{ $t('app.mmu.label.slicer_expects') }}
                    </div>
                    <v-divider />
                    <div class="mb-2 mt-2">
                      <span
                        class="tool-swatch mr-1"
                        :style="'background-color: ' + toolColor"
                      />
                      {{ toolText(selectedTool) }}
                    </div>
                    <v-list-item-title class="wrap-tool-name">
                      {{ toolNameText }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ toolDetailsText }}
                    </v-list-item-subtitle>
                    <div style="height: 100px">
                      <v-alert
                        v-if="alerts"
                        text
                        dense
                        color="warning"
                        class="mt-4 mx-0 pl-2 pr-2 alert-text"
                      >
                        <div
                          v-for="alert in alerts"
                          :key="alert"
                        >
                          {{ alert }}
                        </div>
                      </v-alert>
                    </div>
                  </v-list-item-content>
                  <v-list-item-content v-else>
                    <v-list-item-subtitle class="wrap-tool-name">
                      <div
                        v-if="toolMetaData[selectedTool] || referencedTools.length > 0"
                      >
                        {{
                          $t('app.mmu.msg.tool_not_used', {
                            tool: toolText(selectedTool),
                          })
                        }}
                      </div>
                      <div v-else>
                        {{
                          $t('app.mmu.msg.no_slicer_info', {
                            tool: toolText(selectedTool),
                          })
                        }}
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                cols="1"
                class="d-flex justify-start align-center"
              >
                <div
                  v-if="selectedTool !== -1"
                  class="triangle"
                />
              </v-col>

              <!-- GATE CHOOSER -->
              <v-col
                cols="7"
                class="drop-down-table"
              >
                <v-data-table
                  :headers="gateTableHeaders"
                  :items="gateItems"
                  item-key="index"
                  sort-by="index"
                  :items-per-page="-1"
                  hide-default-footer
                >
                  <template #no-data>
                    <div class="text-center">
                      {{ $t('app.mmu.msg.no_gate') }}
                    </div>
                  </template>

                  <template #item="{ item }">
                    <mmu-gate-dialog-row
                      :key="item.index"
                      :ref="`row-${item.index}`"
                      :details="item"
                      :selected-es-group="localEndlessSpoolGroups[selectedGate] ?? null"
                      :selected-gate="selectedGate ?? null"
                      @select-gate="selectGate"
                      @select-es="selectEndlessSpool"
                    />
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </transition>
      </div>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStateMixin } from '@/composables/useStateMixin'
import { useMmuMixin } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import { useVuetify } from '@/composables/useVuetify'
import { SocketActions } from '@/api/socketActions'
import type { AppFileWithMeta } from '@/store/files/types'
import type { SlicerToolDetails, MmuGateDetails } from '@/types'
import MmuSpool from '@/components/widgets/mmu/MmuSpool.vue'
import MmuTtgMap from '@/components/widgets/mmu/MmuTtgMap.vue'
import MmuGateDialogRow from '@/components/widgets/mmu/MmuGateDialogRow.vue'
import getFilePaths from '@/util/get-file-paths'
import { useRouter, useRoute } from 'vue-router/composables'

const { isMobileViewport } = useBrowserMixin()
const { sendGcode, hasWait } = useStateMixin()
const { ttgMap, endlessSpoolGroups, gateMap, toolDetails, gateDetails, fromColorString, macroVarsAutomapStrategy } = useMmuMixin()
const { typedState, typedCommit, typedGetters } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()
const vuetify = useVuetify()
const router = useRouter()
const route = useRoute()

const localTtgMap = ref<number[]>([])
const localEndlessSpoolGroups = ref<number[]>([])
const localGateMap = ref<MmuGateDetails[]>([])
const toolMetaData = ref<SlicerToolDetails[]>([])
const referencedTools = ref<number[]>([])
const allTools = ref(true)
const allToolsDisabled = ref(false)
const skipAutomap = ref(false)
const selectedTool = ref(-1)
const selectedGate = ref(-1)

const rowRefs = ref<Record<string, { $el: Element } | null>>({})

const open = computed({
  get: () => typedState.mmu.dialog.show,
  set: (val: boolean) => {
    typedCommit('mmu/setDialogState', {
      ...typedState.spoolman.dialog,
      show: val,
    })
  },
})

const filename = computed(() => typedState.mmu.dialog.filename)

const file = computed<AppFileWithMeta | undefined>(() => {
  if (filename.value != null) {
    const { rootPath, filename: fname } = getFilePaths(filename.value, 'gcodes')
    return typedGetters['files/getFile'](rootPath, fname)
  }
  return undefined
})

function initialize () {
  if (open.value) {
    localTtgMap.value = Array.from(ttgMap.value)
    localEndlessSpoolGroups.value = Array.from(endlessSpoolGroups.value)
    localGateMap.value = Array.from(gateMap.value)

    toolMetaData.value = []
    referencedTools.value = []
    for (let i = 0; i < ttgMap.value.length; i++) {
      toolMetaData.value[i] = toolDetails(i, file.value)
      if (toolMetaData.value[i]?.inUse) referencedTools.value.push(i)
    }

    if (referencedTools.value.length > 0) {
      allTools.value = false
      allToolsDisabled.value = false
    } else {
      allTools.value = true
      allToolsDisabled.value = true
    }
    selectedTool.value = -1
    selectedGate.value = -1
  }
  skipAutomap.value = false
}

watch(ttgMap, () => initialize())
watch(endlessSpoolGroups, () => initialize())
watch(open, () => initialize())

watch(allTools, () => {
  selectedTool.value = -1
  selectedGate.value = -1
})

function toolCardClass (tool: number): string[] {
  const classes = ['no-padding']
  classes.push(vuetify.theme.dark ? 'card-dark-theme' : 'card-light-theme')
  if (selectedTool.value === tool) classes.push('selected-card')
  if (selectedTool.value !== tool && selectedTool.value >= 0) classes.push('disabled-card')
  return classes
}

const gateItems = computed(() => selectedTool.value < 0 ? [] : gateMap.value)

const gateTableHeaders = computed(() => {
  if (selectedTool.value < 0) return []
  return [
    { text: t('app.mmu.label.gate'), align: 'start', value: 'index', sortable: false },
    { text: '', align: 'center', sortable: false },
    { text: t('app.mmu.label.filament_info'), align: 'start', sortable: false },
    { text: t('app.mmu.label.endless_spool'), align: 'center', sortable: false },
  ]
})

function selectTool (tool: number) {
  if (selectedTool.value === tool) {
    selectedTool.value = -1
    selectedGate.value = -1
  } else {
    selectedTool.value = tool
    selectedGate.value = localTtgMap.value[tool]
    scrollToGateRow(selectedGate.value)
  }
}

function selectGate (gate: number) {
  selectedGate.value = gate
  localTtgMap.value = [...localTtgMap.value.slice(0, selectedTool.value), gate, ...localTtgMap.value.slice(selectedTool.value + 1)]
}

function selectEndlessSpool (gate: number) {
  if (selectedGate.value !== -1 && selectedGate.value !== gate) {
    let group = localEndlessSpoolGroups.value[selectedGate.value]
    if (localEndlessSpoolGroups.value[gate] === group) {
      let newGroup = endlessSpoolGroups.value[gate]
      if (newGroup === group) {
        const usedGroups = new Set(localEndlessSpoolGroups.value)
        let i = 0
        while (usedGroups.has(i)) i++
        newGroup = i
      }
      group = newGroup
    }
    const newGroups = [...localEndlessSpoolGroups.value]
    newGroups[gate] = group
    localEndlessSpoolGroups.value = newGroups
    localGateMap.value[gate].endlessSpoolGroup = group
  }
}

function scrollToGateRow (gate: number) {
  nextTick(() => {
    const targetRow = rowRefs.value[`row-${gate}`]
    if (targetRow && 'scrollIntoView' in targetRow.$el) {
      targetRow.$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

function handleEscapePress (event: KeyboardEvent) {
  if (event.key === 'Escape' || event.keyCode === 27) {
    selectedTool.value = -1
    selectedGate.value = -1
  }
}

function esSpoolsText (gate: number): string {
  const esGates: number[] = []
  const group = localEndlessSpoolGroups.value[gate]
  localEndlessSpoolGroups.value.forEach((g, index) => {
    const cIndex = (gate + index) % localEndlessSpoolGroups.value.length
    if (localEndlessSpoolGroups.value[cIndex] === group && cIndex !== gate) {
      esGates.push(cIndex)
    }
  })
  if (esGates.length) return esGates.join(',')
  return 'none'
}

const toolNameText = computed(() => toolMetaData.value[selectedTool.value]?.name ?? '')

const toolDetailsText = computed(() => {
  const meta = toolMetaData.value[selectedTool.value]
  if (!meta) return ''
  const toolMaterialText = meta.material
  let toolTempText: string | null = null
  if (meta.temp >= 0) toolTempText = meta.temp + '\u00B0' + 'C'
  return [toolMaterialText, toolTempText].filter((v) => v !== null).join(' | ')
})

const toolColor = computed(() => toolMetaData.value[selectedTool.value]?.color ?? '')

const alerts = computed<string[] | null>(() => {
  if (selectedTool.value < 0) return null
  const maxTempDiff = 5
  const maxColorDiff = 16000
  const result = []
  const meta = toolMetaData.value[selectedTool.value]
  if (!meta) return null
  const gd = gateDetails(selectedGate.value)

  if (meta.material.toUpperCase() !== gd.material.toUpperCase()) {
    result.push('\u2022 ' + t('app.mmu.msg.material'))
  }
  if (Math.abs(meta.temp - gd.temperature) > maxTempDiff) {
    result.push('\u2022 ' + t('app.mmu.msg.temperature'))
  }
  const rgb1 = hexToRgb(fromColorString(meta.color))
  const rgb2 = hexToRgb(fromColorString(gd.color))
  const colorDifference = weightedEuclideanDistance(rgb1, rgb2)
  if (colorDifference > maxColorDiff) {
    result.push('\u2022 ' + t('app.mmu.msg.color'))
  }
  if (result.length > 0) {
    result.unshift(t('app.mmu.msg.mismatch').toString())
    return result.map(a => a.toString())
  }
  return null
})

function hexToRgb (hex: string): number[] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function weightedEuclideanDistance (
  color1: number[],
  color2: number[],
  weights: number[] = [0.3, 0.59, 0.11]
): number {
  return color1.reduce((acc, curr, i) => acc + weights[i] * (curr - color2[i]) ** 2, 0)
}

async function resetTtgMap () {
  const result = await confirm(
    tc('app.mmu.msg.reset_ttg_map_confirmation', 1),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )
  if (result) executeResetTtgMap()
}

function executeResetTtgMap () {
  initialize()
  sendGcode('MMU_TTG_MAP RESET=1')
}

function close () {
  selectedTool.value = -1
  selectedGate.value = -1
  open.value = false
}

async function commit () {
  const mapStr = localTtgMap.value.join(',')
  const esGrpStr = localEndlessSpoolGroups.value.join(',')
  const gcode = `MMU_SLICER_TOOL_MAP SKIP_AUTOMAP=${skipAutomap.value ? 1 : 0}
MMU_TTG_MAP MAP="${mapStr}" QUIET=1
MMU_ENDLESS_SPOOL GROUPS="${esGrpStr}" QUIET=1`
  sendGcode(gcode)
  if (filename.value) {
    await SocketActions.printerPrintStart(filename.value)
    if (route.name !== 'home') {
      router.push({ name: 'home' })
    }
  }
  close()
}

const toolText = (tool: number) => tool === -1 ? 'T?' : tool === -2 ? 'Bypass' : 'T' + tool

onMounted(() => {
  document.addEventListener('keydown', handleEscapePress)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapePress)
})
</script>

<style scoped>
.card-light-theme {
    background: #f0f0f0;
}

.card-dark-theme {
    background: #2c2c2c;
}

.selected-card {
    background: #595959 !important;
}

.disabled-card {
    opacity: 0.5;
}

.small-font {
    font-size: 0.8em;
}

.tiny-font {
    font-size: 0.8em;
    line-height: 0.8em;
}

.no-break {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-padding {
    padding: 3px;
}

.min-width-card {
    min-width: 96px;
}

.min-width-map {
    min-width: 180px;
}

.no-padding .v-card__title,
.no-padding .v-card__subtitle,
.no-padding .v-card__text {
    padding: 0px;
    line-height: 1em;
}

.short-switch {
    padding-top: 0px;
    margin-top: 0px;
    margin-bottom: 2px;
}

.scrollable-table {
    overflow-y: auto;
}

.fixed-area {
    height: 300px;
    position: relative;
}

.drop-down-table {
    height: 300px;
    overflow-y: auto;
}

.wrap-tool-name {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
}

.tool-swatch {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    vertical-align: middle;
}

.triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 40px 0 40px 15px;
    border-color: transparent transparent transparent #595959;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.overlay-text {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.alert-text {
    font-size: 1em;
}
</style>

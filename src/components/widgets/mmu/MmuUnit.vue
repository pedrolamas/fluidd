<template>
  <v-container class="unit-container">
    <div class="spool-row">
      <div
        v-for="(g, index) in displayGates"
        :key="`gate_${g}`"
        class="gate"
        :class="{ 'gate--menu': showContextMenu }"
        @click="handleClickGate(g, $event)"
        @contextmenu.prevent
      >
        <div
          class="clip-spool"
          :style="{ 'max-height': `${clipHeight}px` }"
        >
          <v-menu
            v-model="gateMenuVisible[g]"
            :position-x="menuX"
            :position-y="menuY"
            :close-on-content-click="false"
            :open-on-click="false"
            transition="slide-y-transition"
            absolute
            offset-y
          >
            <template #activator="{ attrs: menuAttrs }">
              <v-tooltip
                top
                :open-delay="500"
                :disabled="!showDetails"
                content-class="spool-tooltip"
              >
                <template #activator="{ on: tooltipOn, attrs: tooltipAttrs }">
                  <div
                    v-bind="{ ...menuAttrs, ...tooltipAttrs }"
                    v-on="{ ...tooltipOn }"
                  >
                    <mmu-spool
                      :width="$filters.getPixelsString(spoolWidth)"
                      :class="spoolClass(g)"
                      :gate-index="g"
                      :edit-gate-map="editGateMap"
                      :edit-gate-selected="editGateSelected"
                    />
                  </div>
                </template>

                <div class="spool-tooltip">
                  <div
                    v-if="tooltipTitle(g)"
                    class="d-block font-weight-bold"
                  >
                    {{ tooltipTitle(g) }}
                  </div>
                  <div>{{ tooltipText(g) }}</div>
                </div>
              </v-tooltip>
            </template>

            <v-list
              dense
              @mouseleave="closeContextMenu"
            >
              <v-subheader class="compact-subheader d-block text-subtitle-2 text-center mb-0 h-auto pb-2">
                {{ contextMenuHeader(g) }}
              </v-subheader>
              <v-divider />
              <v-list-item
                v-for="(item, i) in contextMenuItems(g)"
                :key="i"
              >
                <v-btn
                  small
                  style="width: 100%"
                  :disabled="isItemDisabled(item, g)"
                  :loading="item.wait && hasWait(item.wait)"
                  @click="runMenuItem(item, g)"
                >
                  <v-icon left>
                    {{ item.icon }}
                  </v-icon>
                  {{ item.label }}
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>

          <div
            v-if="isSelectedGate(g)"
            style="position: absolute; bottom: 0%; left: 0%; width: 100%; height: auto; background: none;"
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 80 60"
            >
              <defs>
                <clipPath id="clip-half">
                  <rect
                    x="0"
                    y="0"
                    width="80"
                    height="60"
                  />
                </clipPath>
                <radialGradient
                  id="spotlight"
                  cx="50%"
                  cy="70%"
                  r="50%"
                  fx="50%"
                  fy="100%"
                >
                  <stop
                    offset="0%"
                    style="stop-color:rgba(255, 255, 255, 0.9); stop-opacity:1"
                  />
                  <stop
                    offset="100%"
                    style="stop-color:rgba(255, 255, 0, 0); stop-opacity:0"
                  />
                </radialGradient>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#spotlight)"
                clip-path="url(#clip-half)"
              />
            </svg>
          </div>
        </div>

        <mmu-gate-status
          :class="gateStatusClass(index)"
          :gate-index="g"
          :edit-gate-map="editGateMap"
          :edit-gate-selected="editGateSelected"
        />
      </div>
    </div>

    <mmu-unit-footer
      class="pt-0 position-relative"
      :style="footerStyle"
      :show-details="showDetails"
      :show-footer="showFooter"
      :unit-index="unitIndex"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useMmuMixin, TOOL_GATE_BYPASS, GATE_EMPTY, FILAMENT_POS_LOADED } from '@/composables/useMmuMixin'
import { useVuetify } from '@/composables/useVuetify'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import type { MmuGateDetails } from '@/types'
import MmuSpool from '@/components/widgets/mmu/MmuSpool.vue'
import MmuGateStatus from '@/components/widgets/mmu/MmuGateStatus.vue'
import MmuUnitFooter from '@/components/widgets/mmu/MmuUnitFooter.vue'

type MenuDisabled =
  | boolean
  | ((gate: number) => boolean)

type MenuAction =
  | { kind: 'gcode', command: string }
  | { kind: 'call', fn: (gate: number) => void }

type ContextMenuItem = {
  icon: string
  label: string
  wait?: string
  disabled?: MenuDisabled
  action: MenuAction
}

const props = withDefaults(defineProps<{
  unitIndex?: number
  editGateMap?: MmuGateDetails[] | null
  editGateSelected?: number
  showContextMenu?: boolean
  showDetails?: boolean
  showFooter?: boolean
  hideBypass?: boolean
}>(), {
  unitIndex: 0,
  editGateMap: null,
  editGateSelected: -1,
  showContextMenu: true,
  showDetails: true,
  showFooter: true,
  hideBypass: false,
})

const emit = defineEmits<{
  (e: 'select-gate', gate: number): void
  (e: 'edit-filament', gate: number): void
}>()

const { t } = useI18n()
const vuetify = useVuetify()
const { klippyReady, hasWait, sendGcode } = useStateMixin()
const { isMobileViewport } = useBrowserMixin()
const {
  gate,
  filamentPos,
  canSend,
  isPrinting,
  spoolWidth,
  unitDetails,
  gateDetails,
} = useMmuMixin()

const gateMenuVisible = ref<Record<number, boolean>>({})
const closeTimeout = ref<number | null>(null)
const menuX = ref(0)
const menuY = ref(0)

const mmuMachineUnit = computed(() => unitDetails(props.unitIndex))

const unitGateRange = computed((): number[] => {
  if (props.unitIndex < 0) return []
  return Array.from({ length: mmuMachineUnit.value.numGates }, (v, k) => k + mmuMachineUnit.value.firstGate)
})

const showBypass = computed(() => {
  if (props.hideBypass) return false
  if (props.unitIndex < 0) return true
  return mmuMachineUnit.value.hasBypass
})

const displayGates = computed((): number[] => {
  const gates = unitGateRange.value
  return showBypass.value ? [...gates, TOOL_GATE_BYPASS] : gates
})

const clipHeight = computed(() => Math.trunc(spoolWidth.value * 1.6))

const footerStyle = computed(() => {
  const numSpools = mmuMachineUnit.value.numGates + (showBypass.value ? 1 : 0)
  const maxWidth = spoolWidth.value * numSpools + 32
  return { maxWidth: `${maxWidth}px` }
})

const allContextMenuItems = computed((): ContextMenuItem[] => {
  const isLoaded = filamentPos.value === FILAMENT_POS_LOADED
  const canCrossload = unitDetails(props.unitIndex).canCrossload

  return [
    {
      icon: '$mmuSelectGate',
      label: t('app.mmu.btn.select').toString(),
      action: { kind: 'call', fn: (g) => selectGate(g) },
      disabled: (g) => !canSend.value || g === gate.value || isPrinting.value || isLoaded,
    },
    {
      icon: '$mmuEditGateMap',
      label: t('app.mmu.btn.edit_gate_map').toString(),
      action: { kind: 'call', fn: (g) => editFilament(g) },
    },
    {
      icon: '$mmuPreload',
      label: t('app.mmu.btn.preload').toString(),
      wait: Waits.onMmuPreload,
      action: { kind: 'gcode', command: 'MMU_PRELOAD' },
      disabled: (g) =>
        !canSend.value ||
          (g === gate.value && !canCrossload) ||
          (g === gate.value && isLoaded),
    },
    {
      icon: '$mmuEject',
      label: t('app.mmu.btn.eject').toString(),
      wait: Waits.onMmuEject,
      action: { kind: 'gcode', command: 'MMU_EJECT' },
      disabled: (g) => !canSend.value || (g !== gate.value && !canCrossload),
    },
    {
      icon: '$mmuChangeTool',
      label: t('app.mmu.btn.change_tool').toString(),
      wait: Waits.onMmuChangeTool,
      action: { kind: 'gcode', command: 'MMU_CHANGE_TOOL' },
      disabled: (g) => !canSend.value || g === gate.value || isPrinting.value,
    },
  ]
})

function isSelectedGate (g: number): boolean {
  return (props.editGateMap != null && props.editGateSelected === g) || (!props.editGateMap && gate.value === g)
}

function contextMenuHeader (g: number): string {
  if (g >= 0) return t('app.mmu.label.gate').toString() + ' ' + g
  return 'Bypass'
}

function tooltipTitle (g: number): string | null {
  const details = gateDetails(g)
  if (details.status === GATE_EMPTY) return null
  return details.filamentName
}

function tooltipText (g: number): string {
  const details = gateDetails(g)
  if (details.status === GATE_EMPTY) {
    return t('app.mmu.tooltip.empty').toString()
  }
  const output = []

  const tempStr = details.temperature > 0
    ? ` | ${details.temperature}°C`
    : ''
  output.push(details.material + tempStr)

  if (details.color && details.color !== '#808182E3') {
    const color = details.color
    output.push(
      t('app.mmu.tooltip.color').toString() +
                ': ' +
                color.substring(0, 7) +
                (color.length > 7 && color.substring(7, 9) !== 'FF' ? color.substring(7, 9) : '')
    )
  }

  if (details.spoolId && details.spoolId > 0) {
    output.push(t('app.mmu.tooltip.spoolid').toString() + ': ' + details.spoolId)
  }

  return output.join('\n')
}

function gateStatusClass (index: number): string[] {
  const firstGate = (props.unitIndex < 0 || index === 0)
  const lastGate = index === (displayGates.value.length - 1)

  const classes = ['gate-status-row']
  if (firstGate) classes.push('first-gate')
  if (lastGate) classes.push('last-gate')
  classes.push(vuetify.theme.dark ? 'gate-status-row-dark-theme' : 'gate-status-row-light-theme')
  return classes
}

function spoolClass (g: number): string[] {
  const classes = []
  if ((props.editGateMap != null && props.editGateSelected === g) || (!props.editGateMap && gate.value === g)) {
    classes.push('highlight-spool')
  } else {
    if (!isMobileViewport.value) classes.push('hover-effect')
    if (props.editGateMap) {
      classes.push('unhighlight-spool')
    }
  }
  return classes
}

function contextMenuItems (g: number): ContextMenuItem[] {
  const items = allContextMenuItems.value
  if (g < 0) return items.slice(0, 1)
  return items
}

function isItemDisabled (item: ContextMenuItem, g: number): boolean {
  if (!klippyReady.value) return true
  if (!item.disabled) return false
  return typeof item.disabled === 'function' ? item.disabled(g) : item.disabled
}

function runMenuItem (item: ContextMenuItem, g: number) {
  if (isItemDisabled(item, g)) return

  closeContextMenu()

  if (item.action.kind === 'gcode') {
    sendGcode(`${item.action.command} GATE=${g}`, item.wait)
  } else {
    item.action.fn(g)
  }
}

function selectGate (g: number) {
  emit('select-gate', g)
}

function editFilament (g: number) {
  emit('edit-filament', g)
}

function handleClickGate (g: number, e: MouseEvent) {
  if (props.showContextMenu) return openContextMenu(g, e)
  selectGate(g)
}

function openContextMenu (g: number, e: MouseEvent) {
  e.preventDefault()

  menuX.value = e.clientX - 20
  menuY.value = e.clientY - 20

  closeContextMenu()

  gateMenuVisible.value = { ...gateMenuVisible.value, [g]: true }
  closeTimeout.value = window.setTimeout(() => {
    closeContextMenu()
  }, 6000)
}

function closeContextMenu () {
  clearCloseTimeout()
  const updated: Record<number, boolean> = {}
  for (const key of Object.keys(gateMenuVisible.value)) {
    updated[Number(key)] = false
  }
  gateMenuVisible.value = updated
}

function clearCloseTimeout () {
  if (closeTimeout.value === null) return
  clearTimeout(closeTimeout.value)
  closeTimeout.value = null
}

onBeforeUnmount(() => {
  clearCloseTimeout()
})
</script>

<style scoped>
.unit-container {
    padding: 0;
}

.spool-tooltip {
    max-width: 180px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.spool-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 0px 0px 0px;
    gap: 0px;
}

.gate-status-row {
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
    padding-top: 2px;
    padding-bottom: 2px;
    position: relative;
    z-index: 1;
}

.gate-status-row-dark-theme {
    background-image: linear-gradient(to bottom, #3c3c3c 0%, #2c2c2c 100%);
}

.gate-status-row-light-theme {
    background-image: linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0ff 100%);
}

.first-gate {
    border-radius: 8px 0 0 0;
    margin-left: -16px;
    padding-left: 16px;
}

.last-gate {
    border-radius: 0 8px 0 0;
    margin-right: -16px;
    padding-right: 16px;
}

.first-gate.last-gate {
    border-radius: 8px 8px 0 0;
}

.clip-spool {
    position: relative;
    margin-top: 8px;
}

.gate {
    font-size: 0px;
    border-radius: 12px;
    line-height: 1em;
    cursor: pointer;
}

.gate--menu {
    cursor: context-menu;
}

.highlight-spool {
    transform: translateY(-8px);
    opacity: 1;
}

.unhighlight-spool {
    opacity: 0.4;
}

.hover-effect {
    transition: transform 0.2s ease-in-out;
}

.hover-effect:hover {
    transform: translateY(-5px);
    opacity: 1;
}

.v-list--dense .compact-subheader {
    height: auto;
    padding-bottom: 4px;
    display: block;
    text-align: center;
}
</style>

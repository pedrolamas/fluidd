<template>
  <div>
    <app-dialog
      v-model="open"
      width="800"
      title-shadow
      :fullscreen="isMobileViewport"
      :title="$t('app.mmu.title.edit_gate_map')"
      @save="commit"
      @cancel="close"
    >
      <!-- UPPER SECTION -->
      <v-card-subtitle v-if="editGateMap.length > 0">
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
              {{ $t('app.mmu.msg.select_gate') }}
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-end no-padding"
            >
              <v-btn
                small
                color="secondary"
                class="small-font"
                :loading="hasWait($waits.onMmuTtgMap)"
                @click="resetGateMap()"
              >
                {{ $t('app.mmu.label.reset') }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- DISPLAY GATES -->
          <v-row align="start">
            <v-col class="d-flex justify-start align-center no-padding">
              <mmu-machine
                :show-context-menu="false"
                :show-details="false"
                :edit-gate-map="editGateMap"
                :edit-gate-selected="editGateSelected"
                :hide-bypass="true"
                @select-gate="selectGate"
              />
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
              v-if="editGateSelected === -1"
              class="overlay-text"
            >
              {{ $t('app.mmu.msg.select_gate') }}
            </div>
          </transition>

          <transition name="fade">
            <v-container
              v-if="editGateSelected !== -1"
              fluid
              pa-2
            >
              <v-row class="ms-0 me-0 mb-4">
                <v-col
                  class="d-flex justify-start align-center no-padding small-font text--secondary"
                >
                  <div v-if="spoolmanSupport === SPOOLMAN_PULL">
                    {{
                      $t('app.mmu.msg.spoolman_pull', {
                        mode: spoolmanSupport,
                      })
                    }}
                  </div>
                  <div v-else-if="spoolmanSupport === SPOOLMAN_OFF">
                    {{
                      $t('app.mmu.msg.spoolman_off', {
                        mode: spoolmanSupport,
                      })
                    }}
                  </div>
                  <div v-else>
                    {{
                      $t('app.mmu.msg.spoolman_other', {
                        mode: spoolmanSupport,
                      })
                    }}
                  </div>
                </v-col>
              </v-row>

              <!-- GATE DETAILS-->
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                  class="d-flex flex-column justify-start align-left no-padding pt-3"
                  style="height: 100%"
                >
                  <v-row>
                    <v-col
                      cols="6"
                      class="pt-5 ps-6"
                    >
                      <v-switch
                        v-model="useSpoolman"
                        :label="$t('app.mmu.label.spoolman')"
                        :disabled="
                          spoolmanSupport === SPOOLMAN_PULL ||
                            spoolmanSupport === SPOOLMAN_OFF
                        "
                        hide-details
                        class="short-switch"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="spoolId"
                        type="number"
                        class="force-spin-buttons"
                        :label="$t('app.mmu.label.spoolman_id')"
                        :rules="spoolIdRules()"
                        :disabled="
                          !useSpoolman ||
                            spoolmanSupport === SPOOLMAN_PULL ||
                            spoolmanSupport === SPOOLMAN_OFF
                        "
                        :hide-spin-buttons="
                          !useSpoolman ||
                            spoolmanSupport === SPOOLMAN_PULL ||
                            spoolmanSupport === SPOOLMAN_OFF
                        "
                        outlined
                        dense
                        @blur="adjustSpoolId"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                      class="ps-6"
                    >
                      <v-text-field
                        v-model.trim="editGateMap[editGateSelected].filamentName"
                        :label="$t('app.mmu.label.filament_name')"
                        :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                        outlined
                        dense
                        clearable
                        hide-details
                        @blur="adjustName"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="6"
                      class="ps-6"
                    >
                      <v-text-field
                        v-model.trim="editGateMap[editGateSelected].material"
                        :label="$t('app.mmu.label.material')"
                        :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                        outlined
                        dense
                        clearable
                        hide-details
                        @blur="adjustMaterial"
                      />
                    </v-col>
                    <v-col cols="2" />
                    <v-col cols="4">
                      <v-text-field
                        v-model="editGateMap[editGateSelected].temperature"
                        type="number"
                        :label="$t('app.mmu.label.temperature')"
                        :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                        :hide-spin-buttons="
                          useSpoolman || spoolmanSupport === SPOOLMAN_PULL
                        "
                        suffix="°C"
                        :rules="temperatureRules()"
                        outlined
                        dense
                        hide-details
                        @blur="adjustTemperature"
                      />
                    </v-col>
                  </v-row>

                  <v-row class="pt-3 pb-3 ps-3">
                    <v-divider />
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                      class="ps-6"
                    >
                      <v-switch
                        v-model="selectedGateStatus"
                        :label="selectedGateStatusLabel"
                        hide-details
                        class="short-switch"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-subheader class="speed-slider-subheader ps-6 pe-1">
                        <v-icon
                          small
                          class="mr-2"
                        >
                          $mmuLoadSpeed
                        </v-icon>
                        <span>{{ $t('app.mmu.label.load_speed') }}</span>
                        <v-spacer />
                        <v-text-field
                          v-model="editGateMap[editGateSelected].speedOverride"
                          type="number"
                          suffix="%"
                          hide-spin-buttons
                          hide-details
                          outlined
                          dense
                          readonly
                          class="_slider-input d-flex align-center pt-1"
                        >
                          <template #append>
                            <v-icon
                              small
                              @click="resetSpeed()"
                            >
                              $mmuResetSpeed
                            </v-icon>
                          </template>
                        </v-text-field>
                      </v-subheader>

                      <v-card-text class="pb-0 pe-0 pt-1 d-flex align-center">
                        <v-slider
                          v-model="editGateMap[editGateSelected].speedOverride"
                          :min="10"
                          :max="150"
                          hide-details
                        >
                          <template #prepend>
                            <v-icon @click="decrementSpeed">
                              $mmuDecrementSpeed
                            </v-icon>
                          </template>
                          <template #append>
                            <v-icon @click="incrementSpeed">
                              $mmuIncrementSpeed
                            </v-icon>
                          </template>
                        </v-slider>
                      </v-card-text>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-spacer />
                  </v-row>
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                  class="d-flex flex-column justify-start align-center no-padding pt-3"
                >
                  <div v-if="!useSpoolman">
                    <v-color-picker
                      v-model="editGateMap[editGateSelected].color"
                      hide-inputs
                      swatches-max-height="120px"
                      show-swatches
                      mode="hexa"
                      show-alpha
                      hide-opacity="false"
                    />
                  </div>
                  <div v-else>
                    <div
                      :class="!spoolIdExists ? 'no-spool' : ''"
                      style="align-items: center;"
                    >
                      <v-icon
                        :color="spoolmanColor"
                        size="120px"
                        class="spool-icon"
                        @click="handleSelectSpool()"
                      >
                        $filament
                      </v-icon>
                      <div class="pt-4">
                        {{ spoolmanLastUsed }}
                      </div>
                      <div>
                        <strong>{{ spoolmanRemainingWeight }}</strong>
                        <small class="ml-1">/ {{ spoolmanTotalWeight }}</small>
                      </div>
                    </div>
                    <div style="padding-top: 12px">
                      <v-btn
                        block
                        color="secondary"
                        class="spoolman-btn"
                        @click="handleSelectSpool()"
                      >
                        <v-icon>
                          $mmuChooseSpool
                        </v-icon>
                        {{ $t('app.mmu.label.choose_spool') }}
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </transition>
        </div>
      </v-card-text>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStateMixin } from '@/composables/useStateMixin'
import { useMmuMixin, GATE_UNKNOWN, GATE_EMPTY, GATE_AVAILABLE, NO_FILAMENT_COLOR, SPOOLMAN_OFF, SPOOLMAN_PULL } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import type { MmuGateDetails } from '@/types'
import type { Spool } from '@/store/spoolman/types'
import { Waits } from '@/globals'
import MmuMachine from '@/components/widgets/mmu/MmuMachine.vue'

const props = defineProps<{
  value?: boolean
  initialGate?: number | null
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'close'): void
}>()

const open = computed({
  get: () => props.value ?? false,
  set: (v) => emit('input', v),
})

const { isMobileViewport } = useBrowserMixin()
const { sendGcode, hasWait } = useStateMixin()
const { gateMap, spoolmanSupport, fromColorString, spoolmanSpool } = useMmuMixin()
const { typedGetters, typedCommit, typedState } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()

const editGateMap = ref<MmuGateDetails[]>([])
const editGateSelected = ref(-1)

function initialize () {
  if (open.value) {
    editGateMap.value = Array.from(gateMap.value)
    const ig = props.initialGate
    if (typeof ig === 'number' && ig >= 0 && ig < editGateMap.value.length) {
      editGateSelected.value = ig
    } else {
      editGateSelected.value = -1
    }
  } else {
    editGateMap.value = []
    editGateSelected.value = -1
  }
}

watch(open, () => initialize())
watch(gateMap, () => initialize())

function selectGate (gate: number) {
  if (editGateSelected.value !== -1) adjustSpoolId()
  if (editGateSelected.value === gate) {
    editGateSelected.value = -1
  } else {
    editGateSelected.value = gate
    if (spoolmanSupport.value === SPOOLMAN_OFF) {
      editGateMap.value[editGateSelected.value].spoolId = -1
    }
  }
}

function handleEscapePress (event: KeyboardEvent) {
  if (event.key === 'Escape' || event.keyCode === 27) {
    editGateSelected.value = -1
  }
}

function adjustName () {
  const filamentName = editGateMap.value[editGateSelected.value].filamentName ?? ''
  editGateMap.value[editGateSelected.value].filamentName = filamentName.trim().replace(/[#'"]/g, '')
}

function adjustMaterial () {
  const material = editGateMap.value[editGateSelected.value].material ?? ''
  editGateMap.value[editGateSelected.value].material = material.trim().replace(/[#'"]/g, '')
}

const spoolIdRaw = computed<number | null>({
  get: () => {
    if (!editGateMap.value || !editGateMap.value[editGateSelected.value]) return null
    return editGateMap.value[editGateSelected.value].spoolId
  },
  set: (newValue) => {
    const newSpoolId = newValue !== null ? newValue : null
    editGateMap.value[editGateSelected.value].spoolId = newSpoolId
  },
})

const spoolId = computed<string | null>({
  get: () => spoolIdRaw.value != null ? String(spoolIdRaw.value) : null,
  set: (newSpoolIdStr: string | null) => {
    const newSpoolId = newSpoolIdStr ? parseInt(newSpoolIdStr) : null
    spoolIdRaw.value = (newSpoolId !== null && !Number.isNaN(newSpoolId)) ? newSpoolId : null
  },
})

watch(spoolIdRaw, (newSpoolId) => {
  if (newSpoolId !== null && newSpoolId > 0) {
    const spool = spoolmanSpool(newSpoolId)
    editGateMap.value[editGateSelected.value].filamentName =
      spool?.filament?.name ?? t('app.mmu.label.unknown').toString()
    editGateMap.value[editGateSelected.value].material =
      spool?.filament?.material ?? t('app.mmu.label.unknown').toString()
    editGateMap.value[editGateSelected.value].color = fromColorString(spool?.filament?.color_hex ?? '')
    editGateMap.value[editGateSelected.value].temperature = spool?.filament?.settings_extruder_temp ?? -1
  }
})

function spoolIdRules () {
  const spools: Spool[] = typedGetters['spoolman/getAvailableSpools']
  return [
    (v: number) => {
      if (!v || v <= 0) return true
      const spoolExists = spools.some((spool) => spool.id === v) ?? null
      return spoolExists ? true : t('app.mmu.msg.no_matching_spool')
    }
  ]
}

function adjustSpoolId () {
  const sid = editGateMap.value[editGateSelected.value].spoolId ?? -1
  editGateMap.value[editGateSelected.value].spoolId = sid
}

const spoolIdExists = computed(() => {
  const spools: Spool[] = typedGetters['spoolman/getAvailableSpools']
  return spools.some((spool) => spool.id === spoolIdRaw.value)
})

function temperatureRules () {
  return [
    (v: string | number) => {
      const num = parseFloat(String(v))
      return !Number.isNaN(num) && num >= 100 && num <= 290
        ? true
        : t('app.mmu.msg.bad_temperature')
    }
  ]
}

function adjustTemperature () {
  const temp = editGateMap.value[editGateSelected.value].temperature
  if (temp < 100) editGateMap.value[editGateSelected.value].temperature = 100
  else if (temp > 290) editGateMap.value[editGateSelected.value].temperature = 290
}

const useSpoolman = computed({
  get: () => {
    const sid = editGateMap.value[editGateSelected.value]?.spoolId
    return sid === null || sid > 0
  },
  set: (newValue: boolean) => {
    editGateMap.value[editGateSelected.value].spoolId = newValue ? null : -1
  },
})

const selectedGateStatus = computed({
  get: () => {
    const s = editGateMap.value[editGateSelected.value]?.status
    return s === 1 || s === 2
  },
  set: (value: boolean) => {
    editGateMap.value[editGateSelected.value].status = value ? GATE_AVAILABLE : GATE_EMPTY
  },
})

const selectedGateStatusLabel = computed(() => {
  const status = editGateMap.value[editGateSelected.value]?.status
  if (status === GATE_UNKNOWN) return t('app.mmu.msg.filament_unknown').toString()
  if (status === GATE_EMPTY) return t('app.mmu.msg.filament_empty').toString()
  return t('app.mmu.msg.filament_available').toString()
})

function handleSelectSpool () {
  typedCommit('spoolman/setDialogState', { show: true, spoolSelectionOnly: true })
}

watch(() => typedState.spoolman.dialog, (newDialog) => {
  if (newDialog.selectedSpoolId != null) {
    editGateMap.value[editGateSelected.value].spoolId = newDialog.selectedSpoolId
  }
})

const spoolmanColor = computed(() => {
  const sid = editGateMap.value[editGateSelected.value]?.spoolId ?? -1
  const spool = spoolmanSpool(sid)
  return spool?.filament.color_hex ?? '#000'
})

const spoolmanRemainingWeight = computed(() => {
  const sid = editGateMap.value[editGateSelected.value]?.spoolId ?? -1
  const spool = spoolmanSpool(sid)
  if (spool) {
    const remaining = spool.remaining_weight ?? 0
    return `${remaining.toFixed(0)}g`
  }
  return '-'
})

const spoolmanTotalWeight = computed(() => {
  const sid = editGateMap.value[editGateSelected.value]?.spoolId ?? -1
  const spool = spoolmanSpool(sid)
  if (spool) {
    const total = spool.filament?.weight ?? 0
    if (total < 1000) return `${total.toFixed(0)}g`
    let totalRound = Math.round(total / 1000)
    if (totalRound !== total / 1000) totalRound = Math.round(total / 100) / 10
    return `${totalRound}kg`
  }
  return '-'
})

const spoolmanLastUsed = computed(() => {
  const sid = editGateMap.value[editGateSelected.value]?.spoolId ?? -1
  const spool = spoolmanSpool(sid)
  let usedStr = '-'
  if (spool) {
    const lastUsed = spool.last_used
    if (!lastUsed) {
      usedStr = t('app.mmu.label.spoolman_never').toString()
    } else {
      const date = new Date(lastUsed)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      if (diff <= 1000 * 60 * 60 * 24) return t('app.mmu.label.spoolman_today')
      if (diff <= 1000 * 60 * 60 * 24 * 2) return t('app.mmu.label.spoolman_yesterday')
      if (diff <= 1000 * 60 * 60 * 24 * 14) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        usedStr = t('app.mmu.label.spoolman_days_ago', { days }).toString()
      }
      usedStr = date.toLocaleDateString()
    }
  }
  return `${t('app.mmu.label.spoolman_last_used')}: ${usedStr}`
})

function decrementSpeed () {
  let value = editGateMap.value[editGateSelected.value].speedOverride
  value = value > 10 ? Math.round(value - 10) : 10
  editGateMap.value[editGateSelected.value].speedOverride = value
}

function incrementSpeed () {
  let value = editGateMap.value[editGateSelected.value].speedOverride
  value = value < 150 ? Math.round(value + 10) : 150
  editGateMap.value[editGateSelected.value].speedOverride = value
}

function resetSpeed () {
  editGateMap.value[editGateSelected.value].speedOverride = 100
}

async function resetGateMap () {
  const result = await confirm(
    tc('app.mmu.msg.reset_gate_map_confirmation', 1),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )
  if (result) executeResetGateMap()
}

function executeResetGateMap () {
  initialize()
  sendGcode('MMU_GATE_MAP RESET=1', Waits.onMmuGateMap)
}

function close () {
  emit('close')
  editGateMap.value = []
  editGateSelected.value = -1
  open.value = false
}

function commit () {
  if (editGateSelected.value !== -1) adjustSpoolId()
  const mapStr = generateMapString(editGateMap.value)
  const cmd = `MMU_GATE_MAP MAP="${mapStr}" QUIET=1`
  sendGcode(cmd)
  close()
}

function generateMapString (gateMapArr: MmuGateDetails[]) {
  type GateDetails = {
    status: number
    spool_id: number | null
    material: string
    color: string
    name: string
    temp: number
    speed_override: number
  }
  const mapObject: Record<number, GateDetails> = {}
  gateMapArr.forEach((g) => {
    mapObject[g.index] = {
      status: g.status ?? GATE_UNKNOWN,
      spool_id: g.spoolId ?? -1,
      material: g.material ?? '',
      color: g.color.replace(NO_FILAMENT_COLOR, '').replace('#', ''),
      name: g.filamentName ?? '',
      temp: g.temperature ?? -1,
      speed_override: g.speedOverride ?? 100,
    }
  })
  const jsonString = JSON.stringify(mapObject)
    .replace(/"(\d+)":/g, '$1: ')
    .replace(/"/g, "'")
  return jsonString
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapePress)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapePress)
})
</script>

<style scoped>
.small-font {
    font-size: 0.8em;
}

.no-padding {
    padding: 0px;
}

.no-spool {
    opacity: 0.3;
}

.fixed-area {
    min-height: 420px;
    position: relative;
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

.short-switch {
    padding-top: 0px;
    margin-top: 0px;
    margin-bottom: 2px;
}

.speed-slider-subheader {
    height: auto;
}

._slider-input {
    min-width: 5.2rem;
    max-width: 5.2rem;
    margin-left: 12px;
}

._slider-input >>> .v-input__slot {
    min-height: 1rem !important;
}

._slider-input >>> .v-text-field__slot input {
    padding-top: 4px;
    padding-bottom: 4px;
}

._slider-input >>> .v-input__append-inner {
    margin: auto -5px auto 0 !important;
}

.spoolman-btn {
    width: 160px;
    overflow: hidden;
    font-size: 0.8em;
}
.spoolman-btn .v-icon {
    margin-right: 4px;
}

</style>

<template>
  <svg
    ref="filStatusSvg"
    viewBox="140 0 285 441"
    preserveAspectRatio="xMidYMid meet"
    class="svg-colors"
  >
    <defs>
      <g
        id="sync-feedback"
        style="stroke: var(--color-outline); stroke-linecap: round; stroke-linejoin: round; fill: none;"
      >
        <path
          d="m18 9-4.22-5.61a1 1 0 0 0-1.56 0L8 9"
          style="stroke-width: 1; stroke-opacity: 0.8"
        />
        <path
          d="M13 8.24 18 15H8Z"
          style="stroke-width: 2"
        />
      </g>

      <g
        id="sync-feedback-buffer-piston"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="stroke: var(--color-outline); fill: var(--color-outline)"
      >
        <rect
          x="3"
          y="0"
          width="30"
          height="40"
          rx="3"
          ry="3"
          fill="none"
          stroke-width="1.5"
        />
        <path
          d="m-15-4 9 4-9 4Z"
          stroke-width="1"
          fill-opacity="0.6"
        />
        <path
          d="M8 40h20"
          stroke-width="4"
        />
        <text
          x="-22"
          y="4"
          font-size="11px"
          text-anchor="end"
        >
          {{ syncFeedbackPistonText }}
        </text>
      </g>

      <g
        id="sync-feedback-buffer-box"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="stroke: var(--color-outline)"
      >
        <rect
          x="0"
          y="0"
          width="36"
          height="45"
          rx="3"
          ry="3"
          class="fil-background"
          stroke-width="2"
          fill-opacity="0.6"
        />
        <path
          d="M-3 10h3m-3 12H.5M-3 34.5h3"
          stroke-width="2"
          stroke-opacity="0.6"
        />
        <path
          d="M8 0h20"
          stroke-width="4"
        />
      </g>

      <g
        id="sissors"
        style="stroke: var(--color-outline); fill: none; stroke-linecap: round; stroke-linejoin: round;"
      >
        <path
          d="M8.8 7.72c-.6 1.21-2.34 1.64-3.89 1S2.6 6.48 3.2 5.28s2.34-1.64 3.89-1S9.4 6.52 8.8 7.72m-3.89 1L21 16M7.09 19.68c-1.55.68-3.29.25-3.89-1s.17-2.73 1.71-3.4 3.29-.25 3.89 1-.17 2.72-1.71 3.4M21 8 4.91 15.32"
          style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2"
        />
        <line
          x1="31"
          y1="12.5"
          x2="44"
          y2="12.5"
          style="stroke-width: 1; stroke-dasharray: 2, 2"
        />
      </g>

      <g id="sync-extruder">
        <g
          style="
                        stroke: none;
                        stroke-width: 2;
                        stroke-dasharray: none;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                        stroke-miterlimit: 4;
                    "
        >
          <rect
            style="fill: rgb(131, 148, 150)"
            x="145"
            y="506"
            width="710"
            height="256"
          />
          <rect
            style="fill: rgb(147, 161, 161)"
            x="324"
            y="506"
            width="355"
            height="256"
          />
          <rect
            style="fill: rgb(101, 123, 131)"
            x="274"
            y="364"
            width="455"
            height="142"
          />
          <rect
            style="fill: rgb(88, 110, 117)"
            x="181"
            y="222"
            rx="28"
            ry="28"
            width="639"
            height="142"
          />
          <rect
            style="fill: rgb(88, 110, 117)"
            x="181"
            y="108"
            width="639"
            height="142"
          />
          <path
            style="fill: rgb(88, 110, 117)"
            d="M322 762h355L559 904H441z"
          />
        </g>
        <g transform="matrix(23.2058 0 0 23.2058 329.7195 325.9517)">
          <path
            style="
              stroke: rgb(0, 0, 0);
              stroke-width: 0;
              stroke-dasharray: none;
              stroke-linecap: butt;
              stroke-dashoffset: 0;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              is-custom-font: none;
              font-file-url: none;
              fill: rgb(254, 162, 54);
              fill-rule: nonzero;
              opacity: 1;
            "
            vector-effect="non-scaling-stroke"
            transform=" translate(-15.4288, -16.4198)"
            stroke-linecap="round"
            d="M25.032 26.16c2.884-2.883 4.184-6.74 3.928-10.51-1.511.013-3.021.021-4.531.034a9.01 9.01 0 0 1-2.594 7.277c-3.535 3.533-9.263 3.533-12.796 0a9.045 9.045 0 0 1 0-12.794c3.015-3.016 7.625-3.446 11.109-1.314-1.181 1.167-2.57 2.549-2.57 2.549-1 1.062.016 1.766.69 1.77h8.828a.613.613 0 0 0 .612-.612V3.804c.041-.825-.865-1.591-1.756-.7l-2.533 2.509C18.112 1.736 10.634 2.175 5.841 6.967c-5.3 5.3-5.3 13.892 0 19.193 5.3 5.299 13.892 5.299 19.191 0"
          />
        </g>
      </g>
      <g
        id="blob"
        style="stroke-linecap: round; stroke-linejoin: round"
      >
        <polygon
          points="0,0 -1,1 1,1 0,0"
          stroke-width="4"
          vector-effect="non-scaling-stroke"
        />
        <polygon
          points="-0.1,0.3 -0.5,0.7 0.3,0.7 -0.1,0.3"
          stroke-width="1"
          stroke="white"
          fill="white"
          opacity="0.3"
          vector-effect="non-scaling-stroke"
        />
      </g>
      <g
        id="filament-grip"
        style="stroke-linecap: round; stroke-linejoin: round"
      >
        <path
          fill="rgb(131,148,150)"
          d="M368 368v8c0 4.41-3.59 8-8 8h-16v-24h16c4.41 0 8 3.59 8 8m0 40v8c0 4.41-3.59 8-8 8h-48c-4.41 0-8-3.59-8-8v-8c0-4.41 3.59-8 8-8h48c4.41 0 8 3.59 8 8m-119.03 53.66-6.63-6.63c-4.53-4.53-10.56-7.03-16.96-7.03H160v-80h33.38c6.41 0 12.44-2.5 16.97-7.03l38.62-38.62a8 8 0 0 1 5.66-2.35H320c4.42 0 8 3.59 8 8v56h-16c-4.41 0-8-3.58-8-8v-25.39c0-4.42-3.57-8-8-8s-8 3.58-8 8v6.59L262.56 389c-1.52 1.91-3.81 3-6.25 3h-39.26c-4.42 0-8 3.58-8 8s3.58 8 8 8h39.26c7.33 0 14.16-3.28 18.75-9l13.68-17.1c.97 3.84 2.88 7.31 5.46 10.16-3.81 4.25-6.2 9.8-6.2 15.94v8c0 11.06 7.56 20.31 17.76 23.08-1.11 2.76-1.76 5.77-1.76 8.93v8c0 2.81.58 5.48 1.48 8h-50.85a8 8 0 0 1-5.66-2.34ZM368 456c0 4.41-3.59 8-8 8h-32c-4.41 0-8-3.59-8-8v-8c0-4.41 3.59-8 8-8h32c4.41 0 8 3.59 8 8zm0-128v8c0 4.41-3.59 8-8 8h-16v-16c0-2.82-.58-5.49-1.47-8H360c4.41 0 8 3.59 8 8"
        />
        <path
          :fill="currentGateColor"
          d="M300 250h50v60h-50Zm0 225h50v45h-50Z"
        />
      </g>
    </defs>

    <text
      x="282"
      y="18"
      font-size="16px"
      text-anchor="middle"
    >
      {{ statusText }}
    </text>
    <rect
      x="150"
      y="30"
      width="265"
      height="130"
      :class="$vuetify.theme.dark ? 'zone-background-dark-theme' : 'zone-background-light-theme'"
      rx="10"
      ry="10"
    />
    <rect
      x="150"
      y="333"
      width="265"
      height="66"
      :class="$vuetify.theme.dark ? 'zone-background-dark-theme' : 'zone-background-light-theme'"
      rx="10"
      ry="10"
    />
    <g style="stroke: var(--color-outline); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1;">
      <path
        d="M242 25v380l7 6h2l7-6V25"
        style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1"
      />
    </g>

    <rect
      ref="filamentRect"
      x="243"
      y="25"
      width="14"
      :height="filamentRectHeight"
      :fill="currentGateColor"
      class="filament-animation"
      :class="tipFormingClass"
    />
    <polygon
      v-if="upperNozzleFull"
      points="257,380 243,380 243,396 257,396"
      :fill="upperNozzleColor"
    />
    <polygon
      v-if="lowerNozzleFull"
      points="257,396 243,396 243,405 249,412 249,413 251,413 251,412 257,405"
      :fill="lowerNozzleColor"
    />

    <g
      style="stroke: var(--color-outline); stroke-linejoin: round; stroke-width: 0; font-family: Roboto; font-size: 16;"
    >
      <g v-if="hasSensor('mmu_pre_gate')">
        <circle
          cx="258"
          cy="50"
          r="8"
          style="stroke-width: 1"
          :class="sensorClass('mmu_pre_gate')"
        />
        <text
          x="278"
          y="55"
          :class="{ 'text-disabled': !isSensorEnabled('mmu_pre_gate') }"
        >Pre-Gate</text>
      </g>

      <g v-if="hasSensor('mmu_gear')">
        <circle
          cx="258"
          cy="80"
          r="8"
          style="stroke-width: 1"
          :class="sensorClass('mmu_gear')"
        />
        <text
          x="278"
          y="85"
          :class="{ 'text-disabled': !isSensorEnabled('mmu_gear') }"
        >Gear</text>
        <text
          v-if="homedToGear"
          x="219.5"
          y="85"
          font-weight="bold"
        >H</text>
      </g>

      <g v-if="hasSensor('mmu_gate')">
        <circle
          cx="258"
          cy="110"
          r="8"
          style="stroke-width: 1"
          :class="sensorClass('mmu_gate')"
        />
        <text
          x="278"
          y="115"
          :class="{ 'text-disabled': !isSensorEnabled('mmu_gate') }"
        >{{ gateSensorName }}</text>
        <transition name="fade">
          <text
            v-if="homedToGate"
            x="219.5"
            y="115"
            font-weight="bold"
          >H</text>
        </transition>
      </g>

      <g v-if="hasEncoder">
        <circle
          cx="258"
          cy="140"
          r="8"
          style="stroke-width: 1"
          :class="encoderClass"
        />
        <path
          d="m257 135 4 5-4 5"
          stroke-width="2"
          fill="none"
        />
        <text
          x="278"
          y="145"
        >Encoder</text>
        <text
          x="345"
          y="145"
          font-size="11px"
        >{{ encoderPosText }}</text>
        <transition name="fade">
          <text
            v-if="homedToEncoder"
            x="219.5"
            y="145"
            font-weight="bold"
          >H</text>
        </transition>
      </g>

      <g v-if="hasSensor('extruder')">
        <circle
          cx="258"
          cy="320"
          r="8"
          style="stroke-width: 1"
          :class="sensorClass('extruder')"
        />
        <text
          x="278"
          y="325"
          :class="{ 'text-disabled': !isSensorEnabled('extruder') }"
        >Extruder</text>
        <transition name="fade">
          <text
            v-if="homedToExtruder"
            x="219.5"
            y="325"
            font-weight="bold"
          >H</text>
        </transition>
      </g>

      <transition name="fade">
        <text
          v-if="homedToExtruderEntrance"
          x="219.5"
          y="339"
          font-weight="bold"
        >H</text>
      </transition>

      <g v-if="hasSensor('toolhead')">
        <circle
          cx="258"
          cy="350"
          r="8"
          style="stroke-width: 1"
          :class="sensorClass('toolhead')"
        />
        <text
          x="278"
          y="355"
          :class="{ 'text-disabled': !isSensorEnabled('toolhead') }"
        >Toolhead</text>
        <transition name="fade">
          <text
            v-if="homedToToolhead"
            x="219.5"
            y="355"
            font-weight="bold"
          >H</text>
        </transition>
      </g>

      <text
        x="228"
        y="412"
        font-size="11px"
        font-weight="bold"
        text-anchor="end"
        :class="temperatureClass"
      >
        {{ temperatureText }}
      </text>

      <g v-if="hasSyncFeedback">
        <use
          xlink:href="#sync-feedback-buffer-piston"
          :style="{
            transform: `translate(232px, ${syncFeedbackPistonPos}px)`,
            transition: 'transform 250ms ease',
          }"
        />
        <use
          xlink:href="#sync-feedback-buffer-box"
          transform="translate(232, 212)"
        />
        <g v-if="syncFeedbackActive">
          <transition name="fade">
            <g
              v-if="syncFeedbackState === SYNC_FEEDBACK_NEUTRAL"
              key="neutral"
            >
              <text
                x="298"
                y="240"
              >
                Neutral
              </text>
              <use
                xlink:href="#sync-feedback"
                transform="translate(296, 247.5) scale(1.0,-1.0) rotate(90)"
              />
            </g>
            <g
              v-else-if="syncFeedbackState === SYNC_FEEDBACK_TENSION"
              key="tension"
            >
              <text
                x="298"
                y="240"
              >
                Tension
              </text>
              <use
                xlink:href="#sync-feedback"
                transform="translate(272, 199) scale(1.2)"
              />
              <use
                xlink:href="#sync-feedback"
                transform="translate(272, 271) scale(1.2,-1.2)"
              />
            </g>
            <g
              v-else-if="syncFeedbackState === SYNC_FEEDBACK_COMPRESSED"
              key="compression"
            >
              <text
                x="298"
                y="240"
              >
                Compression
              </text>
              <use
                xlink:href="#sync-feedback"
                transform="translate(272, 235) scale(1.2)"
              />
              <use
                xlink:href="#sync-feedback"
                transform="translate(272, 235) scale(1.2,-1.2)"
              />
            </g>
          </transition>
        </g>
      </g>
      <text
        x="160"
        y="60"
        :class="tool === -2 ? 'tool-bypass' : 'tool-text'"
      >{{ toolText(tool) }}</text>
    </g>

    <transition name="fade">
      <use
        v-if="syncDrive"
        ref="sync"
        xlink:href="#sync-extruder"
        transform="translate(278, 385) scale(.030)"
      />
    </transition>

    <transition name="fade">
      <use
        v-if="isGripped"
        ref="grip"
        xlink:href="#filament-grip"
        transform="scale(.1) translate(1900, 420)"
      />
    </transition>

    <use
      v-if="action === ACTION_CUTTING_FILAMENT"
      ref="cut"
      xlink:href="#sissors"
      class="cut1-effect"
    />
    <use
      v-if="action === ACTION_CUTTING_TIP"
      ref="cutTip"
      xlink:href="#sissors"
      class="cut2-effect"
    />

    <use
      v-if="action === ACTION_PURGING"
      ref="poop"
      xlink:href="#blob"
      class="blob-effect"
      :stroke="lowerNozzleColor"
      :fill="lowerNozzleColor"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMmuMixin, ACTION_FORMING_TIP, ACTION_IDLE, ACTION_LOADING, ACTION_UNLOADING, ACTION_CUTTING_FILAMENT, ACTION_CUTTING_TIP, ACTION_PURGING, FILAMENT_POS_UNLOADED, FILAMENT_POS_HOMED_GATE, FILAMENT_POS_START_BOWDEN, FILAMENT_POS_IN_BOWDEN, FILAMENT_POS_END_BOWDEN, FILAMENT_POS_HOMED_ENTRY, FILAMENT_POS_HOMED_EXTRUDER, FILAMENT_POS_EXTRUDER_ENTRY, FILAMENT_POS_HOMED_TS, FILAMENT_POS_IN_EXTRUDER, FILAMENT_POS_LOADED, TOOL_GATE_BYPASS, SYNC_FEEDBACK_NEUTRAL, SYNC_FEEDBACK_TENSION, SYNC_FEEDBACK_COMPRESSED } from '@/composables/useMmuMixin'
import { useStore } from '@/composables/useStore'
import { useVuetify } from '@/composables/useVuetify'

const POSITIONS = {
  UNKNOWN: 8,
  BEFORE_PRE_GATE: 20,
  PRE_GATE: 25,
  AFTER_PRE_GATE: 40,
  BEFORE_GEAR: 50,
  GEAR: 55,
  AFTER_GEAR: 70,
  GATE: 85,
  AFTER_GATE: 100,
  ENCODER: 115,
  START_BOWDEN: 135,
  MID_BOWDEN: 221,
  END_BOWDEN: 290,
  EXTRUDER: 295,
  EXTRUDER_ENTRANCE: 308,
  BEFORE_TOOLHEAD: 315,
  TOOLHEAD: 325,
  COOLING_TUBE: 338,
  CUT_POINT: 355,
  NOZZLE_START: 371,
} as const

const {
  gate, filamentPos, action, filamentPosition, filament, printState, numToolchanges,
  slicerToolMap, sensors, encoderPos, unit, unitDetails,
  configGateHomingEndstop, configExtruderHomingEndstop, configExtruderForceHoming,
  syncFeedbackState, syncFeedbackBiasModelled, bowdenProgress,
  varsFilamentRemaining, varsFilamentRemainingColor, fromColorString,
  grip, servo, tool, toolText, hasEncoder, syncDrive,
} = useMmuMixin()
const { typedState, typedGetters } = useStore()
const vuetify = useVuetify()

const tipFormingClass = computed(() => action.value === ACTION_FORMING_TIP ? 'form-tip-effect' : '')

function hasSensor (sensorName: string): boolean {
  return sensorName in sensors.value
}

function isSensorEnabled (sensorName: string): boolean {
  return sensors.value[sensorName] != null
}

function isSensorTriggered (sensorName: string): boolean {
  const value = sensors.value[sensorName]
  return value !== null && value === true
}

const toolheadSensor = computed(() => sensors.value['toolhead'])

const endOfBowdenPos = computed(() => {
  if (typeof toolheadSensor.value === 'boolean' && !configExtruderForceHoming.value) return POSITIONS.END_BOWDEN
  const endstop = configExtruderHomingEndstop.value
  if (['none', 'collision', 'mmu_gear_touch', 'filament_compression'].includes(endstop)) return POSITIONS.EXTRUDER_ENTRANCE
  if (endstop === 'extruder') return POSITIONS.EXTRUDER
  return POSITIONS.END_BOWDEN
})

const filamentRectHeight = computed(() => {
  const fp = filamentPos.value
  if (gate.value === TOOL_GATE_BYPASS) {
    if (fp === FILAMENT_POS_EXTRUDER_ENTRY) return POSITIONS.BEFORE_TOOLHEAD
    if (fp === FILAMENT_POS_HOMED_TS) return POSITIONS.TOOLHEAD
    if (fp === FILAMENT_POS_IN_EXTRUDER) return POSITIONS.COOLING_TUBE
    if (fp === FILAMENT_POS_LOADED) return POSITIONS.NOZZLE_START
    if (isSensorTriggered('toolhead')) return POSITIONS.TOOLHEAD
    if (isSensorTriggered('extruder')) return POSITIONS.EXTRUDER
    if (isSensorTriggered('mmu_gear')) return POSITIONS.AFTER_GEAR
    if (isSensorTriggered('mmu_pre_gate')) return POSITIONS.AFTER_PRE_GATE
    return POSITIONS.BEFORE_PRE_GATE
  }
  if (fp === FILAMENT_POS_UNLOADED) {
    if (isSensorTriggered('mmu_gear')) return POSITIONS.AFTER_GEAR
    if (isSensorTriggered('mmu_pre_gate')) return POSITIONS.AFTER_PRE_GATE
    return POSITIONS.BEFORE_PRE_GATE
  }
  if (fp === FILAMENT_POS_HOMED_GATE) {
    if (configGateHomingEndstop.value === 'mmu_gear') return POSITIONS.GEAR
    if (configGateHomingEndstop.value === 'mmu_gate') return POSITIONS.GATE
    if (configGateHomingEndstop.value === 'extruder') return POSITIONS.EXTRUDER
    return POSITIONS.AFTER_GATE
  }
  if ([FILAMENT_POS_START_BOWDEN, FILAMENT_POS_IN_BOWDEN].includes(fp) && bowdenProgress.value >= 0) {
    const bowdenRange = endOfBowdenPos.value - POSITIONS.START_BOWDEN
    return POSITIONS.START_BOWDEN + (bowdenRange * bowdenProgress.value) / 100
  }
  if (fp === FILAMENT_POS_START_BOWDEN) return POSITIONS.START_BOWDEN
  if (fp === FILAMENT_POS_IN_BOWDEN) return POSITIONS.MID_BOWDEN
  if (fp === FILAMENT_POS_END_BOWDEN) return endOfBowdenPos.value
  if (fp === FILAMENT_POS_HOMED_ENTRY) return POSITIONS.EXTRUDER
  if (fp === FILAMENT_POS_HOMED_EXTRUDER) return POSITIONS.EXTRUDER_ENTRANCE
  if (fp === FILAMENT_POS_EXTRUDER_ENTRY) return POSITIONS.BEFORE_TOOLHEAD
  if (fp === FILAMENT_POS_HOMED_TS) return POSITIONS.TOOLHEAD
  if (fp === FILAMENT_POS_IN_EXTRUDER) return toolheadSensor.value === false ? POSITIONS.BEFORE_TOOLHEAD : POSITIONS.COOLING_TUBE
  if (fp === FILAMENT_POS_LOADED) return POSITIONS.NOZZLE_START
  return POSITIONS.UNKNOWN
})

function capitalize (str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const statusText = computed(() => {
  let posStr = ''
  if (['complete', 'error', 'cancelled', 'started'].includes(printState.value)) {
    posStr = capitalize(printState.value)
  } else if (action.value === ACTION_IDLE) {
    if (printState.value === 'printing') {
      posStr = `Printing (${numToolchanges.value}`
      if (slicerToolMap.value?.total_toolchanges) posStr += `/${slicerToolMap.value?.total_toolchanges}`
      posStr += ' swaps)'
    } else {
      posStr = filament.value !== 'Unloaded' ? `Filament: ${filamentPosition.value} mm` : 'Filament: Unloaded'
    }
  } else if (action.value === ACTION_LOADING || action.value === ACTION_UNLOADING) {
    posStr = `${action.value}: ${filamentPosition.value} mm`
  } else {
    posStr = action.value ?? ''
  }
  return posStr
})

const encoderPosText = computed(() =>
  encoderPos.value < 10000 ? `${encoderPos.value} mm` : `${encoderPos.value}`
)

const gateSensorName = computed(() =>
  unitDetails(unit.value).multiGear ? 'Hub (Gate)' : 'Gate'
)

const temperatureClass = computed(() => {
  const canExtrude = typedState.printer.printer.extruder?.can_extrude ?? false
  return canExtrude === false ? 'text-disabled' : ''
})

const temperatureText = computed(() => {
  const extTemp = typedState.printer.printer.extruder?.temperature ?? null
  return extTemp ? `${extTemp.toFixed(0)}°C` : ''
})

function sensorClass (sensorName: string): string {
  let sClass = ''
  if (!isSensorEnabled(sensorName)) {
    sClass = sensorName === 'extruder' ? 'sensor-disabled-extruder' : 'sensor-disabled'
  } else {
    sClass = isSensorTriggered(sensorName)
      ? 'sensor-triggered'
      : sensorName === 'extruder'
        ? 'sensor-open-extruder'
        : 'sensor-open'
  }
  return vuetify.theme.dark ? sClass + '-dark-theme' : sClass + '-light-theme'
}

const encoderClass = computed(() => {
  let eClass = ''
  if (filamentPos.value === FILAMENT_POS_UNLOADED) eClass = 'sensor-disabled'
  eClass = encoderPos.value ? 'sensor-triggered' : 'sensor-open'
  return vuetify.theme.dark ? eClass + '-dark-theme' : eClass + '-light-theme'
})

const hasFilamentProportionalSensor = computed(() => hasSensor('filament_proportional'))
const hasFilamentCompressionSensor = computed(() => hasSensor('filament_compression'))
const hasFilamentTensionSensor = computed(() => hasSensor('filament_tension'))

const hasSyncFeedback = computed(() =>
  hasFilamentCompressionSensor.value || hasFilamentTensionSensor.value || hasFilamentProportionalSensor.value
)

const syncFeedbackActive = computed(() =>
  hasSyncFeedback.value && filamentPos.value >= FILAMENT_POS_END_BOWDEN
)

const syncFeedbackPistonPos = computed(() => syncFeedbackBiasModelled.value * 12 + 234)

const syncFeedbackPistonText = computed(() =>
  hasFilamentProportionalSensor.value ? syncFeedbackBiasModelled.value.toFixed(2) : ''
)

const homedToEncoder = computed(() =>
  configGateHomingEndstop.value === 'encoder' && filamentPos.value === FILAMENT_POS_START_BOWDEN
)

const homedToGear = computed(() =>
  configGateHomingEndstop.value === 'mmu_gear' && filamentPos.value === FILAMENT_POS_HOMED_GATE
)

const homedToGate = computed(() =>
  configGateHomingEndstop.value === 'mmu_gate' && filamentPos.value === FILAMENT_POS_HOMED_GATE
)

const homedToExtruder = computed(() => filamentPos.value === FILAMENT_POS_HOMED_ENTRY)
const homedToExtruderEntrance = computed(() => filamentPos.value === FILAMENT_POS_HOMED_EXTRUDER)
const homedToToolhead = computed(() => filamentPos.value === FILAMENT_POS_HOMED_TS)

const upperNozzleFull = computed(() =>
  filamentPos.value === FILAMENT_POS_LOADED || !!varsFilamentRemaining.value
)

const lowerNozzleFull = computed(() =>
  filamentPos.value === FILAMENT_POS_LOADED ||
  !!varsFilamentRemaining.value ||
  !!varsFilamentRemainingColor.value
)

const upperNozzleColor = computed(() =>
  varsFilamentRemaining.value ? varsFilamentRemainingColor.value : 'none'
)

const currentGateColor = computed(() => {
  const color = gate.value === TOOL_GATE_BYPASS
    ? typedGetters['spoolman/getActiveSpool']?.filament.color_hex ?? null
    : typedState.printer.printer.mmu?.gate_color[gate.value] ?? ''
  return fromColorString(color)
})

const lowerNozzleColor = computed(() =>
  varsFilamentRemainingColor.value ? varsFilamentRemainingColor.value : currentGateColor.value
)

const isGripped = computed(() => grip.value === 'Gripped' || servo.value === 'Down')
</script>

<style scoped>
.svg-colors {
  --background-light-theme: #ffffff;
  --zone-background-light-theme: #f0f0f0;
  --background-dark-theme: #262629;
  --zone-background-dark-theme: #2c2c2c;
  --disabled-stroke: #808080;
  --color-outline:#2CA9BC;
}

svg text {
    fill: currentColor;
}

.text-disabled {
    opacity: 0.5;
}

.zone-background-light-theme {
    fill: var(--zone-background-light-theme);
}

.sensor-triggered-light-theme {
    fill: limegreen;
}

.sensor-disabled-light-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-light-theme);
}

.sensor-open-light-theme {
    fill: var(--zone-background-light-theme);
}

.sensor-disabled-extruder-light-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--background-light-theme);
}

.sensor-open-extruder-light-theme {
    fill: var(--background-light-theme);
}

.zone-background-dark-theme {
    fill: var(--zone-background-dark-theme);
}

.sensor-triggered-dark-theme {
    fill: limegreen;
}

.sensor-disabled-dark-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

.sensor-open-dark-theme {
    fill: var(--zone-background-dark-theme);
}

.sensor-disabled-extruder-dark-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--background-dark-theme);
}

.sensor-open-extruder-dark-theme {
    fill: var(--background-dark-theme);
}

.tool-text {
    font-size: 28px;
    font-weight: bold;
}

.tool-bypass {
    font-size: 16px;
    font-weight: normal;
}

@keyframes fadeInOut {
    0%,
    100% {
        opacity: 0;
        transform: translate(250px, 414px) scale(1);
    }
    90% {
        opacity: 1;
        transform: translate(250px, 414px) scale(16);
    }
}
.blob-effect {
    animation: fadeInOut 4s infinite;
}

@keyframes cut1 {
    0%,
    100% {
        opacity: 0.5;
        transform: translate(190px, 145px) scale(1.2);
    }
    30%,
    70% {
        opacity: 1;
        transform: translate(205px, 145px) scale(1.2);
    }
}
.cut1-effect {
    animation: cut1 3s infinite;
}

@keyframes cut2 {
    0%,
    100% {
        opacity: 0.5;
        transform: translate(190px, 365px) scale(1.2);
    }
    30%,
    70% {
        opacity: 1;
        transform: translate(205px, 365px) scale(1.2);
    }
}
.cut2-effect {
    animation: cut2 3s infinite;
}

@keyframes form-tip {
    0%,
    100% {
        height: 371px;
    }
    50% {
        height: 338px;
    }
}
.form-tip-effect {
    animation: form-tip 1s infinite;
}

.filament-animation {
    transition: height 0.5s ease-in;
}
</style>

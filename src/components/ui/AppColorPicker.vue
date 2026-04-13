<template>
  <v-menu
    bottom
    left
    max-width="260"
    :close-on-content-click="false"
    :disabled="disabled"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        v-if="!dot"
        v-bind="attrs"
        :color="controlColor"
        :disabled="disabled"
        outlined
        small
        v-on="on"
      >
        {{ title }}
      </v-btn>

      <v-icon
        v-else
        v-bind="attrs"
        :color="controlColor"
        :disabled="disabled"
        v-on="on"
      >
        $circle
      </v-icon>
    </template>
    <v-card ref="card">
      <v-card-title
        v-if="title"
        class="card-heading mb-2"
        style="cursor: move; user-select: none;"
        @mousedown="startMouseDrag"
        @touchstart="startTouchDrag"
        @touchmove="touchMove"
      >
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-icon
          v-if="supportedChannels !== 'W'"
          :color="currentPrimaryColor.hexString"
          large
        >
          $circle
        </v-icon>

        <v-icon
          v-if="supportedChannels.includes('W')"
          :color="currentWhiteColor.hexString"
          large
        >
          $circle
        </v-icon>

        <v-layout
          align-center
          column
        >
          <app-iro-color-picker
            v-if="supportedChannels !== 'W'"
            v-model="currentPrimaryColor.hexString"
            :options="primaryOptions"
            @input="handleSubmitPrimary"
          />

          <app-iro-color-picker
            v-if="supportedChannels.includes('W')"
            v-model="currentWhiteColor.hexString"
            class="mt-4"
            :options="whiteOptions"
            @input="handleSubmitWhite"
          />
        </v-layout>

        <div class="text-right mt-4 mr-1">
          <app-btn-toggle
            v-model="valueRange"
            mandatory
          >
            <app-btn
              x-small
              value="absolute"
            >
              0..255
            </app-btn>
            <app-btn
              x-small
              value="percentage"
            >
              0..1
            </app-btn>
          </app-btn-toggle>
        </div>

        <v-layout
          class="mt-2"
          justify-space-between
        >
          <div
            v-if="supportedChannels !== 'W'"
            class="color-input"
          >
            <v-text-field
              v-model.number="currentRed"
              dense
              hide-details
              outlined
              persistent-placeholder
              @blur="handleReset"
              @keyup.enter.exact="handleSubmitPrimary"
            />
            <div>R</div>
          </div>
          <div
            v-if="supportedChannels !== 'W'"
            class="color-input"
          >
            <v-text-field
              v-model.number="currentGreen"
              dense
              hide-details
              outlined
              persistent-placeholder
              @blur="handleReset"
              @keyup.enter.exact="handleSubmitPrimary"
            />
            <div>G</div>
          </div>
          <div
            v-if="supportedChannels !== 'W'"
            class="color-input"
          >
            <v-text-field
              v-model.number="currentBlue"
              dense
              hide-details
              outlined
              persistent-placeholder
              @blur="handleReset"
              @keyup.enter.exact="handleSubmitPrimary"
            />
            <div>B</div>
          </div>
          <div
            v-if="supportedChannels.includes('W')"
            class="color-input"
          >
            <v-text-field
              v-model.number="currentWhite"
              dense
              hide-details
              outlined
              persistent-placeholder
              @blur="handleReset"
              @keyup.enter.exact="handleSubmitWhite"
            />
            <div>W</div>
          </div>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import type { ColorPickerProps } from '@jaames/iro/dist/ColorPicker'
import type { ColorPickerValueRange } from '@/store/config/types'
import { useStore } from '@/composables/useStore'

interface PointerPosition { x: number; y: number }

const { typedState, typedDispatch } = useStore()

const props = withDefaults(defineProps<{
  white?: number
  title?: string
  dot?: boolean
  supportedChannels?: string
  disabled?: boolean
}>(), {
  white: 0,
  title: '',
  supportedChannels: 'RGB'
})

const emit = defineEmits<{
  (e: 'update:white', value: number): void
}>()

const { modelValue: inputPrimaryColor } = defineModels<{ modelValue: string }>()

const inputWhiteValue = computed({
  get: () => props.white ?? 0,
  set: (v: number) => emit('update:white', v)
})

const card = ref<{ $el: HTMLElement }>()
const lastPointerPosition = reactive<PointerPosition>({ x: 0, y: 0 })
const currentPrimaryColor = ref(new IroColor())
const currentWhiteColor = ref(new IroColor())

function valueToHexColor (value: number): string {
  value = Math.round(Math.min(Math.max(value, 0), 255))
  return `#${value.toString(16).padStart(2, '0').repeat(3)}`
}

const inputWhiteColor = computed(() => valueToHexColor(inputWhiteValue.value))

const valueRange = computed<ColorPickerValueRange>({
  get: () => typedState.config.uiSettings.general.colorPickerValueRange,
  set: (value) => typedDispatch('config/saveByPath', { path: 'uiSettings.general.colorPickerValueRange', value, server: true })
})

function convertValueRange (value: number, direction: 'in' | 'out') {
  if (valueRange.value === 'absolute') return value
  let factor = 1
  if (valueRange.value === 'percentage') factor = 255
  if (direction === 'out') factor = 1 / factor
  return Math.round(value * factor * 1000) / 1000
}

const currentRed = computed({
  get: () => convertValueRange(currentPrimaryColor.value.red, 'out'),
  set: (v: number) => { currentPrimaryColor.value.red = convertValueRange(v, 'in') }
})

const currentGreen = computed({
  get: () => convertValueRange(currentPrimaryColor.value.green, 'out'),
  set: (v: number) => { currentPrimaryColor.value.green = convertValueRange(v, 'in') }
})

const currentBlue = computed({
  get: () => convertValueRange(currentPrimaryColor.value.blue, 'out'),
  set: (v: number) => { currentPrimaryColor.value.blue = convertValueRange(v, 'in') }
})

const currentWhite = computed({
  get: () => convertValueRange(currentWhiteColor.value.red, 'out'),
  set: (v: number) => { currentWhiteColor.value.set(valueToHexColor(convertValueRange(v, 'in'))) }
})

const primaryOptions = computed<Partial<ColorPickerProps>>(() => ({
  color: inputPrimaryColor.value,
  width: 208,
  layout: [
    { component: iro.ui.Wheel, options: { wheelLightness: false, wheelAngle: 270, wheelDirection: 'clockwise' } },
    { component: iro.ui.Slider, options: { sliderType: 'value' } }
  ]
}))

const whiteOptions = computed<Partial<ColorPickerProps>>(() => ({
  color: inputWhiteColor.value,
  width: 208,
  layout: [{ component: iro.ui.Slider, options: { sliderType: 'value' } }]
}))

const controlColor = computed(() =>
  props.supportedChannels === 'W' ? inputWhiteColor.value : inputPrimaryColor.value
)

watch(inputPrimaryColor, (value) => { currentPrimaryColor.value.set(value) })
watch(() => props.white, (value) => { currentWhiteColor.value.set(valueToHexColor(value ?? 0)) })

function handleReset () {
  currentPrimaryColor.value.set(inputPrimaryColor.value)
  currentWhiteColor.value.set(inputWhiteColor.value)
}

function handleSubmitPrimary () {
  inputPrimaryColor.value = currentPrimaryColor.value.hexString
}

function handleSubmitWhite () {
  inputWhiteValue.value = currentWhiteColor.value.red
}

// Drag functionality
function relativeMove (newPosition: PointerPosition) {
  const parent = card.value?.$el.parentElement
  if (parent) {
    parent.style.left = (parseFloat(parent.style.left) + (newPosition.x - lastPointerPosition.x)) + 'px'
    parent.style.top = (parseFloat(parent.style.top) + (newPosition.y - lastPointerPosition.y)) + 'px'
  }
}

function mouseMove (event: MouseEvent) {
  const newPosition = { x: event.clientX, y: event.clientY }
  relativeMove(newPosition)
  Object.assign(lastPointerPosition, newPosition)
}

function stopMouseDrag () {
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', stopMouseDrag)
}

function startMouseDrag (event: MouseEvent) {
  Object.assign(lastPointerPosition, { x: event.clientX, y: event.clientY })
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', stopMouseDrag)
}

function startTouchDrag (event: TouchEvent) {
  Object.assign(lastPointerPosition, { x: event.touches[0].clientX, y: event.touches[0].clientY })
}

function touchMove (event: TouchEvent) {
  event.preventDefault()
  const newPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  relativeMove(newPosition)
  Object.assign(lastPointerPosition, newPosition)
}

// created equivalent
handleReset()
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  .color-input div {
    margin: 0 2px;
    text-align: center;
  }

  .theme--light .color-input div:not(:first-child) {
    color: rgba(map-get($material-light, 'text-color'), 0.45);
  }

  .theme--dark .color-input div:not(:first-child) {
    color: rgba(map-get($material-dark, 'text-color'), 0.45);
  }

  :deep(.v-text-field__slot input) {
    text-align: center;
  }

  :deep(.v-input--dense .v-input__slot) {
    min-height: 32px !important;
  }
</style>

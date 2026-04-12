<template>
  <div>
    <div ref="picker" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import iro from '@jaames/iro'
import type { IroColor } from '@irojs/iro-core'
import type { ColorPickerProps, IroColorPicker } from '@jaames/iro/dist/ColorPicker'

const props = withDefaults(defineProps<{
  value?: string
  options?: Partial<ColorPickerProps>
}>(), {
  value: '#ffffff'
})

const emit = defineEmits<{
  (e: 'input', value: string): void
}>()

const inputValue = computed({
  get: () => props.value ?? '#ffffff',
  set: (v: string) => emit('input', v)
})

const picker = ref<HTMLElement>()
const colorPicker = ref<IroColorPicker | null>(null)

watch(() => props.value, (value) => {
  if (value && colorPicker.value) {
    colorPicker.value.color.set(value)
  }
})

onMounted(() => {
  const options: Partial<ColorPickerProps> = {
    ...props.options,
    color: inputValue.value,
    sliderSize: 14
  }

  colorPicker.value = iro.ColorPicker(picker.value!, options)
  colorPicker.value.on('input:end', handleColorChange)
})

onBeforeUnmount(() => {
  if (colorPicker.value) {
    colorPicker.value.off('input:end', handleColorChange)
  }
})

function handleColorChange (color: IroColor) {
  inputValue.value = color.hexString
}
</script>

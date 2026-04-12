<template>
  <v-form
    ref="form"
    class="flex"
    @submit.prevent="handleSubmit"
  >
    <v-text-field
      v-bind="$attrs"
      v-model="currentValue"
      :class="{
        'v-input--width-small': small,
        'v-input--width-x-small': xSmall
      }"
      v-on="filteredListeners"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <slot
        v-for="slot in Object.keys($slots)"
        :slot="slot"
        :name="slot"
      />
    </v-text-field>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useListeners } from 'vue'
import type { VForm } from 'vuetify/lib'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  value?: unknown
  small?: boolean
  xSmall?: boolean
  submitOnEnter?: boolean
  submitOnChange?: boolean
}>(), {
  submitOnEnter: true
})

const emit = defineEmits<{
  (e: 'input', value: unknown): void
  (e: 'submit', value: unknown): void
  (e: 'change', value: unknown): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const form = ref<VForm>()
const currentValue = ref<unknown>('')
const hasFocus = ref(false)

const listeners = useListeners()
const filteredListeners = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { focus, blur, change, ...rest } = listeners
  return rest
})

watch(() => props.value, (value) => {
  if (!hasFocus.value) {
    currentValue.value = value
  }
})

function handleSubmit () {
  if (props.submitOnEnter && !props.submitOnChange && form.value?.validate()) {
    emit('submit', currentValue.value)
  }
}

function handleChange () {
  emit('change', currentValue.value)
  if (props.submitOnChange && form.value?.validate()) {
    emit('submit', currentValue.value)
  }
}

function handleFocus (event: FocusEvent) {
  hasFocus.value = true
  if (event.target instanceof HTMLInputElement) {
    event.target.select()
    emit('focus', event)
  }
}

function handleBlur (event: FocusEvent) {
  currentValue.value = props.value
  hasFocus.value = false
  emit('blur', event)
}

onMounted(() => {
  currentValue.value = props.value
})
</script>

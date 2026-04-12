<template>
  <v-form
    ref="form"
    class="flex"
    @submit.prevent
  >
    <v-row no-gutters>
      <!-- Label -->
      <v-col
        v-safe-html="label"
        cols="12"
        sm="5"
        align-self="center"
        class="text-body-1"
        :class="{ 'text--disabled': disabled }"
      />

      <!-- Current value -->
      <v-col>
        <v-text-field
          v-model="currentValue"
          :rules="textRules"
          :disabled="disabled || loading"
          :step="step"
          class="v-input--text-right"
          type="number"
          dense
          single-line
          outlined
          hide-details
          v-bind="$attrs"
          @focus="handleFocus"
          @blur="handleBlur"
          @keyup.enter.exact="handleSubmit(+currentValue)"
        >
          <template #prepend>
            <app-btn
              v-if="resetValue !== undefined"
              :disabled="disabled || loading"
              style="margin-top: -4px;"
              icon
              small
              @click="handleReset"
            >
              <v-icon small>
                $reset
              </v-icon>
            </app-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-slider
      v-model="sliderValue"
      :min="min"
      :max="internalMax"
      :step="step"
      :disabled="disabled || loading || internalLocked || overridden"
      dense
      hide-details
      @start="handleStart"
      @end="handleEnd"
      @change="handleChange"
    >
      <template #prepend>
        <app-btn
          v-if="locked"
          icon
          small
          :disabled="disabled || loading || overridden"
          @click="internalLocked = !internalLocked"
        >
          <v-icon small>
            {{ internalLocked ? '$lock' : '$lockReset' }}
          </v-icon>
        </app-btn>
      </template>
    </v-slider>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InputValidationRules } from 'vuetify'
import type { VForm } from 'vuetify/lib'
import { Rules } from '@/plugins/filters'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  value: number
  resetValue?: number
  label: string
  rules?: InputValidationRules[]
  disabled?: boolean
  locked?: boolean
  loading?: boolean
  min?: number
  max?: number
  overridable?: boolean
  step?: number
}>(), {
  min: 0,
  max: 100,
  step: 1
})

const emit = defineEmits<{
  (e: 'input', value: number): void
  (e: 'submit', value: number): void
  (e: 'change', value: number | string): void
  (e: 'start', value: number): void
  (e: 'end', value: number): void
}>()

const form = ref<VForm>()
const currentValue = ref(props.value.toString())
const sliderValue = ref(props.value)
const internalLocked = ref(props.locked)
const internalMax = ref(props.max)
const overridden = ref(false)
const hasFocus = ref(false)

const textRules = computed(() => {
  const rules = [
    ...(props.rules ?? []),
    Rules.required,
    Rules.numberValid,
    Rules.numberGreaterThanOrEqual(props.min)
  ]
  if (!props.overridable) {
    rules.push(Rules.numberLessThanOrEqual(props.max))
  }
  return rules
})

function checkOverride (value: number) {
  if (value > props.max && props.overridable) {
    overridden.value = true
    internalMax.value = value
  } else {
    overridden.value = false
    internalMax.value = props.max
  }
}

watch(() => props.value, (value) => {
  if (!hasFocus.value) {
    currentValue.value = value.toString()
  }
})

watch(currentValue, (value) => {
  const n = +value
  if (!Number.isNaN(n)) {
    checkOverride(n)
    sliderValue.value = n
  }
})

watch(sliderValue, (value) => {
  if (!hasFocus.value) {
    currentValue.value = value.toString()
  }
  emit('input', value)
})

watch(() => props.locked, (value) => {
  internalLocked.value = value
})

watch(() => props.max, () => {
  checkOverride(sliderValue.value)
})

function submitValue (value: number) {
  if (form.value?.validate()) {
    currentValue.value = value.toString()
    internalLocked.value = props.locked
    emit('submit', value)
  }
}

function handleReset () {
  if (props.resetValue !== undefined) {
    emit('change', props.resetValue)
    submitValue(props.resetValue)
  }
}

function handleFocus (event: FocusEvent) {
  hasFocus.value = true
  if (event.target instanceof HTMLInputElement) {
    event.target.select()
  }
}

function handleBlur () {
  if (hasFocus.value) {
    emit('change', currentValue.value)
    currentValue.value = props.value.toString()
    hasFocus.value = false
  }
}

function handleSubmit (value: number) {
  submitValue(value)
}

function handleStart (value: number) {
  hasFocus.value = false
  emit('start', value)
}

function handleEnd (value: number) {
  emit('end', value)
}

function handleChange (value: number) {
  emit('change', value)
  submitValue(value)
}
</script>

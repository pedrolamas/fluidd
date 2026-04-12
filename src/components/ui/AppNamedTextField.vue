<template>
  <v-row no-gutters>
    <v-col
      v-safe-html="label"
      cols="12"
      sm="5"
      align-self="center"
      class="text-body-1"
      :class="{ 'text--disabled': disabled }"
    />
    <v-col>
      <app-text-field
        v-model="inputValue"
        :disabled="disabled || loading"
        class="v-input--text-right"
        dense
        single-line
        hide-details
        outlined
        v-bind="$attrs"
        v-on="$listeners"
      >
        <template #prepend>
          <app-btn
            v-if="resetValue !== undefined"
            :disabled="disabled"
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
      </app-text-field>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  value?: unknown
  label: string
  resetValue?: unknown
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: unknown): void
  (e: 'submit', value: unknown): void
}>()

const inputValue = computed({
  get: () => props.value,
  set: (v: unknown) => emit('input', v)
})

function handleReset () {
  if (props.resetValue !== undefined) {
    inputValue.value = props.resetValue
    emit('submit', props.resetValue)
  }
}
</script>

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
      <v-select
        v-model="inputValue"
        class="mt-0"
        :disabled="disabled || loading"
        dense
        single-line
        outlined
        hide-details
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
      </v-select>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  resetValue?: unknown
  label: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: unknown): void
}>()

const { modelValue: inputValue } = defineModels<{ modelValue?: unknown }>()

function handleReset () {
  if (props.resetValue !== undefined) {
    emit('change', props.resetValue)
  }
}
</script>

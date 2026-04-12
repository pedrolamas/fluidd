<template>
  <div
    @focusin="hasFocus = true"
    @focusout="hasFocus = false"
  >
    <div
      class="v-input v-input--hide-details v-text-field v-text-field--enclosed v-text-field--outlined"
      :class="{
        'v-input--is-focused': hasFocus,
        'v-input--is-disabled': disabled,
        [$vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
      }"
    >
      <div class="v-input__control">
        <div
          ref="input-slot"
          class="v-input__slot"
          :tabindex="disabled ? undefined : 0"
        >
          <slot />
          <fieldset
            aria-hidden="true"
            :class="{
              'primary--text': hasFocus
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const inputSlot = ref<HTMLDivElement>()
const hasFocus = ref(false)

watch(hasFocus, (value) => {
  if (value) {
    emit('focus')
  } else {
    emit('blur')
  }
})

function focus () {
  inputSlot.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="scss" scoped>
  :deep(.v-input__slot) {
    padding: 0px !important;
    outline: none !important;
    cursor: default !important;

    fieldset {
      top: 0px !important;
    }
  }
</style>

<template>
  <app-dialog
    v-model="open"
    :title="title"
    max-width="320"
    @save="handleSave"
  >
    <v-card-text>
      <v-text-field
        v-model="newName"
        autofocus
        outlined
        :label="label"
        :rules="[
          $rules.required
        ]"
        spellcheck="false"
        required
        @focus="handleFocus"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  title: string
  label: string
  name: string
  isFile?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', name: string): void
}>()

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const newName = ref('')

onMounted(() => { newName.value = props.name })

function handleFocus (event: FocusEvent) {
  if (event.target instanceof HTMLInputElement) {
    const index = props.isFile ? event.target.value.lastIndexOf('.') : -1
    if (index > 0) {
      event.target.setSelectionRange(0, index)
    } else {
      event.target.select()
    }
  }
}

function handleSave () {
  emit('save', newName.value)
  open.value = false
}
</script>

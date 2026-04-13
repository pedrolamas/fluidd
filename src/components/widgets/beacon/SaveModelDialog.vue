<template>
  <app-dialog
    v-model="open"
    :title="$t('app.general.label.save_as')"
    max-width="450"
    @save="handleSubmit()"
  >
    <v-card-text>
      <v-text-field
        v-model="name"
        autofocus
        filled
        required
        class="mb-4"
        :rules="[
          $rules.required
        ]"
        hide-details="auto"
        :label="$t('app.beacon.label.model_name')"
      />

      <v-checkbox
        v-model="removeDefault"
        :label="$t('app.beacon.label.remove_model', { name: existingName })"
        hide-details="auto"
        class="mb-4"
        :disabled="name === existingName"
      />

      <span>
        {{ $t('app.beacon.msg.hint', { name: existingName }) }}
      </span>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  value?: boolean
  existingName: string
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'save', config: { name: string; removeDefault: boolean }): void
}>()

const open = computed({
  get: () => props.value,
  set: (value: boolean | undefined) => emit('input', value ?? false)
})

const name = ref('default')
const removeDefault = ref(false)

onMounted(() => {
  name.value = 'default'
  removeDefault.value = false
})

function handleSubmit () {
  emit('save', { name: name.value, removeDefault: removeDefault.value })
  open.value = false
}
</script>

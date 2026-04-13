<template>
  <app-dialog
    v-model="open"
    :title="(user.created_on) ? $t('app.general.label.edit_user') : $t('app.general.label.add_user')"
    :save-button-text="(user.created_on) ? $t('app.general.btn.save') : $t('app.general.btn.add')"
    max-width="500"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="$t('app.general.label.name')">
        <v-text-field
          v-model="user.username"
          autocomplete="username"
          :disabled="(user.created_on)"
          filled
          dense
          spellcheck="false"
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required,
            Rules.lengthLessThanOrEqual(60)
          ]"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.general.label.password')">
        <v-text-field
          v-model="user.password"
          autocomplete="current-password"
          filled
          dense
          type="password"
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required,
            Rules.lengthGreaterThanOrEqual(4),
            Rules.passwordNotEqualUsername(user.username)
          ]"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppUser } from '@/store/auth/types'
import { Rules } from '@/plugins/filters'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const props = defineProps<{
  user: AppUser
}>()
const emit = defineEmits<{
  (e: 'save', user: AppUser): void
}>()

const user = computed(() => props.user)

function handleSave () {
  emit('save', props.user)
  open.value = false
}
</script>

<template>
  <app-dialog
    v-model="open"
    :title="$t('app.general.label.change_password')"
    :cancel-button-loading="loading"
    :save-button-loading="loading"
    max-width="500"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <template v-if="error">
        <v-alert
          type="error"
          text
          class="mx-4 mt-4"
        >
          {{ $t('app.general.msg.wrong_password') }}
        </v-alert>

        <v-divider />
      </template>

      <app-setting :title="$t('app.general.label.current_password')">
        <v-text-field
          v-model="currentPassword"
          autocomplete="current-password"
          filled
          dense
          type="password"
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required
          ]"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.general.label.new_password')">
        <v-text-field
          v-model="password"
          autocomplete="current-password"
          filled
          dense
          type="password"
          class="mt-0"
          hide-details="auto"
          :rules="[
            Rules.required,
            Rules.lengthGreaterThanOrEqual(4),
            Rules.passwordNotEqualUsername(currentUser)
          ]"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EventBus } from '@/eventBus'
import type { AppUser } from '@/store/auth/types'
import { SocketActions } from '@/api/socketActions'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { Rules } from '@/plugins/filters'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const { typedState } = useStore()
const { tc } = useI18n()

const currentPassword = ref('')
const password = ref('')
const error = ref(false)
const loading = ref(false)

const currentUser = computed(() => {
  const currentUser: AppUser | null = typedState.auth.currentUser
  return currentUser?.username ?? ''
})

async function handleSave () {
  try {
    loading.value = true

    await SocketActions.accessUserPassword(currentPassword.value, password.value)

    EventBus.$emit(tc('app.general.msg.password_changed'), { timeout: 2000 })

    open.value = false
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

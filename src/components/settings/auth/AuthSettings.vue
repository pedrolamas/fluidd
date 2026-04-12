<template>
  <div>
    <v-subheader id="auth">
      {{ $t('app.setting.title.authentication') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          class="mr-2"
          @click="handleApiKeyDialog"
        >
          <v-icon
            small
            left
          >
            $edit
          </v-icon>
          {{ $t('app.general.label.api_key') }}
        </app-btn>

        <app-btn
          outlined
          small
          color="primary"
          @click="handleAddUserDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ $t('app.setting.btn.add_user') }}
        </app-btn>
      </app-setting>

      <v-divider v-if="users.length > 0" />

      <template
        v-for="(user, i) in users"
      >
        <app-setting
          :key="`user-${user.username}`"
          :sub-title="
            user.username === currentUser ? $t('app.general.label.current_user') :
            user.source !== 'moonraker' ? $t('app.general.label.user_managed_source', { source: $t(`app.general.label.${user.source}`) }) :
            undefined
          "
          :r-cols="3"
        >
          <template #title>
            {{ user.username }}
          </template>

          <app-btn
            :disabled="user.username === currentUser || user.source !== 'moonraker'"
            icon
            @click.stop="handleRemoveUser(user)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </app-setting>

        <v-divider
          v-if="i < users.length - 1"
          :key="`divider-${user.username}`"
        />
      </template>

      <user-config-dialog
        v-if="userDialogState.open"
        v-model="userDialogState.open"
        :user="userDialogState.user"
        @save="userDialogState.handler"
      />

      <api-key-dialog
        v-if="apiKeyDialogState.open"
        v-model="apiKeyDialogState.open"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AppUser } from '@/store/auth/types'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import UserConfigDialog from './UserConfigDialog.vue'
import ApiKeyDialog from './ApiKeyDialog.vue'

const { typedState, typedDispatch } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()

const userDialogState = ref<any>({
  open: false,
  user: null,
  handler: null
})

const apiKeyDialogState = ref<any>({
  open: false
})

const users = computed((): AppUser[] => typedState.auth.users)

const currentUser = computed(() => {
  const currentUser: AppUser | null = typedState.auth.currentUser
  return currentUser?.username ?? ''
})

function handleAddUserDialog () {
  userDialogState.value = {
    open: true,
    user: { username: '', password: '' },
    handler: handleSaveUser
  }
}

function handleApiKeyDialog () {
  apiKeyDialogState.value.open = true
}

async function handleRemoveUser (user: AppUser) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_user', { username: user.username }),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    typedDispatch('auth/removeUser', user)
  }
}

async function handleSaveUser (user: AppUser) {
  await typedDispatch('auth/addUser', user)

  // We only want to check trust if this is the first user being added.
  if (users.value.length === 0) typedDispatch('auth/checkTrust')
}
</script>

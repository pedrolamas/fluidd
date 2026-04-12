<template>
  <v-menu
    :nudge-width="260"
    offset-y
    :close-delay="300"
  >
    <template #activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <app-btn
            v-bind="attrs"
            icon
            text
            v-on="{ ...tooltip, ...menu }"
            @click="emit('drawer')"
          >
            <v-icon>$account</v-icon>
          </app-btn>
        </template>
        <span>{{ currentUser }}</span>
      </v-tooltip>
    </template>

    <v-card>
      <v-card-text class="text-center">
        <div>
          <v-icon large>
            $account
          </v-icon>
        </div>
        <span class="text-h5">{{ currentUser }}</span>

        <div
          v-if="user && !isTrustedOnly"
          class="mt-3"
        >
          <app-btn
            :disabled="user.source !== 'moonraker'"
            small
            @click="emit('change-password')"
          >
            {{ $t('app.general.label.change_password') }}
          </app-btn>
          <div
            v-if="user.source !== 'moonraker'"
            class="mt-2"
          >
            <small>
              {{ $t('app.general.label.user_managed_source', { source: $t(`app.general.label.${user.source}`) }) }}
            </small>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-list
        dense
        class="py-0"
      >
        <v-list-item @click="Filters.routeTo({ name: 'settings', hash: '#auth' })">
          <v-list-item-icon>
            <v-icon>$addAccount</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.general.label.manage_accounts') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <template v-if="!isTrustedOnly">
          <v-divider />

          <v-list-item>
            <v-list-item-content class="justify-center">
              <app-btn @click="handleLogout">
                {{ $t('app.general.btn.logout') }}
              </app-btn>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { startCase, capitalize } from 'lodash-es'
import { useStore } from '@/composables/useStore'
import { Filters } from '@/plugins/filters'

const emit = defineEmits<{
  (e: 'drawer'): void
  (e: 'change-password'): void
}>()

const { typedState, typedDispatch } = useStore()

const user = computed(() => typedState.auth.currentUser)

const currentUser = computed(() => {
  if (!user.value) return ''
  if (
    user.value.username === '_TRUSTED_USER_' ||
    user.value.username === '_API__API_KEY_USER_USER_'
  ) {
    return capitalize(startCase(user.value.username))
  } else {
    return user.value.username
  }
})

const isTrustedOnly = computed(() => {
  if (!user.value) return false
  return (
    user.value.username === '_TRUSTED_USER_' ||
    user.value.username === '_API__API_KEY_USER_USER_'
  )
})

async function handleLogout () {
  await typedDispatch('auth/checkTrust')
}
</script>

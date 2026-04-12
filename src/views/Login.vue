<template>
  <v-row
    :dense="$vuetify.breakpoint.smAndDown"
    justify="center"
    align="center"
  >
    <v-col
      cols="12"
      md="4"
      lg="3"
      xl="2"
    >
      <v-form
        @submit.prevent="handleLogin"
      >
        <div class="text-center">
          <p v-safe-html="$t('app.general.msg.welcome_back')" />

          <v-alert
            v-if="error"
            type="error"
          >
            {{ $t('app.general.simple_form.error.credentials') }}
          </v-alert>

          <v-text-field
            v-model="username"
            :label="$t('app.general.label.username')"
            autocomplete="username"
            spellcheck="false"
            filled
            dense
            hide-details="auto"
            :disabled="loading"
            class="mb-4"
          />

          <v-text-field
            v-model="password"
            :label="$t('app.general.label.password')"
            autocomplete="current-password"
            filled
            dense
            type="password"
            hide-details="auto"
            :disabled="loading"
            class="mb-4"
          />

          <v-select
            v-if="availableSources.length > 1"
            v-model="source"
            :label="$t('app.general.label.auth_source')"
            filled
            dense
            hide-details="auto"
            :disabled="loading"
            :items="availableSources.map(value => ({ text: $t(`app.general.label.${value}`), value }))"
            class="mb-4"
          />

          <app-btn
            type="submit"
            :disabled="loading"
            large
            block
            class="mb-6"
          >
            <v-icon
              v-if="loading"
              class="spin mr-2"
            >
              $loading
            </v-icon>
            {{ $t('app.general.btn.login') }}
          </app-btn>

          <app-btn
            plain
            class="custom-transform-class text-none"
            :href="$globals.DOCS_AUTH_LOST_PASSWORD"
            target="_blank"
          >
            {{ $t('app.general.btn.forgot_password') }}
          </app-btn>

          <app-btn
            plain
            class="custom-transform-class text-none"
            :href="$globals.DOCS_AUTH"
            target="_blank"
          >
            {{ $t('app.general.btn.auth_unsure') }}
          </app-btn>
        </div>
      </v-form>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useStore } from '@/composables/useStore'
import { appInit } from '@/init'
import { consola } from 'consola'
import type { InstanceConfig } from '@/store/config/types'

const { typedState, typedGetters, typedDispatch } = useStore()

const username = ref('')
const password = ref('')
const error = ref(false)
const loading = ref(false)
const source = ref('moonraker')
const availableSources = ref([source.value])

onMounted(async () => {
  const authInfo = await typedDispatch('auth/getAuthInfo')
  source.value = authInfo.defaultSource ?? source.value
  availableSources.value = authInfo.availableSources ?? availableSources.value
})

const handleLogin = async () => {
  error.value = false
  loading.value = true
  try {
    await typedDispatch('auth/login', { username: username.value, password: password.value, source: source.value })
  } catch {
    error.value = true
  }
  loading.value = false

  // Re-init the app.
  if (!error.value) {
    const instance: InstanceConfig | undefined = typedGetters['config/getCurrentInstance']

    const config = await appInit(instance, typedState.config.hostConfig)

    // Reconnect the socket with the new instance url.
    if (config.apiConnected && config.apiAuthenticated) {
      consola.debug('Activating socket with config', config)
      getCurrentInstance()?.proxy?.$socket.connect(config.apiConfig.socketUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-card__actions {
    padding: 8px 16px;
  }
</style>

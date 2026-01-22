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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Login extends Vue {
  username = ''
  password = ''
  error = false
  loading = false
  source = 'moonraker'
  availableSources = [this.source]

  async mounted () {
    try {
      const authInfo = await this.$typedDispatch('auth/getAuthInfo')
      this.source = authInfo.defaultSource ?? this.source
      this.availableSources = authInfo.availableSources ?? this.availableSources
    } catch (e) {
      // If we can't get auth info (e.g., socket not ready), use defaults
      console.debug('Could not get auth info:', e)
    }
  }

  async handleLogin () {
    this.error = false
    this.loading = true
    try {
      await this.$typedDispatch('auth/login', { username: this.username, password: this.password, source: this.source })
      
      // On successful login, navigate to home
      // The auth action already re-identifies on the WebSocket with the new token
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' })
      }
    } catch {
      this.error = true
    }
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
  .v-card__actions {
    padding: 8px 16px;
  }
</style>

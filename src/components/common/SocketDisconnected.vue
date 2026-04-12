<template>
  <v-container style="height: 400px;">
    <v-row
      class="fill-height"
      align-content="center"
      justify="center"
    >
      <v-col
        class="subtitle-1 text-center"
        cols="12"
      >
        <div v-if="apiUrl">
          {{ apiUrl }}
        </div>
        <span v-if="socketConnecting || !appReady">{{ $t('app.socket.msg.connecting') }}</span>
        <span v-else>{{ $t('app.socket.msg.no_connection') }}</span>
      </v-col>
      <v-col
        cols="6"
        lg="4"
      >
        <v-progress-linear
          v-if="socketConnecting || !appReady"
          class="mb-4"
          color="warning"
          indeterminate
          rounded
          height="6"
        />

        <app-btn
          v-if="!socketConnecting && activeInstance"
          block
          color="info"
          class="me-2 mb-2"
          @click="reconnect()"
        >
          {{ $t('app.general.btn.socket_reconnect') }}
        </app-btn>

        <app-btn
          block
          color="warning"
          class="me-2 mb-2"
          @click="reload()"
        >
          {{ $t('app.general.btn.socket_refresh') }}
        </app-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { appInit } from '@/init'
import type { InstanceConfig } from '@/store/config/types'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

const { typedState, typedGetters } = useStore()
const { socketConnecting, appReady } = useStateMixin()
const vm = getCurrentInstance()

const activeInstance = computed<InstanceConfig | undefined>(
  () => typedGetters['config/getCurrentInstance']
)
const apiUrl = computed(() => typedState.config.apiUrl)

function reload () {
  window.location.reload()
}

async function reconnect () {
  const config = await appInit(activeInstance.value, typedState.config.hostConfig)
  if (config.apiConfig.socketUrl && config.apiConnected && config.apiAuthenticated) {
    vm?.proxy?.$socket.connect(config.apiConfig.socketUrl)
  }
}
</script>

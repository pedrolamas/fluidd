<template>
  <div>
    <v-snackbar
      v-model="needRefresh"
      timeout="-1"
      multi-line
      elevation="24"
      bottom
      right
    >
      <span v-safe-html="$t('app.general.msg.needs_refresh')" />
      <template #action="{ attrs }">
        <app-btn
          v-bind="attrs"
          @click="updateServiceWorker"
        >
          {{ $t('app.general.btn.reload') }}
        </app-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consola } from 'consola'
import { EventBus } from '@/eventBus'
import { useI18n } from '@/composables/useI18n'

const { tc } = useI18n()

const updateSW = ref<((reloadPage?: boolean) => Promise<void>) | null>(null)
const needRefresh = ref(false)

function onOfflineReady () {
  consola.debug('[PWA] ready for offline work')
  EventBus.$emit(tc('app.general.msg.offline_ready'), { timeout: 5000 })
}

function onNeedRefresh () {
  consola.debug('[PWA] needs refresh')
  needRefresh.value = true
}

function onRegistered (registration?: ServiceWorkerRegistration) {
  consola.debug('[PWA] registered', registration)
}

function onRegisterError (e: unknown) {
  consola.error('[PWA] registration error', e)
}

function updateServiceWorker () {
  updateSW.value?.(true)
}

onMounted(async () => {
  try {
    const { registerSW } = await import('virtual:pwa-register')
    updateSW.value = registerSW({
      immediate: true,
      onOfflineReady,
      onNeedRefresh,
      onRegistered,
      onRegisterError
    })
  } catch {
    consola.error('[PWA] disabled')
  }
})
</script>

<style lang="scss" scoped>
  :deep(.v-snack__wrapper .v-snack__content) {
    overflow: hidden;
    overflow-wrap: break-word;
  }
</style>

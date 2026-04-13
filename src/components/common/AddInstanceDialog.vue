<template>
  <app-dialog
    v-model="open"
    max-width="320"
    :save-button-disabled="!verified"
    :valid.sync="valid"
    :title="$t('app.general.title.add_printer')"
    :help-tooltip="$t('app.endpoint.tooltip.endpoint_examples')"
    @save="addInstance"
  >
    <v-card-text>
      <span v-safe-html="helpTxt" />

      <v-text-field
        v-model="url"
        type="url"
        spellcheck="false"
        autofocus
        :label="$t('app.general.label.api_url')"
        persistent-hint
        :hint="$t('app.endpoint.hint.add_printer')"
        :loading="verifying"
        :rules="[
          $rules.required,
          customRules.url
        ]"
      >
        <template #append-outer>
          <v-icon
            v-if="verifying"
            class="spin"
            color="primary"
          >
            $loading
          </v-icon>
          <v-icon
            v-if="!verified && !verifying"
            color="error"
          >
            $cloudAlert
          </v-icon>
          <v-icon
            v-if="verified && !verifying"
            color="success"
          >
            $cloudCheck
          </v-icon>
        </template>
      </v-text-field>

      <v-alert
        v-if="error"
        v-safe-html="error"
        dense
        text
        type="error"
        class="mt-3 mb-2"
      />

      <p
        v-if="note"
        v-safe-html="note"
        class="mb-0"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Globals } from '@/globals'
import { Filters } from '@/plugins/filters'
import axios from 'axios'
import { debounce } from 'lodash-es'
import { consola } from 'consola'
import { httpClientActions } from '@/api/httpClientActions'
import webSocketWrapper from '@/util/web-socket-wrapper'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const { modelValue: open } = defineModels<{ modelValue?: boolean }>()

const emit = defineEmits<{
  (e: 'resolve', value: ReturnType<typeof Filters.getApiUrls>): void
}>()

const { typedState } = useStore()
const { t } = useI18n()

const valid = ref(true)
const verifying = ref(false)
const verified = ref(false)
const error = ref<any>(null)
const note = ref<any>(null)
const url = ref('')
const abortController = ref<AbortController | undefined>(undefined)

const customRules = computed(() => ({
  url: (v: string) => validUrl(v) || t('app.general.simple_form.error.invalid_url')
}))

function validUrl (u: string) {
  try {
    Filters.getApiUrls(u)
  } catch {
    return false
  }
  return true
}

const hosted = computed((): boolean => typedState.config.hostConfig.hosted)

const helpTxt = computed(() =>
  t('app.endpoint.msg.trouble', { url: Globals.DOCS_MULTIPLE_INSTANCES })
)

const handleUrlChange = debounce(async (value: string) => {
  if (valid.value) {
    verified.value = false
    error.value = null
    note.value = null
    verifying.value = true

    const { apiUrl, socketUrl } = Filters.getApiUrls(value)

    abortController.value?.abort()
    abortController.value = new AbortController()

    const { signal } = abortController.value

    const request = await httpClientActions.get(`${apiUrl}/server/info?t=${Date.now()}`, {
      withAuth: false,
      signal
    })
      .then(() => {
        verified.value = true
        verifying.value = false
        return 'ok'
      })
      .catch(e => {
        if (axios.isCancel(e)) {
          return 'ok'
        } else if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            verified.value = true
            verifying.value = false
            return 'ok'
          }
          if (e.request) return e.message
        }
        error.value = e
        return 'ok'
      })

    if (request !== 'ok') {
      if (hosted.value) {
        await webSocketWrapper(socketUrl, signal)
          .then(() => {
            verified.value = true
          })
          .catch(e => {
            consola.debug('Network Error', e, request)
            error.value = request
            note.value = t('app.endpoint.error.cant_connect')
          })
          .finally(() => { verifying.value = false })
      } else {
        await fetch(`${apiUrl}/server/info`, { signal, mode: 'no-cors', cache: 'no-cache' })
          .then(() => {
            error.value = t('app.endpoint.error.cors_error')
            note.value = t('app.endpoint.error.cors_note', {
              url: Globals.DOCS_MULTIPLE_INSTANCES
            })
          })
          .catch(e => {
            consola.debug('Network Error', e, request)
            error.value = request
            note.value = t('app.endpoint.error.cant_connect')
          })
          .finally(() => { verifying.value = false })
      }
    }
  }
}, 750)

watch(url, (value, oldVal) => {
  if (value === oldVal) return
  if (valid.value) handleUrlChange(value)
})

function addInstance () {
  const apiConfig = Filters.getApiUrls(url.value)
  open.value = false
  emit('resolve', apiConfig)
}
</script>

<template>
  <v-alert
    v-if="message"
    icon="$warning"
    :type="type"
    class="mt-3 align-content-center"
    dense
    text
  >
    <v-row>
      <v-col class="grow text-format">
        {{ message }}
      </v-col>
      <v-col class="shrink py-0 align-content-center">
        <v-btn
          icon
          @click="clearMessage"
        >
          <v-icon small>
            $close
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { consola } from 'consola'

const { sendGcode } = useStateMixin()
const { afc } = useAfcMixin()

const type = computed(() => {
  const t = afc.value?.message?.type ?? 'error'
  const possibleTypes = ['info', 'warning', 'success', 'error']

  if (!possibleTypes.includes(t)) {
    consola.warn(`AfcCardMessage: Invalid message type "${t}" detected. Defaulting to "error".`)
    return 'error'
  }

  return t
})

const message = computed(() => afc.value?.message?.message)

function clearMessage () {
  sendGcode('AFC_CLEAR_MESSAGE')
}
</script>

<style scoped>
.text-format {
  white-space: break-spaces;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}
</style>

<template>
  <v-text-field
    v-model="inputValue"
    class="app-text-field"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #append-outer>
      <v-tooltip
        :close-delay="hasCopied ? 2000 : undefined"
        :open-on-focus="false"
        bottom
      >
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            icon
            class="btn-copy"
            @click="handleCopy"
            v-on="on"
          >
            <v-fade-transition leave-absolute>
              <v-icon
                :key="hasCopied"
                dense
                class="icon-copy"
              >
                {{ hasCopied ? '$check' : '$contentCopy' }}
              </v-icon>
            </v-fade-transition>
          </app-btn>
        </template>
        <span>{{ hasCopied ? $t('app.general.btn.copied') : $t('app.general.btn.copy') }}</span>
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import clipboardCopy from '@/util/clipboard-copy'
import sleep from '@/util/sleep'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  value?: unknown
}>()

const emit = defineEmits<{
  (e: 'input', value: unknown): void
}>()

const inputValue = computed({
  get: () => props.value,
  set: (v: unknown) => emit('input', v)
})

const hasCopied = ref(false)
const abortController = ref<AbortController | null>(null)
const instance = getCurrentInstance()

async function handleCopy () {
  if (props.value) {
    if (await clipboardCopy(props.value.toString(), instance?.proxy?.$el as Element)) {
      abortController.value?.abort()

      hasCopied.value = true

      try {
        const ctrl = new AbortController()
        abortController.value = ctrl

        await sleep(2000, ctrl.signal)

        hasCopied.value = false
      } catch {}
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-text-field {
    .btn-copy {
      margin-top: -8px;
      margin-right: -2px;
    }

    .icon-copy {
      position: absolute;
    }
  }
</style>

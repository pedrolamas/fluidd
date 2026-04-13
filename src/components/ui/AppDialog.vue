<template>
  <v-dialog
    v-model="open"
    :scrollable="scrollable"
    :persistent="persistent"
    :fullscreen="isMobileViewport"
    :transition="isMobileViewport ? 'dialog-bottom-transition' : undefined"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <v-form
      ref="form"
      v-model="validModel"
      :disabled="disabled"
      @submit.prevent="handleSave"
    >
      <v-card
        :loading="loading"
        :class="{
          'collapsable-card': titleShadow
        }"
      >
        <v-card-title
          class="card-heading py-2"
          :class="{
            'collapsable-card-title': titleShadow
          }"
        >
          <v-row no-gutters>
            <v-col align-self="center">
              <slot name="title">
                <span class="focus--text">{{ title }}</span>
                <app-inline-help
                  v-if="helpTooltip"
                  bottom
                  small
                  :tooltip="helpTooltip"
                />
              </slot>
            </v-col>

            <v-col
              cols="auto"
              align-self="center"
            >
              <slot name="menu" />
            </v-col>

            <v-col
              v-if="!persistent"
              cols="auto"
              align-self="center"
            >
              <app-btn
                icon
                :disabled="closeButtonDisabled"
                @click="open = false"
              >
                <v-icon dense>
                  $close
                </v-icon>
              </app-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-subtitle
          v-if="subTitle || $slots['sub-title']"
          class="card-heading pb-2 secondary--text"
        >
          <slot name="sub-title">
            {{ subTitle }}
          </slot>
        </v-card-subtitle>

        <v-divider />

        <slot />

        <template v-if="!noActions">
          <v-divider />

          <v-card-actions>
            <slot name="actions">
              <v-spacer />
              <app-btn
                color="warning"
                text
                type="button"
                :loading="cancelButtonLoading"
                @click="handleCancel"
              >
                {{ cancelButtonText || $t('app.general.btn.cancel') }}
              </app-btn>
              <app-btn
                color="primary"
                type="submit"
                :loading="saveButtonLoading"
                :disabled="saveButtonDisabled"
              >
                {{ saveButtonText || $t('app.general.btn.save') }}
              </app-btn>
            </slot>
          </v-card-actions>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, useListeners } from 'vue'
import type { VForm } from 'vuetify/lib'
import { useBrowserMixin } from '@/composables/useBrowserMixin'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  disabled?: boolean
  title?: string
  helpTooltip?: string
  subTitle?: string
  closeButtonDisabled?: boolean
  cancelButtonText?: string
  cancelButtonLoading?: boolean
  saveButtonText?: string
  saveButtonDisabled?: boolean
  saveButtonLoading?: boolean
  scrollable?: boolean
  persistent?: boolean
  noActions?: boolean
  loading?: boolean | string
  titleShadow?: boolean
}>(), {
  scrollable: true
})

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save'): void
}>()

const { isMobileViewport } = useBrowserMixin()
const listeners = useListeners()

const { modelValue: open, valid: validModel } = defineModels<{
  modelValue?: boolean
  valid?: boolean
}>()

const form = ref<VForm>()

function validate () {
  return form.value?.validate() ?? false
}

function handleCancel () {
  if (listeners.cancel) {
    emit('cancel')
  } else {
    open.value = false
  }
}

function handleSave () {
  if (validate()) {
    emit('save')
  }
}

defineExpose({ validate })
</script>

<template>
  <v-list dense>
    <v-subheader>{{ $t('app.general.label.printers') }}</v-subheader>

    <template v-for="(instance, index) in instances">
      <v-list-item
        :key="index"
        class="instance-item"
        :class="{ 'v-item--active v-list-item--active': instance.active }"
        @click.stop="activateInstance(instance)"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ instance.name }}<br>
            <small>{{ instance.apiUrl }}</small>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="!instance.active">
          <app-btn
            icon
            @click.stop="removeInstance(instance)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </v-list-item-action>
      </v-list-item>
    </template>

    <v-list-item @click="addInstanceDialog()">
      <v-list-item-icon>
        <v-icon>$plus</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          {{ $t('app.general.btn.add_printer') }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <add-instance-dialog
      v-if="instanceDialogOpen"
      v-model="instanceDialogOpen"
      @resolve="activateInstance"
    />

    <v-divider />
  </v-list>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue'
import type { InstanceConfig } from '@/store/config/types'
import { appInit } from '@/init'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'

const { typedState, typedGetters, typedDispatch } = useStore()
const { appReady } = useStateMixin()
const confirm = useConfirm()
const { t, tc } = useI18n()
const vm = getCurrentInstance()

const emit = defineEmits<{ (e: 'click'): void }>()

const instanceDialogOpen = ref(false)

const instances = computed<InstanceConfig[]>(() => typedGetters['config/getInstances'])

watch(appReady, (value) => {
  if (value && typedState.config.apiUrl === '') {
    instanceDialogOpen.value = true
  }
})

async function removeInstance (instance: InstanceConfig) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_printer', { name: instance.name }).toString(),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )
  if (result) {
    typedDispatch('config/removeInstance', instance)
  }
}

function addInstanceDialog () {
  instanceDialogOpen.value = true
}

async function activateInstance (instance: InstanceConfig) {
  emit('click')
  if (!instance.active) {
    vm?.proxy?.$socket.close()
    const config = await appInit(instance, typedState.config.hostConfig)
    if (config.apiConfig.socketUrl && config.apiConnected && config.apiAuthenticated) {
      vm?.proxy?.$socket.connect(config.apiConfig.socketUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
  :deep(.v-list-item__action) {
    margin: 6px -6px 6px 0;
  }
  :deep(.v-list-item--active::before) {
    opacity: 0.08;
  }
</style>

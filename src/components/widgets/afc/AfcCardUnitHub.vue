<template>
  <div class="ml-3">
    <v-tooltip top>
      <template #activator="{ on, attr }">
        <span
          v-bind="attr"
          class="sensor-status rounded-circle d-inline-block mr-2"
          :class="sensorClass"
          v-on="on"
        />
      </template>
      <span>
        {{ sensorOutput }}
      </span>
    </v-tooltip>
    <span class="text-body-1">
      {{ $t('app.afc.Hub') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useI18n } from '@/composables/useI18n'
import { Filters } from '@/plugins/filters'

const props = defineProps<{
  name: string
}>()

const { getAfcHubObject } = useAfcMixin()
const { t } = useI18n()

const hub = computed(() => getAfcHubObject(props.name))

const sensorStatus = computed(() => hub.value?.state === true)

const sensorOutput = computed(() => {
  const status = sensorStatus.value ? t('app.afc.Detected') : t('app.afc.Empty')
  return `${Filters.prettyCase(props.name)} ${t('app.afc.HubLoad')} - ${status}`
})

const sensorClass = computed(() => ({
  success: sensorStatus.value,
  error: !sensorStatus.value,
}))
</script>

<style scoped>
.sensor-status {
  width: 10px;
  height: 10px;
}
</style>

<template>
  <app-dialog
    v-model="open"
    :title="$t('app.system_info.label.mcu_information', { mcu: mcu.prettyName })"
    max-width="500"
    no-actions
  >
    <v-card-text class="pa-0">
      <v-card flat>
        <v-card-title>{{ $t('app.system_info.label.constants') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr
              v-for="(mcuValue, key) in mcu.mcu_constants"
              :key="key"
            >
              <th>{{ key }}</th>
              <td>{{ mcuValue }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>

      <v-card flat>
        <v-card-title>{{ $t('app.system_info.label.last_stats') }}</v-card-title>

        <v-simple-table dense>
          <tbody>
            <tr
              v-for="(mcuValue, key) in mcu.last_stats"
              :key="key"
            >
              <th>{{ key }}</th>
              <td>{{ mcuValue }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MCU } from '@/store/printer/types'

const props = defineProps<{
  value?: boolean
  mcu: MCU
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const open = computed({
  get: () => props.value ?? false,
  set: (value: boolean) => emit('input', value)
})
</script>

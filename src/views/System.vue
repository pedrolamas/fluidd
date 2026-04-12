<template>
  <v-row :dense="$vuetify.breakpoint.smAndDown">
    <v-col
      cols="12"
      md="6"
    >
      <system-overview-card class="mb-2 mb-md-4" />

      <sd-info-card class="mb-2 mb-md-4" />

      <disk-usage-card class="mb-2 mb-md-4" />

      <moonraker-database-card />
    </v-col>

    <v-col
      cols="12"
      md="6"
    >
      <system-usage-card class="mb-2 mb-md-4" />

      <template v-for="mcu in mcus">
        <mcu-card
          :key="mcu.key"
          :mcu="mcu"
          class="mb-2 mb-md-4"
        />
      </template>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SystemOverviewCard from '@/components/widgets/system/SystemOverviewCard.vue'
import McuCard from '@/components/widgets/system/McuCard.vue'
import SystemUsageCard from '@/components/widgets/system/SystemUsageCard.vue'
import DiskUsageCard from '@/components/widgets/system/DiskUsageCard.vue'
import SdInfoCard from '@/components/widgets/system/SdInfoCard.vue'
import MoonrakerDatabaseCard from '@/components/widgets/system/MoonrakerDatabaseCard.vue'
import type { MCU } from '@/store/printer/types'
import { useStore } from '@/composables/useStore'

const { typedGetters } = useStore()

const mcus = computed<MCU[]>(() => typedGetters['printer/getMcus'])
</script>

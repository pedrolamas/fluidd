<template>
  <collapsable-card
    :title="$t('app.afc.Headline')"
    icon="$afcIcon"
    draggable
    layout-path="dashboard.afc-card"
  >
    <template #menu>
      <afc-card-buttons />
      <afc-card-settings />
    </template>
    <v-card-text class="pt-1">
      <afc-card-message />
      <afc-card-bypass />
      <afc-card-extruder
        v-for="extruder in filteredExtruders"
        :key="extruder"
        :name="extruder"
        class="mt-3"
      />
      <afc-card-unit
        v-for="unit in filteredUnits"
        :key="unit"
        :name="unit"
        class="mt-3"
      />
    </v-card-text>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import AfcCardMessage from '@/components/widgets/afc/AfcCardMessage.vue'
import AfcCardBypass from '@/components/widgets/afc/AfcCardBypass.vue'
import AfcCardExtruder from '@/components/widgets/afc/AfcCardExtruder.vue'
import AfcCardUnit from '@/components/widgets/afc/AfcCardUnit.vue'
import AfcCardButtons from '@/components/widgets/afc/AfcCardButtons.vue'
import AfcCardSettings from '@/components/widgets/afc/AfcCardSettings.vue'

const { afcExtruders, afcHiddenExtruders, afcUnits, afcHiddenUnits } = useAfcMixin()

const filteredExtruders = computed(() =>
  afcExtruders.value.filter(extruder => !afcHiddenExtruders.value.includes(extruder))
)

const filteredUnits = computed(() =>
  afcUnits.value.filter(unit => !afcHiddenUnits.value.includes(unit))
)
</script>

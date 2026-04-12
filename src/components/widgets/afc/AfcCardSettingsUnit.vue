<template>
  <v-list-item @click="showUnit = !showUnit">
    <v-list-item-action class="my-0">
      <v-checkbox :input-value="showUnit" />
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ $t('app.afc.ShowUnit', { name: $filters.prettyCase(unitName) }) }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'

const props = defineProps<{
  name: string
}>()

const { afcHiddenUnits } = useAfcMixin()
const { typedDispatch } = useStore()

const unitName = computed(() => props.name.substring(props.name.indexOf(' ') + 1))

const showUnit = computed({
  get: () => !afcHiddenUnits.value.includes(props.name),
  set: (value: boolean) => {
    const values = new Set(afcHiddenUnits.value)
    if (value) {
      values.delete(props.name)
    } else {
      values.add(props.name)
    }
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.afc.hiddenUnits',
      value: [...values],
      server: true
    })
  }
})
</script>

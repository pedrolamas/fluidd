<template>
  <v-list-item @click="showExtruder = !showExtruder">
    <v-list-item-action class="my-0">
      <v-checkbox :input-value="showExtruder" />
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        {{ $t('app.afc.ShowTool', { name: $filters.prettyCase(name) }) }}
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

const { afcHiddenExtruders } = useAfcMixin()
const { typedDispatch } = useStore()

const showExtruder = computed({
  get: () => !afcHiddenExtruders.value.includes(props.name),
  set: (value: boolean) => {
    const values = new Set(afcHiddenExtruders.value)
    if (value) {
      values.delete(props.name)
    } else {
      values.add(props.name)
    }
    typedDispatch('config/saveByPath', {
      path: 'uiSettings.afc.hiddenExtruders',
      value: [...values],
      server: true
    })
  }
})
</script>

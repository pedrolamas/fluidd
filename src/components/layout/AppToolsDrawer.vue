<template>
  <v-navigation-drawer
    v-model="open"
    app
    right
    clipped
    temporary
    width="300"
    dense
  >
    <v-list
      v-if="socketConnected && authenticated"
      dense
    >
      <v-subheader>{{ instanceName }}</v-subheader>
      <v-divider />
      <system-commands @click="open = false" />
    </v-list>

    <system-printers @click="open = false" />

    <system-layout
      v-if="socketConnected && authenticated"
      @click="open = false"
    />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useStore } from '@/composables/useStore'

const props = defineProps<{
  value?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v ?? false)
})

const { socketConnected, authenticated } = useStateMixin()
const { typedState } = useStore()

const instanceName = computed((): string =>
  typedState.config.uiSettings.general.instanceName
)
</script>

<template>
  <v-row class="flex-grow-0">
    <v-col class="px-6 pt-6 pb-3 py-4">
      <v-btn
        dense
        small
        class="fill-width elevation-0"
        @click="showDialog = true"
      >
        {{ $filters.prettyCase(name) }} > {{ mappedTool }}
      </v-btn>
      <afc-unit-lane-mapping-tool-dialog
        v-model="showDialog"
        :name="name"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAfcMixin } from '@/composables/useAfcMixin'
import AfcUnitLaneMappingToolDialog from '@/components/widgets/afc/dialogs/AfcUnitLaneMappingToolDialog.vue'

const props = defineProps<{
  name: string
}>()

const { getAfcLaneObject } = useAfcMixin()

const showDialog = ref(false)

const lane = computed((): Klipper.AfcLaneState | undefined => getAfcLaneObject(props.name))

const mappedTool = computed(() => lane.value?.map ?? '--')
</script>

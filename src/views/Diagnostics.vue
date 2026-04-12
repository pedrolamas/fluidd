<template>
  <div>
    <v-row>
      <v-col cols="12">
        <collapsable-card
          :title="$t('app.general.title.diagnostics')"
          icon="$chart"
        >
          <template #menu>
            <app-btn-collapse-group>
              <app-btn
                small
                @click="handleAddCard"
              >
                <v-icon
                  small
                  left
                >
                  $plus
                </v-icon>
                {{ $t('app.general.title.add_chart') }}
              </app-btn>
            </app-btn-collapse-group>
          </template>
        </collapsable-card>
      </v-col>
    </v-row>

    <v-row :dense="$vuetify.breakpoint.smAndDown">
      <template v-for="(container, containerIndex) in containers">
        <v-col
          v-if="inLayout || hasCards(container)"
          :key="`container${containerIndex}`"
          cols="12"
          md="6"
          :lg="columnSpan"
          :class="{ 'drag': inLayout }"
        >
          <app-draggable
            v-model="containers[containerIndex]"
            class="list-group"
            :options="{
              group: 'diagnostics',
              disabled: !inLayout,
            }"
            @end.stop="updateLayout"
          >
            <template v-for="c in container">
              <diagnostics-card
                v-if="c.enabled || inLayout"
                :key="c.id"
                :config="c"
                class="mb-2 mb-md-4"
                @edit="handleEditCard"
              />
            </template>
          </app-draggable>
        </v-col>
      </template>
    </v-row>

    <diagnostics-card-config-dialog
      v-if="dialogState.active"
      v-model="dialogState.active"
      :config="dialogState.card"
      @save="handleSaveCard"
      @delete="handleDeleteCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { DiagnosticsCardConfig, DiagnosticsCardContainer } from '@/store/diagnostics/types'
import DiagnosticsCard from '@/components/widgets/diagnostics/DiagnosticsCard.vue'
import DiagnosticsCardConfigDialog from '@/components/widgets/diagnostics/DiagnosticsCardConfigDialog.vue'
import type { LayoutConfig } from '@/store/layout/types'
import { defaultState } from '@/store/layout/state'
import { useStore } from '@/composables/useStore'

const { typedState, typedGetters, typedDispatch } = useStore()

const dialogState = ref<{ active: boolean, card: DiagnosticsCardConfig | null }>({
  active: false,
  card: null
})

const containers = ref<Array<DiagnosticsCardConfig[]>>([])

const inLayout = computed<boolean>(() => typedState.config.layoutMode)

const layout = computed<DiagnosticsCardContainer>(() =>
  typedGetters['layout/getLayout']('diagnostics') as DiagnosticsCardContainer
)

const columnCount = computed(() => {
  if (inLayout.value) return 4
  return containers.value.reduce((count, container) => +hasCards(container) + count, 0)
})

const columnSpan = computed(() => 12 / columnCount.value)

function handleAddCard () {
  const clonedDefaultCard = JSON.parse(JSON.stringify(defaultState().layouts.diagnostics.container1[0])) as DiagnosticsCardConfig
  clonedDefaultCard.id = ''
  dialogState.value.card = clonedDefaultCard
  dialogState.value.active = true
}

function handleEditCard (card: DiagnosticsCardConfig) {
  dialogState.value.card = JSON.parse(JSON.stringify(card)) as DiagnosticsCardConfig
  dialogState.value.active = true
}

function handleDeleteCard (id: string) {
  for (const container of Object.values(layout.value)) {
    const index = container.findIndex(card => card.id === id)
    if (index > -1) {
      container.splice(index, 1)
      break
    }
  }

  updateLayout()
}

function handleSaveCard (card: DiagnosticsCardConfig) {
  if (card.id === '') {
    card.id = uuidv4()
    layout.value.container1.push(card)
  } else {
    for (const container of Object.values(layout.value)) {
      const index = container.findIndex(existingCard => existingCard.id === card.id)
      if (index > -1) {
        container[index] = card
        break
      }
    }
  }

  updateLayout()
}

function onLayoutChange () {
  const newContainers = Object.values(layout.value)

  while (newContainers.length < 4) {
    newContainers.push([])
  }

  containers.value = newContainers.slice(0, 4)
}

function updateLayout () {
  typedDispatch('layout/onLayoutChange', {
    name: 'diagnostics',
    value: {
      container1: containers.value[0],
      container2: containers.value[1],
      container3: containers.value[2],
      container4: containers.value[3]
    }
  })
}

function hasCards (container: LayoutConfig[]) {
  return container.some(card => card.enabled)
}

watch(layout, onLayoutChange, { deep: true })

onMounted(() => {
  onLayoutChange()
})
</script>

<style lang="scss" scoped>
@import '@/scss/draggable.scss';
</style>

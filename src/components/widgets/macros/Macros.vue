<template>
  <div>
    <v-expansion-panels
      v-model="expanded"
      accordion
      multiple
    >
      <v-expansion-panel
        v-for="category in macros"
        :key="`category-${category.id}`"
      >
        <v-expansion-panel-header>
          <template #actions>
            <v-icon
              dense
              class="mr-1"
            >
              $expand
            </v-icon>
          </template>
          <div>
            {{ category.name ?? $t('app.general.label.uncategorized') }}
            <v-chip
              small
              class="ml-2"
            >
              {{ category.macros.length }}
            </v-chip>
            <app-btn
              icon
              class="ml-1"
              @click.prevent.stop="handleEditCategory(category?.id ?? '0')"
            >
              <v-icon small>
                $cog
              </v-icon>
            </app-btn>
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-tooltip
            v-for="macro in category.macros"
            :key="`category-${macro.name}`"
            top
            :disabled="!macro.description"
          >
            <template #activator="{ on, attrs }">
              <macro-btn
                v-bind="attrs"
                :macro="macro"
                :loading="hasWait(`${$waits.onMacro}${macro.name}`)"
                class="me-2 mb-2 d-inline-block"
                v-on="on"
                @click="sendGcode($event, `${$waits.onMacro}${macro.name}`)"
              >
                {{ macro.alias || macro.name }}
              </macro-btn>
            </template>
            <span>{{ macro.description }}</span>
          </v-tooltip>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router/composables'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import MacroBtn from './MacroBtn.vue'

const { typedState, typedGetters, typedDispatch } = useStore()
const { sendGcode, hasWait } = useStateMixin()
const router = useRouter()

const macros = computed(() => typedGetters['macros/getVisibleMacros'])

const expanded = computed({
  get: () => {
    let exp: number[] = typedState.macros.expanded
    exp = exp.filter(i => i <= macros.value.length)
    return exp
  },
  set: (val: number[]) => typedDispatch('macros/saveExpanded', val)
})

function handleEditCategory (categoryId: string) {
  router.push({ name: 'macro_category_settings', params: { categoryId } })
}
</script>

<style lang="scss" scoped>
  :deep(.v-expansion-panel::before) {
    box-shadow: none;
  }
</style>

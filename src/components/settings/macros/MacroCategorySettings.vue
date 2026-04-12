<template>
  <div>
    <v-subheader class="px-0">
      <app-btn
        fab
        small
        class="mr-4"
        @click="handleBack"
      >
        <v-icon dense>
          $left
        </v-icon>
      </app-btn>

      {{ category.name }} {{ $t('app.setting.title.macros') }}

      <v-spacer />

      <v-text-field
        v-model="search"
        clearable
        outlined
        dense
        single-line
        hide-details
        spellcheck="false"
        append-icon="$magnify"
        @focus="$event.target.select()"
      />
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          @click="handleAllOff"
        >
          {{ $t('app.setting.label.all_off') }}
        </app-btn>

        <app-btn
          outlined
          small
          color="primary"
          class="ml-2"
          @click="handleAllOn"
        >
          {{ $t('app.setting.label.all_on') }}
        </app-btn>
      </app-setting>

      <app-draggable
        v-model="macros"
        :options="{
          group: `macro-settings-${category.name}`,
        }"
      >
        <section
          v-for="macro in macros"
          :key="macro.name"
        >
          <v-divider />

          <app-setting
            :accent-color="macro.color"
            :r-cols="2"
            @click="handleSettingsDialog(macro)"
          >
            <template #title>
              <app-drag-icon class="me-1" />
              {{ macro.name.toUpperCase() }}
            </template>

            <template
              v-if="macro.description"
              #sub-title
            >
              <span class="ml-1 mr-2">
                {{ macro.description }}
              </span>
            </template>

            <v-switch
              class="mt-0 pt-0"
              :input-value="macro.visible"
              color="primary"
              hide-details
              @click.stop
              @change="handleMacroVisible(macro, $event)"
            />
          </app-setting>
        </section>
      </app-draggable>
    </v-card>

    <macro-settings-dialog
      v-if="dialogState.open"
      v-model="dialogState.open"
      :macro="dialogState.macro"
    />
  </div>
</template>

<script lang="ts">
// beforeRouteEnter must be in an Options API block because <script setup> macros
// like defineOptions are hoisted and cannot reference setup-scoped variables.
import type { NavigationGuardNext, Route, Location } from 'vue-router'
import type { MacroCategory } from '@/store/macros/types'
import store from '@/store'

function routeGuard (to: Route): Parameters<NavigationGuardNext>[0] {
  const id = to.params.categoryId
  const categories: MacroCategory[] = store.getters['macros/getCategories']
  const i = categories.findIndex(c => c.id === id)
  if (id !== '0' && i === -1) {
    return { name: 'settings', hash: '#macros' } satisfies Location
  }
}

export default {
  beforeRouteEnter (to: Route, _from: Route, next: NavigationGuardNext) {
    next(routeGuard(to))
  }
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MacroSettingsDialog from './MacroSettingsDialog.vue'
import type { Macro, MacroCategory } from '@/store/macros/types'
import type { Route } from 'vue-router'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router/composables'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { typedGetters, typedDispatch } = useStore()
const { tc } = useI18n()

const search = ref('')
const categoryId = ref<string | undefined>(route.params.categoryId)

const dialogState = ref<any>({
  open: false,
  macro: null
})

onBeforeRouteUpdate((to, _from, next) => {
  next(routeGuard(to as Route))
})

const categories = computed((): MacroCategory[] => typedGetters['macros/getCategories'])

const macrosForCategory = computed((): Macro[] => typedGetters['macros/getMacrosByCategory'](categoryId.value))

const macros = computed({
  get: () => {
    if (!search.value) {
      return macrosForCategory.value
    }

    const searchLower = search.value.toLowerCase()

    return macrosForCategory.value
      .filter(macro => macro.name.toLowerCase().includes(searchLower))
  },
  set: (macros: Macro[]) => {
    typedDispatch('macros/saveAllOrder', macros)
  }
})

const category = computed(() => {
  const cat = categoryId.value !== '0' && categories.value.find(c => c.id === categoryId.value)

  return cat || {
    id: '0', name: tc('app.general.label.uncategorized')
  }
})

function handleBack () {
  router.go(-1)
}

function handleSettingsDialog (macro: Macro) {
  dialogState.value = {
    open: true,
    macro: { ...macro }
  }
}

function handleAllOn () {
  typedDispatch('macros/saveAllOn', macros.value)
}

function handleAllOff () {
  typedDispatch('macros/saveAllOff', macros.value)
}

function handleMacroVisible (macro: Macro, value: boolean) {
  const newMacro = {
    ...macro, visible: value
  }
  typedDispatch('macros/saveMacro', newMacro)
}
</script>

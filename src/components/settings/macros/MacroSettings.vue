<template>
  <div>
    <v-subheader id="macros">
      {{ t('app.setting.title.macros') }}
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
          @click="handleAddCategoryDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ t('app.setting.btn.add_category') }}
        </app-btn>
      </app-setting>

      <app-draggable
        v-model="categories"
        :options="{
          group: `macro-settings`,
        }"
      >
        <section
          v-for="category in categories"
          :key="`category-${category.name}`"
        >
          <v-divider />

          <app-setting
            :r-cols="3"
            @click="handleCategoryClick(category)"
          >
            <template #title>
              <app-drag-icon class="me-1" />
              {{ category.name }}
              <v-chip
                small
                class="ms-1 me-4"
              >
                {{ category.visible }} / {{ category.count }}
              </v-chip>
            </template>

            <app-btn
              icon
              @click.stop="handleEditCategoryDialog(category)"
            >
              <v-icon dense>
                $edit
              </v-icon>
            </app-btn>

            <app-btn
              icon
              @click.stop="handleRemoveCategory(category)"
            >
              <v-icon dense>
                $delete
              </v-icon>
            </app-btn>
          </app-setting>
        </section>
      </app-draggable>

      <template v-if="uncategorizedMacros.count > 0">
        <v-divider />

        <!-- Add the uncategorized macros.. -->
        <app-setting
          :key="`category-uncategorized`"
          :r-cols="3"
          @click="handleCategoryClick()"
        >
          <template #title>
            {{ t('app.general.label.uncategorized') }}
            <v-chip
              small
              class="ms-1"
            >
              {{ uncategorizedMacros.visible }} / {{ uncategorizedMacros.count }}
            </v-chip>
          </template>
          <v-icon
            dense
            class="pa-1"
          >
            $chevronRight
          </v-icon>
        </app-setting>
      </template>

      <macro-category-dialog
        v-if="categoryDialogState.open"
        v-model="categoryDialogState.open"
        :title="categoryDialogState.title"
        :label="categoryDialogState.label"
        :name="categoryDialogState.name"
        @save="categoryDialogState.handler"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router/composables'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useConfirm } from '@/composables/useConfirm'
import MacroCategoryDialog from './MacroCategoryDialog.vue'
import type { Macro, MacroCategory } from '@/store/macros/types'

const { typedGetters, typedDispatch } = useStore()
const { t, tc } = useI18n()
const confirm = useConfirm()
const router = useRouter()

const categoryDialogState = reactive<{
  open: boolean
  title: string
  label: string
  category: MacroCategory | null
  name: string
  handler: (name: string) => void
}>({
      open: false,
      title: 'add',
      label: '',
      category: null,
      name: '',
      handler: handleAddCategory
    })

const categories = computed({
  get: (): MacroCategory[] => typedGetters['macros/getCategories'],
  set: (value: MacroCategory[]) => {
    const mapped = value.map(({ id, name }) => ({ id, name }))
    typedDispatch('macros/updateCategories', mapped)
  }
})

const uncategorizedMacros = computed(() => {
  const uncategorized: Macro[] = typedGetters['macros/getMacrosByCategory']()
  const count = uncategorized.length
  const visible = uncategorized.filter(macro => macro.visible).length
  return { count, visible }
})

function handleAddCategoryDialog () {
  categoryDialogState.open = true
  categoryDialogState.title = t('app.general.label.add_category')
  categoryDialogState.label = t('app.general.label.name')
  categoryDialogState.category = null
  categoryDialogState.name = ''
  categoryDialogState.handler = handleAddCategory
}

function handleEditCategoryDialog (category: MacroCategory) {
  categoryDialogState.open = true
  categoryDialogState.title = t('app.general.label.edit_category')
  categoryDialogState.label = t('app.general.label.name')
  categoryDialogState.category = category
  categoryDialogState.name = category.name
  categoryDialogState.handler = handleEditCategory
}

async function handleRemoveCategory (category: MacroCategory) {
  const result = await confirm(
    t('app.general.simple_form.msg.confirm_remove_macro_category', { name: category.name }),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    typedDispatch('macros/removeCategory', category)
  }
}

function handleAddCategory (category: string) {
  typedDispatch('macros/addCategory', category)
}

function handleEditCategory (name: string) {
  const category = {
    ...categoryDialogState.category as MacroCategory,
    name
  }
  typedDispatch('macros/editCategory', category)
}

function handleCategoryClick (category?: MacroCategory) {
  const categoryId = category?.id ?? '0'
  router.push({
    name: 'macro_category_settings',
    params: {
      categoryId
    }
  })
}
</script>

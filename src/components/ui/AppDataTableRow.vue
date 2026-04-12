<template>
  <tr
    v-bind="$attrs"
    :class="{
      'v-data-table__selected': isSelected
    }"
    v-on="$listeners"
  >
    <template v-for="{ header, value } in items">
      <td
        :key="header.value"
        :class="[
          `text-${header.align || 'start'}`,
          header.cellClass,
          {
            'v-data-table__divider': header.divider
          }
        ]"
      >
        <slot
          :name="`item.${header.value}`"
          :header="header"
          :value="value"
        >
          <template v-if="isEmpty(value)">
            --
          </template>
          <template v-else-if="Array.isArray(value) && value.length > 0">
            <slot
              :name="`item-value.${header.value}`"
              :header="header"
              :value="value"
            >
              <v-chip
                v-for="(arrayItem, index) in value"
                :key="index"
                :class="{
                  'ms-1': index > 0
                }"
                small
              >
                {{ isEmpty(arrayItem) ? '--' : arrayItem }}
              </v-chip>
            </slot>
          </template>
          <template v-else>
            <slot
              :name="`item-value.${header.value}`"
              :header="header"
              :value="value"
            >
              {{ value }}
            </slot>
          </template>
        </slot>
      </td>
    </template>
  </tr>
</template>

<script lang="ts">
import { get } from 'lodash-es'
import type { DataTableHeader } from 'vuetify'

// Use `any` for item and return type so callers can pass narrowly-typed getters
// and slot consumers can use the value freely — matches pre-migration @Prop({ type: Function }) behavior.
const defaultGetter = (item: any, header: DataTableHeader<any>): any => get(item, header.value)

export type DefaultGetterFunction = typeof defaultGetter
export type GetterFunction = (item: any, header: DataTableHeader<any>, defaultGetter: DefaultGetterFunction) => any
</script>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  headers: DataTableHeader[]
  item: unknown
  isSelected?: boolean
  customGetter?: GetterFunction
}>()

function isEmpty (value: unknown) {
  return (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

const items = computed(() => {
  const getter = props.customGetter ?? defaultGetter
  return props.headers.map(header => ({
    header,
    value: getter(props.item, header, defaultGetter)
  }))
})
</script>

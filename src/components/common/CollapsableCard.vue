<template>
  <v-card
    :class="_cardClasses"
    :rounded="rounded"
    :loading="isLoading"
    :color="color"
  >
    <v-card-title
      class="collapsable-card-title card-heading"
      :class="{ 'draggable': inLayout }"
    >
      <v-row
        no-gutters
        class="flex-nowrap"
      >
        <v-col
          align-self="center"
          class="text-no-wrap"
        >
          <slot
            name="title"
            :in-layout="inLayout"
          >
            <v-icon left>
              {{ icon }}
            </v-icon>
            <span class="font-weight-light">{{ title }}</span>
            <app-inline-help
              v-if="!inLayout && helpTooltip"
              bottom
              small
              :tooltip="helpTooltip"
            />
          </slot>
        </v-col>

        <v-col
          v-if="!inLayout"
          cols="auto"
          align-self="center"
        >
          <slot name="menu" />
        </v-col>

        <v-col
          cols="auto"
          align-self="center"
        >
          <!-- Collapse Control -->
          <slot name="collapse-button">
            <app-btn-collapse
              v-if="_collapsable || inLayout"
              :collapsed.sync="isCollapsed"
              :enabled.sync="isEnabled"
              :in-layout="inLayout"
            />
          </slot>
        </v-col>
      </v-row>
    </v-card-title>

    <v-expand-transition>
      <div v-show="isCollapsed && !inLayout">
        <slot name="collapsed-content" />
      </div>
    </v-expand-transition>

    <v-expand-transition v-if="!lazy">
      <div
        v-if="!isCollapsed && !inLayout"
        id="card-content"
        :class="_contentClasses"
        :style="_contentStyles"
      >
        <template v-if="subTitle || $slots['sub-title']">
          <v-card-subtitle class="py-2">
            <slot name="sub-title">
              <span v-safe-html="subTitle" />
            </slot>
          </v-card-subtitle>

          <v-divider />
        </template>

        <slot />
      </div>
    </v-expand-transition>

    <v-expand-transition v-else>
      <div
        v-show="!isCollapsed && !inLayout"
        id="card-content"
        :class="_contentClasses"
        :style="_contentStyles"
      >
        <template v-if="subTitle || $slots['sub-title']">
          <v-card-subtitle class="py-2">
            <slot name="sub-title">
              <span v-safe-html="subTitle" />
            </slot>
          </v-card-subtitle>

          <v-divider />
        </template>

        <slot />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, useSlots, onMounted } from 'vue'
import type { LayoutConfig } from '@/store/layout/types'
import { useStore } from '@/composables/useStore'

const { typedState, typedGetters, typedDispatch } = useStore()
const slots = useSlots()

const props = withDefaults(defineProps<{
  title: string
  icon: string
  helpTooltip?: string
  color?: string
  subTitle?: string
  layoutPath?: string
  lazy?: boolean
  loading?: boolean
  draggable?: boolean
  collapsable?: boolean
  rounded?: string
  height?: number | string
  menuBreakpoint?: string
  cardClasses?: string
  contentClasses?: string
}>(), {
  lazy: true,
  collapsable: true,
  rounded: 'md',
  menuBreakpoint: 'lg'
})

const emit = defineEmits<{
  (e: 'collapsed', val: boolean): void
}>()

const baseCardClasses = ref({ 'collapsable-card': true })
const baseContentClasses = ref({ 'overflow-hidden': true })

const hasDefaultSlot = computed(() => !!slots.default)
const hasCollapsedContentSlot = computed(() => !!slots['collapse-button'] || !!slots['collapsed-content']?.()?.length)

const _layoutPath = computed(() => {
  if (props.layoutPath) {
    if (props.layoutPath.includes('.')) {
      const split = props.layoutPath.split('.')
      let name = split[0]
      if (name === 'dashboard') name = typedGetters['layout/getSpecificLayoutName']
      return { name, id: split[1] }
    } else {
      throw new Error('invalid layout path')
    }
  }
  return undefined
})

const layout = computed<LayoutConfig | undefined>(() => {
  if (_layoutPath.value) {
    return typedGetters['layout/getConfig'](_layoutPath.value.name, _layoutPath.value.id)
  }
  return undefined
})

const isLoading = computed<boolean | string>(() => props.loading ? 'primary' : false)

const isCollapsed = computed({
  get: (): boolean => {
    if (!props.collapsable) return false
    return layout.value ? layout.value.collapsed : false
  },
  set: (collapsed: boolean) => {
    const value = layout.value
    if (value && _layoutPath.value) {
      value.collapsed = collapsed
      typedDispatch('layout/onUpdateConfig', { name: _layoutPath.value.name, value })
    }
  }
})

const isEnabled = computed({
  get: (): boolean => layout.value ? layout.value.enabled : true,
  set: (enabled: boolean) => {
    const value = layout.value
    if (value && _layoutPath.value) {
      value.enabled = enabled
      typedDispatch('layout/onUpdateConfig', { name: _layoutPath.value.name, value })
    }
  }
})

const inLayout = computed(() => typedState.config.layoutMode && !!props.draggable)
const _collapsable = computed(() => props.collapsable ? !!layout.value : false)

const _cardClasses = computed(() => {
  const classes: Record<string, unknown> = {}
  if (props.cardClasses) {
    props.cardClasses.split(' ').forEach(s => { classes[s] = true })
  }
  return {
    ...classes,
    ...baseCardClasses.value,
    collapsed: (isCollapsed.value || !hasDefaultSlot.value || inLayout.value) && !hasCollapsedContentSlot.value
  }
})

const _contentClasses = computed(() => {
  const classes: Record<string, unknown> = {}
  if (props.contentClasses) {
    props.contentClasses.split(' ').forEach(s => { classes[s] = true })
  }
  return { ...classes, ...baseContentClasses.value }
})

const _contentStyles = computed(() =>
  props.height ? `height: calc(${props.height}px - 49px);` : ''
)

watch(isCollapsed, (val) => emit('collapsed', val))
onMounted(() => emit('collapsed', isCollapsed.value))
</script>

<style lang="scss" scoped>
.v-card.collapsed > .card-heading {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
</style>

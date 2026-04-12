<template>
  <v-row
    no-gutters
    :class="{
      'sc-link': hasClick
    }"
    class="app-setting-control"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      v-if="accentColor"
      :style="{
        'background-color': accentColor
      }"
      class="sc-color"
    />

    <v-col
      cols="12"
      :sm="cols[0]"
      class="sc-label text-body-1 pr-0 pr-sm-3 pb-0 pb-sm-3"
      align-self="center"
    >
      <slot name="title">
        {{ title }}
      </slot>
      <div
        v-if="hasSubTitle"
        class="text-body-2 secondary--text"
      >
        <slot name="sub-title">
          {{ subTitle }}
        </slot>
      </div>
    </v-col>

    <v-col
      cols="12"
      :sm="cols[1]"
      class="sc-content py-3"
      align-self="center"
    >
      <slot />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, useSlots, useListeners } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  title?: string
  subTitle?: string
  help?: string
  accentColor?: string
  rCols?: number
}>(), {
  title: '',
  rCols: 6
})

const slots = useSlots()
const listeners = useListeners()

const cols = computed(() => [12 - props.rCols, props.rCols])
const hasClick = computed(() => !!listeners.click)
const hasSubTitle = computed(() => !!(slots['sub-title'] || props.subTitle))
</script>

<style lang="scss" scoped>
  .app-setting-control {
    display: flex;
    flex: 1 1 100%;
    min-height: 48px;
    outline: none;
    padding: 0 16px;
    position: relative;
    text-decoration: none;

    &.sc-link {
      cursor: pointer;
      user-select: none;
    }

    &.sc-link:hover::before {
      opacity: 0.08;
    }

    &.sc-link::before {
      background-color: currentColor;
      bottom: 0;
      content: "";
      left: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    }

    .sc-accent {
      display: block;
      position: absolute;
      left: 0;
      width: 3px;
      height: 100%;
    }

    .sc-label {
      padding: 12px 0;
    }

    .sc-content {
      display: inline-flex;
      align-self: center;
      justify-content: flex-end;
      align-items: center;
    }

    .sc-content .v-input {
      margin: 0 !important;
    }
  }
</style>

<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row justify="end">
      <v-col
        cols="6"
        class="text-right"
      >
        <v-text-field
          v-model.number="extrudeLength"
          :disabled="!klippyReady || !activeExtruder"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeLengthRule
          ]"
          type="number"
          hide-details
          outlined
          persistent-placeholder
          dense
          :label="$t('app.general.label.extrude_length')"
          suffix="mm"
          @focus="$event.target.select()"
        />
      </v-col>
      <v-col cols="6">
        <app-btn
          :disabled="!klippyReady || !extruderReady || extruderDisconnected || !valid"
          block
          @click="retract"
        >
          {{ $t('app.general.btn.retract') }}
          <v-icon>$chevronUp</v-icon>
        </app-btn>
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="mt-0"
    >
      <v-col
        cols="6"
        class="text-right"
      >
        <v-text-field
          v-model.number="extrudeSpeed"
          :disabled="!klippyReady || !activeExtruder"
          :rules="[
            Rules.required,
            Rules.numberValid,
            Rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeSpeedRule
          ]"
          type="number"
          hide-details
          outlined
          persistent-placeholder
          dense
          :label="$t('app.general.label.extrude_speed')"
          suffix="mm/s"
          @focus="$event.target.select()"
        />
      </v-col>
      <v-col cols="6">
        <app-btn
          :disabled="!klippyReady || !extruderReady || extruderDisconnected || !valid"
          block
          @click="extrude"
        >
          {{ $t('app.general.btn.extrude') }}
          <v-icon>$chevronDown</v-icon>
        </app-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { Rules } from '@/plugins/filters'
import { Waits } from '@/globals'
import type { VForm } from 'vuetify/lib'

const { typedState, typedDispatch } = useStore()
const { klippyReady, sendExtrudeGcode } = useStateMixin()
const { activeExtruder, extruderReady, extruderDisconnected, maxExtrudeLength, maxExtrudeSpeed } = useToolheadMixin()

const form = ref<VForm>()
const valid = ref(true)

const extrudeSpeed = computed({
  get: () => {
    const value: number = typedState.config.uiSettings.toolhead.extrudeSpeed

    return value === -1
      ? typedState.config.uiSettings.general.defaultExtrudeSpeed
      : value
  },
  set: (value: number) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.toolhead.extrudeSpeed',
    value,
    server: false
  })
})

const extrudeLength = computed({
  get: () => {
    const value: number = typedState.config.uiSettings.toolhead.extrudeLength

    return value === -1
      ? typedState.config.uiSettings.general.defaultExtrudeLength
      : value
  },
  set: (value: number) => typedDispatch('config/saveByPath', {
    path: 'uiSettings.toolhead.extrudeLength',
    value,
    server: false
  })
})

watch(activeExtruder, () => {
  form.value?.validate()
})

function maxExtrudeLengthRule (value: number) {
  return Rules.numberLessThanOrEqual(maxExtrudeLength.value)(value)
}

function maxExtrudeSpeedRule (value: number) {
  return Rules.numberLessThanOrEqual(maxExtrudeSpeed.value)(value)
}

function retract () {
  if (valid.value) {
    sendExtrudeGcode(-extrudeLength.value, extrudeSpeed.value, Waits.onExtrude)
  }
}

function extrude () {
  if (valid.value) {
    sendExtrudeGcode(extrudeLength.value, extrudeSpeed.value, Waits.onExtrude)
  }
}

onMounted(() => {
  form.value?.validate()
})
</script>

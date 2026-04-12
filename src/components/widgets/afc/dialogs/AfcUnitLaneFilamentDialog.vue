<template>
  <app-dialog
    v-model="show"
    :title="$t('app.afc.FilamentForLane', { name: $filters.prettyCase(name) })"
    width="400"
    :save-button-text="$t('app.afc.SetSpool')"
    :save-button-disabled="disableSetBtn"
    @save="setSpool"
  >
    <v-card-text class="pb-0">
      <app-setting
        :title="$t('app.afc.Material')"
        :sub-title="$t('app.afc.MaterialSubtitle')"
      >
        <v-text-field
          v-model="material"
          placeholder="ABS"
          dense
          outlined
          hide-details
        />
      </app-setting>
      <v-divider class="my-3" />
      <app-setting
        :title="$t('app.afc.Weight')"
        :sub-title="$t('app.afc.WeightSubtitle')"
      >
        <v-text-field
          v-model="weight"
          placeholder="1000"
          dense
          outlined
          type="number"
          :min="0"
          :step="1"
          hide-details
        />
      </app-setting>
      <v-divider class="my-3" />
      <v-color-picker
        hide-mode-switch
        mode="hexa"
        :value="color"
        class="mx-auto"
        @update:color="setColor"
      />
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { debounce } from 'lodash-es'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  value: boolean
  name: string
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
}>()

const { sendGcode } = useStateMixin()
const { getAfcLaneObject } = useAfcMixin()

const color = ref('#000000')
const material = ref('')
const weight = ref(0)

const show = computed({
  get: () => props.value,
  set: (value: boolean) => emit('input', value)
})

const lane = computed(() => getAfcLaneObject(props.name))

const currentColor = computed(() => lane.value?.color ?? '#000000')
const currentMaterial = computed(() => lane.value?.material ?? '')
const currentWeight = computed(() => Math.round(lane.value?.weight ?? 0))

const disableSetBtn = computed(() =>
  !material.value || !weight.value || !color.value
)

const setColor = debounce((newColor: { hex: string }) => {
  color.value = newColor.hex
}, 500)

function setSpool () {
  const gcode: string[] = []

  if (color.value !== currentColor.value) {
    const cleanedColor = color.value.substring(1)
    gcode.push(`SET_COLOR LANE=${encodeGcodeParamValue(props.name)} COLOR=${encodeGcodeParamValue(cleanedColor)}`)
  }

  if (material.value !== currentMaterial.value) {
    gcode.push(`SET_MATERIAL LANE=${encodeGcodeParamValue(props.name)} MATERIAL=${encodeGcodeParamValue(material.value)}`)
  }

  if (weight.value !== currentWeight.value) {
    gcode.push(`SET_WEIGHT LANE=${encodeGcodeParamValue(props.name)} WEIGHT=${weight.value}`)
  }

  sendGcode(gcode.join('\n'))

  show.value = false
}

watch(show, (newValue: boolean) => {
  if (!newValue) return
  color.value = currentColor.value
  material.value = currentMaterial.value
  weight.value = currentWeight.value
})
</script>

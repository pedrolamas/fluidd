<template>
  <v-card outlined>
    <v-card-title>{{ $t('app.afc.SettingsDialog.SettingsForTitle', { name: `Hub ${$filters.prettyCase(name)}` }) }}</v-card-title>
    <app-setting
      :title="$t('app.afc.SettingsDialog.BowdenLength')"
      :sub-title="$t('app.afc.SettingsDialog.BowdenLengthDescription')"
    >
      <app-named-text-field
        label="afc_bowden_length"
        :value="currentLength"
        :reset-value="settingsLength"
        type="number"
        suffix="mm"
        submit-on-change
        @submit="setBowdenLength"
      />
    </app-setting>
    <v-card-text />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useAfcMixin } from '@/composables/useAfcMixin'
import { useStore } from '@/composables/useStore'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const props = defineProps<{
  name: string
}>()

const { sendGcode } = useStateMixin()
const { getAfcHubSettings } = useAfcMixin()
const { typedState } = useStore()

const afcSettingsHub = computed((): Klipper.AfcHubSettings | undefined =>
  getAfcHubSettings(props.name)
)

const settingsLength = computed(() => afcSettingsHub.value?.afc_bowden_length || 0)

const hubObject = computed((): Klipper.AfcHubState | undefined =>
  typedState.printer.printer[`AFC_hub ${props.name}`]
)

const currentLength = computed(() => hubObject.value?.afc_bowden_length || 0)

function setBowdenLength (value: number) {
  sendGcode(`SET_BOWDEN_LENGTH HUB=${encodeGcodeParamValue(props.name)} LENGTH=${value}`)
}
</script>

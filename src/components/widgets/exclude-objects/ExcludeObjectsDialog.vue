<template>
  <app-dialog
    v-model="open"
    :title="$t('app.gcode.label.exclude_object')"
    max-width="500"
    no-actions
  >
    <v-card-text>
      <v-simple-table>
        <tbody>
          <tr
            v-for="part in parts"
            :key="part.name"
          >
            <td
              :class="{
                'text--disabled': part.isExcluded,
                'info--text': part.isCurrent
              }"
              class="partName"
            >
              {{ part.name }}
            </td>
            <td class="actions">
              <app-btn
                icon
                :disabled="part.isExcluded"
                @click="cancelObject(part.name)"
              >
                <v-icon
                  dense
                  color="error"
                >
                  $cancelled
                </v-icon>
              </app-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'
import type { ExcludeObjectPart } from '@/store/printer/types'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'

const { typedGetters } = useStore()
const { sendGcode } = useStateMixin()
const confirm = useConfirm()
const { tc } = useI18n()

const props = defineProps<{ value?: boolean }>()
const emit = defineEmits<{ (e: 'input', v: boolean | undefined): void }>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v)
})

const parts = computed<ExcludeObjectPart[]>(() => typedGetters['printer/getExcludeObjectParts'])

async function cancelObject (name: string) {
  const result = await confirm(
    tc('app.general.simple_form.msg.confirm_exclude_object'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )
  if (result) {
    const reqId = name.toUpperCase().replace(/\s/g, '_')
    sendGcode(`EXCLUDE_OBJECT NAME=${encodeGcodeParamValue(reqId)}`)
  }
}
</script>

<style lang="scss" scoped>
  .partName {
    word-break: break-all;
  }

  .actions {
    width: 32px;
  }
</style>

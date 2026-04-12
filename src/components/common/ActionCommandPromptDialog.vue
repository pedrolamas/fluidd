<template>
  <app-dialog
    v-model="open"
    :title="dialog.title"
    max-width="450"
    :no-actions="dialog.footerButtons.length === 0"
  >
    <v-card-text>
      <v-row
        v-for="(item, index) in dialog.items"
        :key="`item-${index}`"
      >
        <v-col v-if="item.type === 'text'">
          {{ item.text }}
        </v-col>
        <v-col v-else-if="item.type === 'button'">
          <v-btn
            :color="item.color"
            block
            @click="handleClick(item)"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <template #actions>
      <v-spacer />

      <app-btn
        v-for="(button, index) in dialog.footerButtons"
        :key="`button-${index}`"
        :color="button.color ?? 'primary'"
        type="button"
        @click="handleClick(button)"
      >
        {{ button.text }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PromptDialog, PromptDialogButton } from '@/store/console/types'
import { useStore } from '@/composables/useStore'
import { useStateMixin } from '@/composables/useStateMixin'

const { typedState } = useStore()
const { sendGcode } = useStateMixin()

const dialog = computed<PromptDialog>(() => typedState.console.promptDialog)

const open = computed({
  get: () => dialog.value.open,
  set: (value: boolean) => {
    if (!value) sendGcode('RESPOND TYPE=command MSG="action:prompt_end"')
  }
})

function handleClick (button: PromptDialogButton) {
  sendGcode(button.command || button.text)
}
</script>

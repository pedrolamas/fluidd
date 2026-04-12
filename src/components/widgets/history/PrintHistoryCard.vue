<template>
  <collapsable-card
    :title="$t('app.general.title.history')"
    icon="$history"
  >
    <job-history />

    <template #menu>
      <app-btn-collapse-group :collapsed="narrow">
        <app-btn
          small
          class="ms-1 my-1"
          @click="handleLoadAll"
        >
          <v-icon
            small
            left
          >
            $download
          </v-icon>
          <span>{{ $t('app.general.btn.load_all') }}</span>
        </app-btn>
        <app-btn
          small
          class="ms-1 my-1"
          @click="handleRemoveAll"
        >
          <v-icon
            small
            left
          >
            $delete
          </v-icon>
          <span>{{ $t('app.general.btn.remove_all') }}</span>
        </app-btn>
      </app-btn-collapse-group>
    </template>
  </collapsable-card>
</template>

<script setup lang="ts">
import JobHistory from '@/components/widgets/history/JobHistory.vue'
import { SocketActions } from '@/api/socketActions'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  narrow?: boolean
}>()

const confirm = useConfirm()
const { tc } = useI18n()

async function handleRemoveAll () {
  const result = await confirm(
    tc('app.history.msg.confirm_jobs'),
    { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
  )

  if (result) {
    SocketActions.serverHistoryDeleteJob('all')
  }
}

function handleLoadAll () {
  SocketActions.serverHistoryList({ limit: 0 })
}
</script>

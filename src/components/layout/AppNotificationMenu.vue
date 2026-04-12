<template>
  <v-menu
    v-model="menu"
    offset-y
    left
    :max-width="(isMobileViewport) ? 220 : 420"
    :close-on-content-click="false"
    :close-delay="300"
  >
    <template #activator="{ on: menuOn, attrs }">
      <v-tooltip bottom>
        <template #activator="{ on: tooltip }">
          <v-badge
            :value="notificationsCounter"
            :content="notificationsCounter"
            offset-x="17"
            offset-y="17"
            bordered
            overlap
            :color="badgeColor"
          >
            <app-btn
              v-bind="attrs"
              icon
              text
              :color="color"
              v-on="{ ...tooltip, ...menuOn }"
            >
              <v-icon :class="{ 'wiggle': color === 'error'}">
                $bell
              </v-icon>
            </app-btn>
          </v-badge>
        </template>
        <span>{{ $t('app.general.tooltip.notifications') }}</span>
      </v-tooltip>
    </template>

    <v-card>
      <v-list
        class="py-0 overflow-y-auto app-notifications"
        style="max-height: 90vh"
      >
        <v-list-item
          v-if="notifications.length === 0"
        >
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.general.label.no_notifications') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <template v-else-if="notifications.length > 0">
          <v-list-item
            :disabled="clearableNotifications.length <= 0"
            @click="handleClearAll"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t('app.general.label.clear_all') }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon class="notification-clear-all">
              <v-icon dense>
                $close
              </v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-divider />
        </template>

        <template
          v-for="(n, i) in notifications"
        >
          <v-list-item
            :key="`notification-${n.id}`"
            three-line
            :class="classes(n)"
          >
            <v-list-item-content>
              <v-list-item-title v-safe-html="n.title" />
              <v-list-item-subtitle
                v-if="n.description"
                v-safe-html="n.description"
                class="notification-description"
              />
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-list-item-subtitle
                    v-bind="attrs"
                    class="notification-timestamp"
                    v-on="on"
                  >
                    {{ $filters.formatRelativeTimeToNow(n.timestamp * 1000) }}
                  </v-list-item-subtitle>
                </template>
                <span>{{ $filters.formatDateTime(n.timestamp * 1000) }}</span>
              </v-tooltip>
              <v-list-item-subtitle v-if="n.to">
                <app-btn
                  v-if="!n.to.startsWith('http')"
                  v-safe-html="n.btnText || $t('app.general.btn.more_information')"
                  x-small
                  :to="n.to"
                  class="mr-1"
                  @click="menu = false"
                />
                <app-btn
                  v-else
                  v-safe-html="n.btnText || $t('app.general.btn.more_information')"
                  x-small
                  :href="n.to"
                  target="_blank"
                  class="mr-1"
                  @click="menu = false"
                />

                <app-announcement-dismiss-menu
                  v-if="n.type === 'announcement'"
                  @dismiss="handleAnnouncementDismiss(n, $event)"
                />
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action
              v-if="n.suffix"
              class="notification-suffix"
            >
              <v-icon
                v-if="n.suffixIcon"
                :color="color"
              >
                {{ n.suffixIcon }}
              </v-icon>
              <div
                v-safe-html="n.suffix"
                class="notification-temp"
              />
            </v-list-item-action>
            <v-list-item-action
              v-if="n.clear"
              class="notification-clear"
              @click="handleClear(n)"
            >
              <app-btn
                icon
                dense
              >
                <v-icon dense>
                  $close
                </v-icon>
              </app-btn>
            </v-list-item-action>
          </v-list-item>

          <v-divider
            v-if="i < notifications.length - 1"
            :key="`divider-${n.id}`"
          />
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import AppAnnouncementDismissMenu from './AppAnnouncementDismissMenu.vue'
import type { AppNotification } from '@/store/notifications/types'
import isSetAppBadgeSupported from '@/util/is-set-app-badge-supported'

const { isMobileViewport } = useBrowserMixin()
const { typedGetters, typedDispatch } = useStore()

const menu = ref(false)

const notifications = computed<AppNotification[]>(() => typedGetters['notifications/getNotifications'])

const notificationsCounter = computed<number>(() => {
  const filtered: AppNotification[] = notifications.value.filter(n => !n.noCount)
  return filtered.length
})

watch(notificationsCounter, (value) => {
  if (isSetAppBadgeSupported(navigator)) {
    navigator.setAppBadge(value)
  }
})

const clearableNotifications = computed<AppNotification[]>(() => {
  const all: AppNotification[] = typedGetters['notifications/getNotifications']
  return all.filter(n => n.clear)
})

const color = computed(() => {
  if (notifications.value.length <= 0) return undefined
  let c: string | undefined
  for (const n of notifications.value) {
    if (n.type === 'warning' && c !== 'error') c = 'warning'
    if (n.type === 'error' && c !== 'error') {
      c = 'error'
      break
    }
  }
  return c
})

const badgeColor = computed(() => {
  if (color.value === 'transparent') return 'info'
  return color.value
})

function classes (n: AppNotification) {
  return `notification-${n.type}`
}

function handleClear (n: AppNotification) {
  typedDispatch('notifications/clearNotification', n)
}

function handleClearAll () {
  typedDispatch('notifications/clearAll')
}

function handleAnnouncementDismiss (n: AppNotification, wake_time: number) {
  if (n && wake_time) {
    typedDispatch('announcements/dismiss', {
      entry_id: n.id,
      wake_time
    })

    menu.value = false
  }
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  :deep(.app-notifications .v-list-item__action.notification-suffix),
  :deep(.app-notifications .v-list-item__action.notification-clear) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-self: stretch !important;
    border-left: thin solid rgba(map-get($shades, 'white'), 0.12);
  }

  :deep(.app-notifications .v-list-item__action.notification-suffix) {
    padding: 0 0 0 12px;
  }

  :deep(.app-notifications .v-list-item__action.notification-clear) {
    padding: 0 0 0 8px;
    margin-right: -8px;
  }

:deep(.app-notifications .v-list-item__action.notification-clear-all) {
    margin-right: -8px;
  }

  :deep(.app-notifications .v-list-item .v-list-item__subtitle.notification-timestamp) {
    color: rgba(255, 255, 255, 0.47);
  }

  .theme--light :deep(.app-notifications .v-list-item .v-list-item__subtitle.notification-timestamp) {
    color: rgba(0, 0, 0, 0.47);
  }

  :deep(.app-notifications .v-list-item .v-list-item__subtitle.notification-description) {
    font-style: italic;
    color: rgba(255, 255, 255, 0.60);
  }

  .theme--light :deep(.app-notifications .v-list-item .v-list-item__subtitle.notification-description) {
    color: rgba(0, 0, 0, 0.60);
  }

  :deep(.notification-description) {
    -webkit-line-clamp: 5;
  }

  :deep(.notification-success),
  :deep(.notification-info),
  :deep(.notification-warning),
  :deep(.notification-error),
  :deep(.notification-announcement) {
    border-left: solid 3px;
  }

  :deep(.notification-success) {
    border-color: var(--v-success-base);
  }
  :deep(.notification-info),
  :deep(.notification-announcement) {
    border-color: var(--v-info-base);
  }
  :deep(.notification-warning) {
    border-color: var(--v-warning-base);
  }
  :deep(.notification-error) {
    border-color: var(--v-error-base);
  }
  :deep(.notification-temp) {
    font-size: 1.5rem;
  }
</style>

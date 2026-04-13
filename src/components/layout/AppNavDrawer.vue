<template>
  <v-navigation-drawer
    v-model="open"
    :color="$vuetify.theme.currentTheme.drawer"
    :mini-variant="!showSubNavigation"
    :floating="!showSubNavigation"
    clipped
    app
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <v-navigation-drawer
        :color="$vuetify.theme.currentTheme.drawer"
        mini-variant
        :value="open"
        class="pb-16 pb-sm-0"
      >
        <div
          v-if="isMobileViewport"
          :style="`height: ${$globals.HEADER_HEIGHT}px;`"
          class="app-icon"
        >
          <router-link :to="{ name: 'home' }">
            <app-icon />
          </router-link>
        </div>

        <div
          v-if="socketConnected && authenticated"
          class="nav-items"
        >
          <app-nav-item
            icon="$dash"
            exact
            to="home"
          >
            {{ $t('app.general.title.home') }}
          </app-nav-item>

          <app-nav-item
            icon="$console"
            to="console"
          >
            {{ $t('app.general.title.console') }}
          </app-nav-item>

          <app-nav-item
            icon="$cubeScan"
            to="gcode_preview"
          >
            {{ $t('app.general.title.gcode_preview') }}
          </app-nav-item>

          <app-nav-item
            icon="$files"
            to="jobs"
          >
            {{ $t('app.general.title.jobs') }}
          </app-nav-item>

          <app-nav-item
            v-if="supportsHistory"
            icon="$history"
            to="history"
          >
            {{ $t('app.general.title.history') }}
          </app-nav-item>

          <app-nav-item
            v-if="supportsTimelapse"
            icon="$video"
            to="timelapse"
          >
            {{ $t('app.general.title.timelapse') }}
          </app-nav-item>

          <app-nav-item
            icon="$tune"
            to="tune"
          >
            {{ $t('app.general.title.tune') }}
          </app-nav-item>

          <app-nav-item
            v-if="enableDiagnostics"
            icon="$chart"
            to="diagnostics"
          >
            {{ $t('app.general.title.diagnostics') }}
          </app-nav-item>

          <app-nav-item
            icon="$codeJson"
            to="configure"
          >
            {{ $t('app.general.title.configure') }}
          </app-nav-item>

          <app-nav-item
            icon="$desktopTower"
            to="system"
          >
            {{ $t('app.general.title.system') }}
          </app-nav-item>

          <app-nav-item
            icon="$cog"
            to="settings"
          >
            {{ $t('app.general.title.settings') }}
          </app-nav-item>
        </div>

        <template
          v-if="socketConnected && authenticated && !isMobileViewport && canEditLayout"
          #append
        >
          <v-tooltip right>
            <template #activator="{ attrs, on }">
              <app-btn
                icon
                large
                :color="layoutMode ? 'primary' : undefined"
                style="margin: 6px"
                v-bind="attrs"
                v-on="on"
                @click="layoutMode = !layoutMode"
              >
                <v-icon>$apps</v-icon>
              </app-btn>
            </template>
            <span>
              {{ $t('app.general.btn.adjust_layout') }}
            </span>
          </v-tooltip>
        </template>
      </v-navigation-drawer>

      <router-view
        v-if="showSubNavigation"
        name="navigation"
      />
    </v-row>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { useRoute } from 'vue-router/composables'

const props = defineProps<{
  value?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean | undefined): void
}>()

const open = computed({
  get: () => props.value,
  set: (value: boolean | undefined) => emit('input', value)
})

const { socketConnected, authenticated } = useStateMixin()
const { isMobileViewport } = useBrowserMixin()
const { typedGetters, typedState, typedCommit } = useStore()
const route = useRoute()

const supportsHistory = computed<boolean>(() => typedGetters['server/componentSupport']('history'))

const supportsTimelapse = computed<boolean>(() => typedGetters['server/componentSupport']('timelapse'))

const enableDiagnostics = computed<boolean>(() => typedState.config.uiSettings.general.enableDiagnostics)

const hasSubNavigation = computed(() => route.meta?.hasSubNavigation ?? false)

const showSubNavigation = computed(() => hasSubNavigation.value && socketConnected.value && authenticated.value)

const canEditLayout = computed(() => route.meta?.dashboard ?? false)

const layoutMode = computed({
  get: (): boolean => typedState.config.layoutMode,
  set: (val: boolean) => typedCommit('config/setLayoutMode', val)
})
</script>

<style lang="scss" scoped>
  .app-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.v-navigation-drawer.no-subnav > .v-navigation-drawer__border) {
     display: none;
  }
</style>

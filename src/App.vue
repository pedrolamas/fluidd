<template>
  <v-app
    class="fluidd"
    :class="{ 'no-pointer-events': dragState }"
  >
    <app-tools-drawer v-model="toolsdrawer" />
    <app-nav-drawer v-model="navdrawer" />

    <inline-svg
      v-if="showBackgroundLogo && !isMobileViewport"
      :src="logoSrc"
      class="background-logo"
    />

    <app-bar
      @toolsdrawer="handleToolsDrawerChange"
      @navdrawer="handleNavDrawerChange"
    />

    <flash-message
      v-if="flashMessageState"
      v-model="flashMessageState.open"
      :text="flashMessageState.text"
      :type="flashMessageState.type"
      :timeout="flashMessageState.timeout"
    />

    <v-btn
      v-if="isMobileViewport && socketConnected && authenticated"
      x-small
      fab
      fixed
      bottom
      left
      class="ml-2 mb-2"
      color="error"
      style="z-index: 2000"
      @click="emergencyStop()"
    >
      <v-icon>$estop</v-icon>
    </v-btn>

    <v-main :style="customBackgroundImageStyle">
      <v-container
        fluid
        :class="{
          'fill-height': $route.meta?.fillHeight ?? false,
          [['single', 'double', 'triple', 'quad'][columnCount - 1]]: true
        }"
        class="constrained-width pa-2 pa-sm-4"
      >
        <v-row
          v-if="
            (socketConnected && apiConnected) &&
              (!klippyReady || hasWarnings) &&
              !inLayout &&
              $route.name !== 'login'
          "
        >
          <v-col>
            <klippy-status-card />
          </v-col>
        </v-row>

        <router-view
          v-if="
            (socketConnected && apiConnected) ||
              (!authenticated && apiConnected)
          "
        />

        <register-service-worker />
      </v-container>

      <socket-disconnected
        v-if="
          (!socketConnected && !apiConnected) ||
            (!socketConnected && authenticated)"
      />

      <template v-if="socketConnected">
        <file-system-download-dialog />
        <file-system-upload-dialog />
        <updating-dialog />
        <spool-selection-dialog />
        <action-command-prompt-dialog />
        <keyboard-shortcuts-dialog />
        <manual-probe-dialog />
        <bed-screws-adjust-dialog />
        <screws-tilt-adjust-dialog />
        <mmu-edit-ttg-map-dialog />
      </template>
    </v-main>

    <app-footer />

    <app-drag-overlay
      v-model="dragState"
      :message="$t('app.file_system.overlay.drag_files_folders_upload').toString()"
      icon="$fileUpload"
    />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { LinkPropertyHref, MetaPropertyName } from 'vue-meta'

export default defineComponent({
  metaInfo () {
    const self = this as any

    const progress: number = Math.floor((self.$typedGetters?.['printer/getPrintProgress'] ?? 0) * 100)
    const printerPrinting: boolean = self.printerPrinting ?? false
    const primaryColor: string = self.$vuetify?.theme.currentTheme.primary?.toString() ?? ''
    const primaryOffsetColor: string = self.$vuetify?.theme.currentTheme['primary-offset']?.toString() ?? ''

    const progressStr = printerPrinting ? `[${progress}%]` : ''
    const instanceName: string = self.$typedState?.config.uiSettings.general.instanceName || ''
    const pageName = self.$route?.name
      ? self.$t(`app.general.title.${self.$route.name}`)
      : ''

    const pageTitle = [progressStr, instanceName, pageName].filter(Boolean).join(' | ')

    let iconDataUrl: string | undefined

    if (printerPrinting) {
      const favIconSize = 64
      const secondaryColor = 'rgba(128, 128, 128, 0.3)'
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = favIconSize
        canvas.height = favIconSize
        const percent = progress
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const lineWidth = 10
        const radius = favIconSize / 2 - lineWidth / 2
        const startAngle = 1.5 * Math.PI
        const endAngle = startAngle + (percent * 2 * Math.PI / 100)

        context.moveTo(centerX, centerY)
        context.beginPath()
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
        context.strokeStyle = secondaryColor
        context.lineWidth = lineWidth
        context.stroke()
        context.closePath()

        context.moveTo(centerX, centerY)
        context.beginPath()
        context.arc(centerX, centerY, radius, startAngle, endAngle, false)
        context.strokeStyle = primaryColor
        context.lineWidth = lineWidth
        context.stroke()

        iconDataUrl = canvas.toDataURL('image/png')
      }
    }

    if (!iconDataUrl) {
      const logoWithColor = `<svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g><path fill="${primaryOffsetColor}" d="m14.853 33.757 11.617 9.66q.196.169.419.287l.002.001.044.023.017.009.03.014.027.013.021.01.037.016.01.005c.263.111.54.173.817.185h.01l.044.002h.104l.046-.002h.007a2.3 2.3 0 0 0 .818-.186l.008-.003.041-.018.016-.007.03-.015.032-.015.014-.007.044-.023.004-.002a2.3 2.3 0 0 0 .419-.287l10.86-9.031 5.646 3.727L28 56 9.243 37.398Zm.409-14.452 11.425 7.35c.407.267.86.4 1.313.4s.905-.133 1.312-.4l11.426-7.349 8.737 4.462L28 41.628 6.525 23.767zM28 0l24.42 8.993L28 24.699 3.58 8.99Z" /><path fill="${primaryColor}" d="m28 0-.135.05h.15v24.64L52.42 8.991Zm12.738 19.307-11.425 7.347-.06.04a2.4 2.4 0 0 1-1.237.36v14.56l21.459-17.846zm-.347 15.08-10.86 9.031q-.196.167-.418.285l-.006.002-.043.024-.013.007-.033.016-.03.014-.015.007-.041.018-.008.004c-.263.112-.54.173-.819.185h-.007l-.045.002h-.037v12.002l18.021-17.87Z" /></g></svg>`
      iconDataUrl = `data:image/svg+xml;base64,${btoa(logoWithColor)}`
    }

    const pageIcon: LinkPropertyHref[] = [
      { rel: 'icon', type: 'image/svg+xml', sizes: '32x32', href: iconDataUrl },
      { rel: 'icon', type: 'image/svg+xml', sizes: '16x16', href: iconDataUrl }
    ]

    const pageMeta: MetaPropertyName[] = [
      { name: 'theme-color', content: primaryColor }
    ]

    return { title: pageTitle, link: pageIcon, meta: pageMeta }
  }
})
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router/composables'
import { EventBus } from '@/eventBus'
import { useStateMixin } from '@/composables/useStateMixin'
import { useFilesMixin } from '@/composables/useFilesMixin'
import { useBrowserMixin } from '@/composables/useBrowserMixin'
import { useStore } from '@/composables/useStore'
import { Waits } from '@/globals'
import FileSystemDownloadDialog from '@/components/widgets/filesystem/FileSystemDownloadDialog.vue'
import FileSystemUploadDialog from '@/components/widgets/filesystem/FileSystemUploadDialog.vue'
import SpoolSelectionDialog from '@/components/widgets/spoolman/SpoolSelectionDialog.vue'
import type { FlashMessage } from '@/types'
import { getFilesFromDataTransfer, hasFilesInDataTransfer } from '@/util/file-system-entry'
import type { ThemeConfig } from '@/store/config/types'
import ActionCommandPromptDialog from '@/components/common/ActionCommandPromptDialog.vue'
import KeyboardShortcutsDialog from '@/components/common/KeyboardShortcutsDialog.vue'
import { eventTargetIsContentEditable, keyboardEventToKeyboardShortcut } from '@/util/event-helpers'
import MmuEditTtgMapDialog from './components/widgets/mmu/MmuEditTtgMapDialog.vue'

const route = useRoute()
const { typedState, typedGetters, typedDispatch } = useStore()
const {
  socketConnected,
  apiConnected,
  authenticated,
  klippyReady,
  hasWarnings,
  printerPrinting,
  printerPaused,
  emergencyStop,
  cancelPrint,
  pausePrint,
  homeAll,
} = useStateMixin()
const { uploadFiles, createFileUrlWithToken } = useFilesMixin()
const { isMobileViewport } = useBrowserMixin()

const toolsdrawer = ref<boolean | undefined>(undefined)
const navdrawer = ref<boolean | undefined>(undefined)
const dragState = ref(false)
const customBackgroundImageStyle = ref<Record<string, string>>({})

const flashMessageState = ref<FlashMessage>({
  open: false,
  text: undefined,
  type: undefined
})

const theme = computed((): ThemeConfig => typedState.config.uiSettings.theme)
const showBackgroundLogo = computed(() => theme.value.backgroundLogo)
const logoSrc = computed(() => `${import.meta.env.BASE_URL}${theme.value.logo.src}`)

const inLayout = computed((): boolean => typedState.config.layoutMode)

const columnCount = computed((): number => typedState.config.containerColumnCount)

const fileDropRoot = computed(() => route.meta?.fileDropRoot)

const customStyleSheet = computed((): string | undefined =>
  typedGetters['config/getCustomThemeFile']('custom', ['.css'])
)

watch(customStyleSheet, async (value: string | undefined) => {
  if (!value) return

  const url = await createFileUrlWithToken(value, 'config')

  const oldCustomStylesheet = document.getElementById('customStylesheet')

  if (oldCustomStylesheet) {
    oldCustomStylesheet.setAttribute('href', url)
    return
  }

  const linkElement = document.createElement('link')

  linkElement.rel = 'stylesheet'
  linkElement.type = 'text/css'
  linkElement.id = 'customStylesheet'
  linkElement.href = url

  document.head.appendChild(linkElement)
})

const customBackgroundImage = computed((): string | undefined =>
  typedGetters['config/getCustomThemeFile']('background', ['.png', '.jpg', '.jpeg', '.gif'])
)

watch(customBackgroundImage, async (value: string | undefined) => {
  if (!value) return

  const url = await createFileUrlWithToken(value, 'config')

  customBackgroundImageStyle.value = {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  }
})

const enableKeyboardShortcuts = computed((): boolean =>
  typedState.config.uiSettings.general.enableKeyboardShortcuts
)

onMounted(() => {
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('dragenter', handleDragOver)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('drop', handleDrop)
  window.addEventListener('keydown', handleKeyDown, false)

  EventBus.bus.$on('flashMessage', (payload: FlashMessage) => {
    flashMessageState.value.text = (payload && payload.text) || undefined
    flashMessageState.value.type = (payload && payload.type) || undefined
    flashMessageState.value.timeout = (payload && payload.timeout !== undefined) ? payload.timeout : undefined
    flashMessageState.value.open = true
  })

  const legacyElementsSelectors = [
    "link[rel*='icon'][type='image/png']",
    "meta[name='theme-color']"
  ]

  for (const legacyElementsSelector of legacyElementsSelectors) {
    const legacyElements = document.querySelectorAll(legacyElementsSelector)

    legacyElements.forEach(item => {
      const parentElement = item.parentElement

      if (parentElement) {
        parentElement.removeChild(item)
      }
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('dragover', handleDragOver)
  window.removeEventListener('dragenter', handleDragOver)
  window.removeEventListener('dragleave', handleDragLeave)
  window.removeEventListener('drop', handleDrop)
  window.removeEventListener('keydown', handleKeyDown)
})

function handleToolsDrawerChange () {
  toolsdrawer.value = !toolsdrawer.value
}

function handleNavDrawerChange () {
  navdrawer.value = !navdrawer.value
}

function handleDragOver (event: DragEvent) {
  if (
    socketConnected.value &&
    authenticated.value &&
    fileDropRoot.value &&
    event.dataTransfer &&
    hasFilesInDataTransfer(event.dataTransfer)
  ) {
    event.preventDefault()

    dragState.value = true

    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragLeave (event: DragEvent) {
  if (fileDropRoot.value) {
    event.preventDefault()

    if (
      event.target instanceof HTMLElement &&
      event.target.className.includes('fluidd')
    ) {
      dragState.value = false
    }
  }
}

async function handleDrop (event: DragEvent) {
  const root = fileDropRoot.value

  if (root) {
    event.preventDefault()

    dragState.value = false

    if (event.dataTransfer) {
      const files = await getFilesFromDataTransfer(event.dataTransfer)

      if (files) {
        const pathWithRoot: string = typedGetters['files/getCurrentPathByRoot'](root)
        const path = pathWithRoot === root
          ? ''
          : pathWithRoot.substring(root.length + 1)

        const wait = `${Waits.onFileSystem}/${pathWithRoot}/`

        typedDispatch('wait/addWait', wait)

        await uploadFiles(files, path, root, false)

        typedDispatch('wait/removeWait', wait)
      }
    }
  }
}

function handleKeyDown (event: KeyboardEvent) {
  if (!enableKeyboardShortcuts.value) {
    return
  }

  const shortcut = keyboardEventToKeyboardShortcut(event)

  if (shortcut === 'Ctrl+Shift+E') {
    event.preventDefault()

    emergencyStop()

    return
  }

  if (
    !klippyReady.value ||
    eventTargetIsContentEditable(event)
  ) {
    return
  }

  switch (shortcut) {
    case 'Shift+C':
      if (printerPrinting.value || printerPaused.value) {
        event.preventDefault()

        cancelPrint()
      }
      break

    case 'Shift+P':
      if (printerPrinting.value) {
        event.preventDefault()

        pausePrint()
      }
      break

    case 'Shift+H':
      if (!printerPrinting.value) {
        event.preventDefault()

        homeAll()
      }
      break
  }
}
</script>

<style lang="scss" scoped>
  .background-logo {
    pointer-events: none;
    position: fixed;
    width: 50%;
    height: auto;
    right: -10%;
    bottom: -20%;
    opacity: 8%;
  }
</style>

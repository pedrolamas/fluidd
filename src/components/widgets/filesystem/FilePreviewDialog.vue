<template>
  <app-dialog
    v-model="open"
    :title="filename"
    :width="calculatedWidth"
    no-actions
  >
    <v-card-text class="py-4">
      <v-layout
        v-if="!isMarkdown"
        justify-center
      >
        <video
          v-if="isVideo"
          controls
          disablePictureInPicture
          playsinline
        >
          <source
            :src="src"
            :type="type"
          >
        </video>

        <img
          v-else-if="isImage"
          :src="src"
        >

        <div v-else>
          {{ $t('app.general.simple_form.msg.no_file_preview', { name: (extension ? `${extension} files` : filename) }) }}
        </div>
      </v-layout>

      <div
        v-else-if="renderedMarkdown"
        v-safe-html="renderedMarkdown"
        class="markdown-container"
      />
    </v-card-text>

    <template v-if="file">
      <v-divider />

      <v-card-actions class="pt-4">
        <v-spacer />
        <app-btn
          v-if="!readonly"
          text
          color="error"
          @click="$emit('remove', file)"
        >
          <v-icon>$delete</v-icon>
          {{ $t('app.general.btn.remove') }}
        </app-btn>
        <app-btn
          color="primary"
          @click="$emit('download', file)"
        >
          <v-icon>$download</v-icon>
          {{ $t('app.general.btn.download') }}
        </app-btn>
      </v-card-actions>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/composables/useStore'
import { useVuetify } from '@/composables/useVuetify'
import type { AppFile } from '@/store/files/types'
import { Marked, type MarkedExtension, type Tokens } from 'marked'
import { baseUrl } from 'marked-base-url'
import { consola } from 'consola'

const props = defineProps<{
  value?: boolean
  path?: string
  file?: AppFile
  filename: string
  extension?: string
  src: string
  type: string
  width?: number
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'remove', file: AppFile): void
  (e: 'download', file: AppFile): void
}>()

const open = computed({
  get: () => props.value,
  set: (v) => emit('input', v ?? false)
})

const { typedState } = useStore()
const vuetify = useVuetify()

const renderedMarkdown = ref<string | null>(null)

const calculatedWidth = computed(() => {
  const defaultWidth = window.innerWidth * (vuetify.breakpoint.mdAndDown ? 1 : 0.75)
  return Math.min(window.innerWidth * 0.9, Math.max(props.width ?? defaultWidth, defaultWidth / 2))
})

const isVideo = computed(() => props.type.startsWith('video/'))
const isImage = computed(() => props.type.startsWith('image/'))
const isMarkdown = computed(() => props.type.startsWith('text/markdown'))

const apiUrl = computed((): string => typedState.config.apiUrl)

async function loadMarkdown () {
  if (!props.path) {
    consola.error('[FilePreviewDialog] missing path property in markdown viewer')
    return
  }

  const response = await fetch(props.src)
  const data = await response.text()

  const apiFileUrl = `${apiUrl.value}/server/files/${props.path}/`

  const baseUrlExtension = baseUrl(apiFileUrl)

  const customExtension: MarkedExtension = {
    renderer: {
      link (args: Tokens.Link) {
        const html = this.constructor.prototype.link.call(this, args)

        return html.replace(/^<a /, '<a target="_blank" ')
      }
    }
  }

  const marked = new Marked(baseUrlExtension, customExtension)

  renderedMarkdown.value = await marked.parse(data, {
    async: true
  })
}

onMounted(() => {
  if (isMarkdown.value) {
    loadMarkdown()
  }
})
</script>

<style lang="scss" scoped>
video, img {
  max-width: 100%;
  max-height: calc(90vh - 144px);
}

:deep(.markdown-container) {
  img {
    max-width: 100% !important;
  }

  table {
    border-collapse: collapse;

    th, td {
      border: 1px solid;
      padding: 2px 6px;
    }
  }

  pre > code {
    display: block;
  }

  * {
    margin-bottom: 1em;
  }
}
</style>

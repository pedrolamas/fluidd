import { computed } from 'vue'
import type { AppFile, FileUpload, AppFileThumbnail, FileDownload } from '@/store/files/types'
import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios'
import { httpClientActions, type AxiosRequestConfigForReturnType } from '@/api/httpClientActions'
import type { FileWithPath } from '@/types'
import { consola } from 'consola'
import { v4 as uuidv4 } from 'uuid'
import type { AppUser } from '@/store/auth/types'
import downloadUrl from '@/util/download-url'
import { SocketActions } from '@/api/socketActions'
import { Filters } from '@/plugins/filters'
import { useStore } from './useStore'
import { useConfirm } from './useConfirm'
import { useI18n } from './useI18n'

export function useFilesMixin () {
  const { typedState, typedDispatch } = useStore()
  const confirm = useConfirm()
  const { t, tc } = useI18n()

  const apiUrl = computed(() => typedState.config.apiUrl)

  const isTrustedUser = computed(() => {
    const currentUser: AppUser | null = typedState.auth.currentUser
    return currentUser?.username === '_TRUSTED_USER_'
  })

  function getThumbUrl (file: AppFile, root: string, path: string, large: boolean, date?: number) {
    const thumb = getThumb(file, root, path, large, date)
    return thumb?.url ?? ''
  }

  function getThumb (file: AppFile, root: string, path: string, large = true, date?: number): AppFileThumbnail | undefined {
    if (file.thumbnails?.length) {
      const thumb = file.thumbnails.reduce((a, b) => (a.size > b.size) === large ? a : b)
      if (thumb.relative_path) {
        const filepath = path ? `${root}/${path}` : root
        return {
          ...thumb,
          url: createFileUrl(thumb.relative_path, filepath, date)
        }
      }
    }
  }

  async function getGcode (file: AppFile) {
    const sizeInMB = file.size / 1024 / 1024
    const result = (
      sizeInMB < 100 ||
      await confirm(
        t('app.gcode.msg.confirm', {
          filename: file.filename,
          size: Filters.getReadableFileSizeString(file.size)
        }).toString(), {
          title: tc('app.general.title.gcode_preview'),
          color: 'card-heading',
          icon: '$error'
        })
    )
    if (result) {
      const path = file.path ? `gcodes/${file.path}` : 'gcodes'
      return await getFile<ArrayBuffer>(file.filename, path, file.size, { responseType: 'arraybuffer' })
    }
  }

  async function getFile<T = unknown> (filename: string, path: string, size = 0, options?: AxiosRequestConfigForReturnType<T>) {
    const currentDownload: FileDownload | null = typedState.files.download
    if (currentDownload) {
      currentDownload.abortController.abort()
      typedDispatch('files/removeFileDownload', currentDownload.uid)
    }

    const filepath = path ? `${path}/${filename}` : filename
    const uid = uuidv4()

    try {
      const abortController = new AbortController()

      typedDispatch('files/updateFileDownload', {
        uid,
        filepath,
        size,
        loaded: 0,
        percent: 0,
        speed: 0,
        abortController
      })

      if (options) {
        options = {
          ...options,
          signal: abortController.signal,
          onDownloadProgress: (event: AxiosProgressEvent) => {
            if (abortController.signal.aborted) return

            const progress = event.progress ?? (size > 0 ? event.loaded / size : 0)
            const payload: any = {
              uid,
              loaded: event.loaded,
              percent: Math.round(progress * 100),
              speed: event.rate ?? 0
            }

            if (event.total) {
              size = payload.size = event.total
            }

            typedDispatch('files/updateFileDownload', payload)
          }
        }
      }

      const response = await httpClientActions.serverFilesGet<T>(filepath, options)
      abortController.abort()
      return response
    } finally {
      typedDispatch('files/removeFileDownload', uid)
    }
  }

  async function downloadFile (filename: string, path: string) {
    const url = await createFileUrlWithToken(filename, path)
    downloadUrl(filename, url)
  }

  function createFileUrl (filename: string, path: string, date?: number) {
    const filepath = path ? `${path}/${filename}` : `${filename}`
    const encodedFilepath = filepath.replace(/[^/]+/g, match => encodeURIComponent(match))
    return `${apiUrl.value}/server/files/${encodedFilepath}?date=${date || Date.now()}`
  }

  async function createFileUrlWithToken (filename: string, path: string, date?: number) {
    const url = createFileUrl(filename, path, date)
    return isTrustedUser.value
      ? url
      : `${url}&token=${await SocketActions.accessOneshotToken()}`
  }

  async function uploadFile (file: File, path: string, root: string, andPrint: boolean, uid?: string, options?: AxiosRequestConfig) {
    const filepath = path ? `${path}/${file.name}` : file.name
    uid = uid || uuidv4()

    try {
      const abortController = new AbortController()

      typedDispatch('files/updateFileUpload', {
        uid,
        filepath,
        size: file.size,
        loaded: 0,
        percent: 0,
        speed: 0,
        cancelled: false,
        complete: false,
        abortController
      } satisfies FileUpload)

      const response = await httpClientActions.serverFilesUploadPost(file, path, root, andPrint, {
        ...options,
        signal: abortController.signal,
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (abortController.signal.aborted) return
          typedDispatch('files/updateFileUpload', {
            uid,
            loaded: event.loaded,
            percent: event.progress ? Math.round(event.progress * 100) : 0,
            speed: event.rate ?? 0
          })
        }
      })

      abortController.abort()
      return response
    } finally {
      typedDispatch('files/removeFileUpload', uid)
    }
  }

  async function uploadFiles (files: FileList | File[] | FileWithPath[], path: string, root: string, andPrint: boolean) {
    const fileUploads = [...files].map(file => {
      const uid = uuidv4()
      const [fullPath, fileObject] = 'path' in file
        ? [[path, file.path].filter(p => !!p).join('/'), file.file]
        : [path, file]

      const filepath = fullPath ? `${fullPath}/${fileObject.name}` : fileObject.name

      typedDispatch('files/updateFileUpload', {
        uid,
        filepath,
        size: fileObject.size,
        loaded: 0,
        percent: 0,
        speed: 0,
        cancelled: false,
        complete: false
      })

      return { uid, fullPath, fileObject }
    })

    if (fileUploads.length > 1) {
      andPrint = false
    }

    for (const fileUpload of fileUploads) {
      const currentUploads: FileUpload[] = typedState.files.uploads
      const fileState = currentUploads.find(u => u.uid === fileUpload.uid)

      if (fileState && !fileState?.cancelled) {
        try {
          await uploadFile(fileUpload.fileObject, fileUpload.fullPath, root, andPrint, fileUpload.uid)
        } catch (error: unknown) {
          consola.error('[FileUpload] file', error)
        }
      } else {
        typedDispatch('files/removeFileUpload', fileUpload.uid)
      }
    }
  }

  return {
    apiUrl,
    isTrustedUser,
    getThumbUrl,
    getThumb,
    getGcode,
    getFile,
    downloadFile,
    createFileUrl,
    createFileUrlWithToken,
    uploadFile,
    uploadFiles,
  }
}

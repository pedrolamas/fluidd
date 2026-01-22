import type _Vue from 'vue'
import { EventBus } from '@/eventBus'
import { consola } from 'consola'
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { Globals } from '@/globals'
import type { Store } from 'vuex'
import type { RootState } from '@/store/types'

const createHttpClient = (store: Store<RootState>) => {
  // Create a base instance with sane defaults.
  const httpClient = axios.create({
    withAuth: true,
    timeout: Globals.NETWORK_REQUEST_TIMEOUT
  })

  httpClient.defaults.headers.common['Content-Type'] = 'application/json'

  // For these paths, we force remove the withAuth flag.
  const unauthenticatedPaths = [
    // All paths are now unauthenticated via HTTP
    // File operations use oneshot tokens
  ]

  // For these paths, we don't emit an error because we handle them
  // downstream.
  const handledErrorRequests = {
    502: [
      '/server/files'
    ]
  }

  const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
    // With WebSocket-first approach, HTTP is only used for file operations.
    // No need to manage auth tokens here.
    return config
  }

  const responseInterceptor = (response: AxiosResponse) => {
    // With WebSocket-first approach, authentication is handled via WebSocket.
    // HTTP responses don't determine auth status.
    return response
  }

  const errorInterceptor = async (error: AxiosError<string | { error?: { message?: string } } | undefined>) => {
    let message: string | undefined

    // Check if its a network / server error.
    if (!error.response || error.code === 'ERR_NETWORK') {
    // Network / Server Error.
      if (error.message) message = error.message
      consola.debug(message || 'Network error')
      throw error
    }

    // All other errors
    if (typeof error.response.data === 'object') {
      message = error.response.data.error?.message
    } else {
      message = error.response.data
    }

    const url = error.config?.url || ''
    switch (error.response.status) {
      case 500:
        consola.debug(error.response.status, error.message, message)
        EventBus.$emit(message || 'Server error', { type: 'error' })
        break
      case 502:
        consola.debug(error.response.status, error.message, message)
        if (!handledErrorRequests[error.response.status].includes(url)) {
          EventBus.$emit(message || 'Server error', { type: 'error' })
        }
        break
      case 401:
        // 401 errors during HTTP requests indicate authentication issues.
        // Since auth is handled via WebSocket, we just log this.
        consola.debug('HTTP 401 error:', url, message)
        break
      case 404:
        consola.debug(error.response.status, error.message, message)
        // EventBus.$emit(message || 'Server error', { type: 'warning' })
        break
      default:
        consola.debug(error.response.status, error.message)
        EventBus.$emit(message || 'Server error', { type: 'error' })
    }

    throw error
  }

  httpClient.interceptors.request.use(requestInterceptor, errorInterceptor)
  httpClient.interceptors.response.use(responseInterceptor, errorInterceptor)

  return httpClient
}

// Extend axios config to include anything we may need.
declare module 'axios' {
  export interface AxiosRequestConfig {
    // Enables axios to redirect if we encounter a 401, and sets the
    // authenticated flag dependant on our responses.
    withAuth?: boolean;
  }
}

export const HttpClientPlugin = {
  install (Vue: typeof _Vue, options?: HttpClientPluginOptions) {
    if (!options?.store) {
      throw new Error('store is required')
    }

    const httpClient = createHttpClient(options.store)
    Vue.prototype.$httpClient = httpClient
    Vue.$httpClient = httpClient
  }
}

interface HttpClientPluginOptions {
  store?: Store<RootState>
}

declare module 'vue/types/vue' {
  interface Vue {
    $httpClient: ReturnType<typeof createHttpClient>;
  }

  interface VueConstructor {
    $httpClient: ReturnType<typeof createHttpClient>;
  }
}

import type { AuthState } from './types'

export const defaultState = (): AuthState => {
  return {
    authenticated: true,
    token: null,
    tokenString: null,
    refresh_token: null,
    refreshTokenString: null,
    currentUser: null,
    users: [],
    apiKey: ''
  }
}

export const state = defaultState()

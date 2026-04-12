import { getCurrentInstance } from 'vue'

export function useVuetify () {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useVuetify must be called within setup()')
  return instance.proxy!.$vuetify
}

import { getCurrentInstance } from 'vue'

export function useI18n () {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useI18n must be called within setup()')
  const proxy = instance.proxy!

  return {
    t: proxy.$t.bind(proxy) as typeof proxy.$t,
    tc: proxy.$tc.bind(proxy) as typeof proxy.$tc,
  }
}

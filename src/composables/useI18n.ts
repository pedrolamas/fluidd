import { getCurrentInstance } from 'vue'

export function useI18n () {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useI18n must be called within setup()')
  const proxy = instance.proxy!

  return {
    t: (key: string, ...args: any[]): string => proxy.$t(key, ...args as any) as string,
    tc: (key: string, ...args: any[]): string => proxy.$tc(key, ...args as any) as string,
  }
}

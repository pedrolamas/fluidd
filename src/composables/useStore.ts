import { getCurrentInstance } from 'vue'
import type { RootActions, RootGetters, RootMutations, RootState } from '@/store/types'

export function useStore () {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useStore must be called within setup()')
  const store = instance.proxy!.$store

  return {
    store,
    typedState: store.state as RootState,
    typedGetters: store.getters as RootGetters,
    typedCommit: ((...params: any[]) => (store.commit as any)(...params)) as RootMutations,
    typedDispatch: ((...params: any[]) => (store.dispatch as any)(...params)) as RootActions,
  }
}

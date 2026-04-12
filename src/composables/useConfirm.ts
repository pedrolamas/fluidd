import { getCurrentInstance } from 'vue'

export function useConfirm () {
  const instance = getCurrentInstance()
  if (!instance) throw new Error('useConfirm must be called within setup()')
  return instance.proxy!.$confirm
}

import { computed } from 'vue'
import isUserAgentDataMobileSupported from '@/util/is-user-agent-data-mobile-supported'
import { useVuetify } from './useVuetify'

export function useBrowserMixin () {
  const vuetify = useVuetify()

  const isMobileViewport = computed(() => vuetify.breakpoint.mobile)

  const isMobileUserAgent = computed(() => {
    if (isUserAgentDataMobileSupported(navigator)) {
      return navigator.userAgentData.mobile
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  })

  const isIOS = computed(() => (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  ))

  return { isMobileViewport, isMobileUserAgent, isIOS }
}

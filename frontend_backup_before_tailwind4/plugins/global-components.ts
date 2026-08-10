// plugins/global-components.ts
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppContainer from '~/components/common/AppContainer.vue'
import AppBadge from '~/components/ui/AppBadge.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('AppButton', AppButton)
  nuxtApp.vueApp.component('AppInput', AppInput)
  nuxtApp.vueApp.component('AppCard', AppCard)
  nuxtApp.vueApp.component('AppContainer', AppContainer)
  nuxtApp.vueApp.component('AppBadge', AppBadge)
})

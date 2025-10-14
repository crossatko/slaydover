import type { App } from 'vue'
import Slaydover from './components/Slaydover.vue'

const install = (app: App) => {
  app.component('Slaydover', Slaydover)
}

export type { Slaydover }
export default Object.assign(Slaydover, { install })

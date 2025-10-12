import type { App } from 'vue'
import Slaydover from './components/Slaydover.vue'

Slaydover.install = (app: App) => {
  app.component('Slaydover', Slaydover)
}

export default Slaydover

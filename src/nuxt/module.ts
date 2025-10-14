import { defineNuxtModule, addComponent, createResolver } from '@nuxt/kit'
import type { Nuxt, ModuleOptions } from '@nuxt/schema'

export default defineNuxtModule({
  meta: {
    name: '@crossatko/slaydover',
    configKey: 'slaydover'
  },
  setup(_options: ModuleOptions, nuxt: Nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addComponent({
      name: 'Slaydover',
      filePath: resolve('../slaydover.js'),
      export: 'default'
    })

    nuxt.options.css.push(resolve('../slaydover.css'))
  }
})

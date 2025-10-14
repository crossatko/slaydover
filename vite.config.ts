import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    lib: {
      entry: {
        slaydover: path.resolve(__dirname, 'src/main.ts'),
        nuxt: path.resolve(__dirname, 'src/nuxt/module.ts')
      },
      name: 'Slaydover',

      formats: ['cjs', 'es'],

      fileName: (format, entryName) => {
        if (entryName === 'nuxt') {
          return 'nuxt/module.mjs'
        }

        const extension = format === 'es' ? 'js' : 'cjs'
        return `slaydover.${extension}`
      }
    },
    rollupOptions: {
      external: ['vue', '@nuxt/kit', '@nuxt/schema'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})

import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
  },
})

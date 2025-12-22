import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', {
  state: () => {
    const saved = localStorage.getItem('theme') as ThemeMode | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme: ThemeMode = saved || (prefersDark ? 'dark' : 'dark') // 默认暗色模式

    // 应用主题
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }

    return {
      mode: theme,
    }
  },
  actions: {
    toggle() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      this.apply()
    },
    set(mode: ThemeMode) {
      this.mode = mode
      this.apply()
    },
    apply() {
      if (this.mode === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', this.mode)
    },
  },
})


import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', {
  state: () => {
    const saved = localStorage.getItem('theme') as ThemeMode | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme: ThemeMode = saved || (prefersDark ? 'dark' : 'light')

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
      isTransitioning: false,
    }
  },
  actions: {
    toggle(event?: MouseEvent) {
      if (this.isTransitioning) return

      const newMode = this.mode === 'dark' ? 'light' : 'dark'

      if (event) {
        this.toggleWithCircleAnimation(event, newMode)
      } else {
        this.mode = newMode
        this.apply()
      }
    },

    toggleWithCircleAnimation(event: MouseEvent, newMode: ThemeMode) {
      this.isTransitioning = true

      const x = event.clientX
      const y = event.clientY
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      // 使用旧主题的背景色作为遮罩
      const oldBgColor = this.mode === 'dark' ? '#0f172a' : '#F5F7FA'

      // 创建旧主题遮罩层
      const overlay = document.createElement('div')
      overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;background:${oldBgColor}`
      document.body.appendChild(overlay)

      // 立即切换主题（在遮罩下面）
      this.mode = newMode
      this.apply()

      // 等待一帧确保主题已应用
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 遮罩从全屏缩小到按钮位置，露出新主题
          const animation = overlay.animate(
            [
              { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
              { clipPath: `circle(0px at ${x}px ${y}px)` },
            ],
            {
              duration: 600,
              easing: 'ease-in-out',
              fill: 'forwards',
            }
          )

          animation.onfinish = () => {
            overlay.remove()
            this.isTransitioning = false
          }
        })
      })
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

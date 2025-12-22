import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router from './router'
import setupRouterGuard from './router/guard'
import { setupDirectives } from './directives'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css'
import { useThemeStore } from './store/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setActivePinia(pinia)

// 初始化主题
useThemeStore()

setupRouterGuard(router)
setupDirectives(app)
app.use(router)
app.use(ElementPlus)

app.mount('#app')

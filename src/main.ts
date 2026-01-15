import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './app/App.vue'
import './styles/main.css'
import { useTheme } from './theme/useTheme'

// Initialize theme BEFORE app mount to prevent flicker
const { initTheme } = useTheme()
initTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

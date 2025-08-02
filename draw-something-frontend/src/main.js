import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import 'virtual:uno.css'
import './assets/index.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import 'flowbite'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(store)
app.use(pinia)

app.mount('#app')

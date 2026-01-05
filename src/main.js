import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales'
import 'flowbite'
import 'vue-sonner/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(store)
app.use(pinia)
app.use(i18n)

app.mount('#app')

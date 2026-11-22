import './assets/main.css'
import 'ol/ol.css'
import './assets/openlayer.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

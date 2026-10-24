import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/anton/400.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.vue'
import { registerUpdates } from './core/registerUpdates'

createApp(App).use(createPinia()).mount('#app')
registerUpdates()

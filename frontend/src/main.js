import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import Swal from './plugins/sweetalert'

createApp(App).use(vuetify).use(router).use(Swal).mount('#app')
